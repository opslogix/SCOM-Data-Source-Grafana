package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/opslogix/scom-plugin-by-opslogix/pkg/models"
)

var (
	_ backend.QueryDataHandler      = (*ScomDatasource)(nil)
	_ backend.CheckHealthHandler    = (*ScomDatasource)(nil)
	_ instancemgmt.InstanceDisposer = (*ScomDatasource)(nil)
	_ backend.CallResourceHandler   = (*ScomDatasource)(nil)
)

// NewDatasource creates a new datasource instance for each unique configuration
func NewDatasource(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {

	httpClientOptions, err := settings.HTTPClientOptions(ctx)
	if err != nil {
		return nil, fmt.Errorf("http client options: %w", err)
	}

	pluginSettings, err := models.LoadPluginSettings(settings)
	if err != nil {
		return nil, fmt.Errorf("plugin settings: %w", err)
	}

	client, err := NewScomClient(httpClientOptions, pluginSettings)
	if err != nil {
		return nil, fmt.Errorf("scom client initialization: %w", err)
	}

	return &ScomDatasource{
		settings: settings,
		client:   client,
	}, nil
}

type ScomDatasource struct {
	settings backend.DataSourceInstanceSettings
	client   *ScomClient
}

func (d *ScomDatasource) Dispose() {
	// Clean up datasource instance resources.
}

func (d *ScomDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// headers := req.GetHTTPHeaders()

	var (
		response = NewResponse(backend.NewQueryDataResponse())
		wg       = sync.WaitGroup{}
	)

	wg.Add(len(req.Queries))

	for _, q := range req.Queries {
		go func(query backend.DataQuery) {
			frames, err := d.handleQuery(query)

			// //TODO: Get correct errorsource
			response.Set(query.RefID, backend.DataResponse{
				Frames:      frames,
				Error:       err,
				ErrorSource: backend.ErrorSourceDownstream,
			})

			wg.Done()
		}(q)
	}

	wg.Wait()

	//TODO: Return errors?

	return response.Response(), nil
}

// Comes from Grafanas onChange() function from the frontend.
// type queryModel struct {
// 	Category string `json:"category"`
// 	ToFetch  string `json:"toFetch"`
// 	// Performance data.
// 	PerformanceCounterName              string                        `json:"performanceCounterName"`
// 	PerformanceCounterObjectName        string                        `json:"performanceCounterObjectName"`
// 	PerformanceCounterInstanceName      string                        `json:"performanceCounterInstanceName"`
// 	PerformanceGroupCounterName         string                        `json:"performanceGroupCounterName"`
// 	PerformanceGroupCounterObjectName   string                        `json:"performanceGroupCounterObjectName"`
// 	PerformanceGroupCounterInstanceName string                        `json:"performanceGroupCounterInstanceName"`
// 	PerformanceObjects                  []models.ScomMonitoringObject `json:"performanceObjects"`
// 	PerformanceObjectId                 string                        `json:"performanceObjectId"`
// 	// Health state.
// 	HealthStateObjects   []models.ScomMonitoringObject `json:"healthStateObjects"`
// 	HealthStateObjectIds []string                      `json:"healthStateObjectIds"`

// 	SelectedClassName  string `json:"selectedClassName"`
// 	HealthStateClassId string `json:"healthStateClassId"`
// 	HealthStateGroupId string `json:"healthStateGroupId"`
// 	// Alert.
// 	AlertsCriteria string `json:"alertsCriteria"`
// }

func (d *ScomDatasource) handleQuery(query backend.DataQuery) (data.Frames, error) {
	var qm models.QueryModel
	if err := json.Unmarshal(query.JSON, &qm); err != nil {
		return nil, err
	}

	if qm.Type == "" {
		return nil, nil
	}

	type fetchHandler func() (data.Frames, error)
	fetchMap := map[string]fetchHandler{
		"performance": func() (data.Frames, error) {
			if qm.Counters == nil || qm.Instances == nil {
				return nil, fmt.Errorf("counters and Instances are required")
			}

			duration := int(query.TimeRange.Duration().Minutes())
			performanceData, err := d.client.GetPerformanceData(duration, qm.Instances, qm.Counters)
			if err != nil {
				return nil, err
			}
			return d.buildPerformanceFrame(performanceData, qm.Counters[0].CounterName+" "+qm.Instances[0].DisplayName), nil
		},
		"alerts": func() (data.Frames, error) {
			criteria := "Severity = 2 and ResolutionState = 0"
			if qm.Criteria != "" {
				trimmedCriteria := strings.TrimSpace(qm.Criteria)
				if len(trimmedCriteria) > 0 {
					criteria = trimmedCriteria
				}
			}
			alerts, err := d.client.GetAlerts(criteria)
			if err != nil {
				return nil, err
			}
			return d.buildAlertsFrame(alerts), nil
		},
		"state": func() (data.Frames, error) {

			if len(qm.Instances) > 0 {
				states, err := d.client.GetHealthStateForObjects(qm.Instances)
				if err != nil {
					return nil, err
				}

				return d.buildHealthStateFrame(states, qm.Instances), nil
			}

			if len(qm.Groups) > 0 && len(qm.Classes) > 0 {
				states, err := d.client.GetStateData(qm.Groups[0].ID, qm.Classes[0].ID)
				if err != nil {
					return nil, err
				}

				return d.buildHealthStateGroupFrame(states), nil
			}

			return nil, nil
		},
	}

	if handler, exists := fetchMap[qm.Type]; exists {
		return handler()
	}

	return nil, fmt.Errorf("unexpected value of Type: %s", qm.Type)
}

func (d *ScomDatasource) buildPerformanceFrame(performanceData []models.PerformanceResponse, name string) data.Frames {
	if name == "" {
		name = "Performance"
	}
	frame := data.NewFrame(name)

	// Define field structure
	timeField := data.NewField("Time", nil, []time.Time{})
	valueField := data.NewField("Value", nil, []float64{})
	objectIdField := data.NewField("Object id", nil, []string{})
	objectDisplayNameField := data.NewField("Object display name", nil, []string{})
	objectPathField := data.NewField("Object paths", nil, []string{})
	objectFullNameField := data.NewField("Object full name", nil, []string{})
	// Process each performance data entry
	for _, entry := range performanceData {
		for _, dataset := range entry.Datasets {
			keys := make([]string, 0, len(dataset.Data))
			for key := range dataset.Data {
				keys = append(keys, key)
			}
			sort.Strings(keys)

			for _, timeStr := range keys {
				timeVal, err := time.Parse(time.RFC3339, timeStr)
				if err != nil {
					backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("Error parsing time: %v", err))
					continue
				}

				value, ok := dataset.Data[timeStr].(float64)
				if !ok {
					backend.ErrDataResponse(backend.StatusBadRequest, "Invalid value type")
					continue
				}

				timeField.Append(timeVal)
				valueField.Append(value)
				objectIdField.Append(entry.ObjectId)
				objectDisplayNameField.Append(entry.ObjectDisplayName)
				objectPathField.Append(entry.ObjectPath)
				objectFullNameField.Append(entry.ObjectFullName)
			}
		}
	}

	// Append fields to the frame
	frame.Fields = append(frame.Fields, timeField, valueField, objectIdField, objectDisplayNameField, objectPathField, objectFullNameField)
	return data.Frames{frame}
}

func (d *ScomDatasource) buildAlertsFrame(alerts models.ScomAlert) data.Frames {
	frame := data.NewFrame("data")

	rowCount := len(alerts.Rows)

	// Preallocate slices for efficiency
	alertIds := make([]string, rowCount)
	alertSeverities := make([]string, rowCount)
	alertObjectDisplayNames := make([]string, rowCount)
	alertNames := make([]string, rowCount)
	alertAges := make([]string, rowCount)
	alertAgesMillis := make([]float64, rowCount)
	alertRepeatCounts := make([]int64, rowCount)
	alertDescriptions := make([]string, rowCount)

	for i, alert := range alerts.Rows {
		alertIds[i] = alert.ID
		alertSeverities[i] = alert.Severity
		alertObjectDisplayNames[i] = alert.MonitoringObject
		alertNames[i] = alert.Name
		alertAges[i] = alert.Age
		alertAgesMillis[i] = alert.AgeInMilliseconds
		alertRepeatCounts[i] = alert.RepeatCount
		alertDescriptions[i] = alert.Description
	}

	frame.Fields = append(frame.Fields,
		data.NewField("ID", nil, alertIds),
		data.NewField("Name", nil, alertNames),
		data.NewField("Severity", nil, alertSeverities),
		data.NewField("Description", nil, alertDescriptions),
		data.NewField("Object display name", nil, alertObjectDisplayNames),
		data.NewField("Age", nil, alertAges),
		data.NewField("Ages (milliseconds)", nil, alertAgesMillis),
		data.NewField("Repeat counts", nil, alertRepeatCounts),
	)

	return data.Frames{frame}
}

func (d *ScomDatasource) buildHealthStateFrame(healthStates []models.MonitoringDataResponse, objectData []models.MonitoringObject) data.Frames {
	frame := data.NewFrame("states")

	// Flatting objects data and using id as key, in order to match it with health state data.
	objectDataMap := make(map[string]models.MonitoringObject)
	for _, data := range objectData {
		objectDataMap[data.ID] = data
	}

	var ids []string
	var classHealthStates []string
	var alertCount []string
	var displayName []string
	var className []string
	var fullName []string
	var path []string

	for _, healthState := range healthStates {
		// Data from health state request.
		ids = append(ids, healthState.ObjectID)
		classHealthStates = append(classHealthStates, healthState.HealthState)
		alertCount = append(alertCount, strconv.Itoa(healthState.AlertCount))

		// Data from objects request.
		// Match by id and added to the health state.
		if objData, ok := objectDataMap[healthState.ObjectID]; ok {
			displayName = append(displayName, objData.DisplayName)
			className = append(className, objData.ClassName)
			fullName = append(fullName, objData.FullName)
			path = append(path, objData.Path)
		}
	}

	frame.Fields = append(frame.Fields,
		data.NewField("Id", nil, ids),
		data.NewField("Health state", nil, classHealthStates),
		data.NewField("Alert count", nil, alertCount),
		data.NewField("Class instance name", nil, displayName),
		data.NewField("Class name", nil, className),
		data.NewField("Full name", nil, fullName),
		data.NewField("Path", nil, path),
	)

	return data.Frames{frame}
}

func (d *ScomDatasource) buildHealthStateGroupFrame(healthStateGroup models.StateDataResponse) data.Frames {
	frame := data.NewFrame("healthStateGroupData")

	rowCount := len(healthStateGroup.Rows)

	// Preallocate slices for efficiency
	ids := make([]string, rowCount)
	healthStates := make([]string, rowCount)
	displayNames := make([]string, rowCount)
	paths := make([]string, rowCount)
	maintenanceModes := make([]string, rowCount)

	for i, value := range healthStateGroup.Rows {
		ids[i] = value.ID
		healthStates[i] = value.HealthState
		displayNames[i] = value.DisplayName
		paths[i] = value.Path
		maintenanceModes[i] = value.MaintenanceMode
	}

	frame.Fields = append(frame.Fields,
		data.NewField("Id", nil, ids),
		data.NewField("Health state", nil, healthStates),
		data.NewField("Name", nil, displayNames),
		data.NewField("Path", nil, paths),
		data.NewField("Maintenance mode", nil, maintenanceModes),
	)

	return data.Frames{frame}
}

// Called from datasource.getResource() from the frontend.
func (d *ScomDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	parsedURL, err := url.Parse(req.URL)
	if err != nil {
		return fmt.Errorf("failed to parse URL: %w", err)
	}

	query := parsedURL.Query()

	handlers := map[string]func() (interface{}, error){
		"getClasses": func() (interface{}, error) {
			return d.client.GetClassesByDisplayName(query.Get("query"))
		},
		"getObjects": func() (interface{}, error) {
			return d.client.GetObjectsByClass(query.Get("className"))
		},
		"getCounters": func() (interface{}, error) {
			return d.client.GetPerformanceCounters(query.Get("performanceObjectId"))
		},
		"getObjectsHealthState": func() (interface{}, error) {
			return d.client.GetObjectsByClass(query.Get("selectedClassNameHealthState"))
		},
		"getGroups": func() (interface{}, error) {
			return d.client.GetGroups(query.Get("groupQueryCriteria"))
		},
		"getObjectsByGroup": func() (interface{}, error) {
			return d.client.GetStateData(query.Get("groupId"), query.Get("classIdGroup"))
		},
	}

	handler, exists := handlers[req.Path]
	if !exists {
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusNotFound,
			Body:   []byte("not Found"),
		})
	}

	result, err := handler()
	if err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusBadRequest,
			Body:   []byte(fmt.Sprintf("error: %v", err.Error())),
		})
	}

	data, err := json.Marshal(result)
	if err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusInternalServerError,
			Body:   []byte("failed to marshal response"),
		})
	}

	return sender.Send(&backend.CallResourceResponse{
		Status: http.StatusOK,
		Body:   data,
	})
}

// This function is called when user enters name, password and url for using the plugin.
func (d *ScomDatasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk
	var message = "Data source is working"

	settings, err := models.LoadPluginSettings(*req.PluginContext.DataSourceInstanceSettings)
	if err != nil {
		status = backend.HealthStatusError
		message = "Loading plugin settings failed, check logs for more details"
		log.Println("ERROR: ", err)
	}

	_, err = Authenticate(settings.Url, settings.UserName, settings.Secrets.Password, settings.IsSkipTlsVerifyCheck)
	if err != nil {
		status = backend.HealthStatusError
		message = "Wrong credentials for SCOM, check logs for more details"
		log.Println("ERROR: ", err)
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}
