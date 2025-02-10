package plugin

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/opslogix/scom-plugin-by-opslogix/pkg/models"
)

// Custom API Client
type ScomClient struct {
	settings   *models.PluginSettings
	httpClient *http.Client
}

// NewScomClient initializes a scom client with authentication middleware
func NewScomClient(httpOptions httpclient.Options, settings *models.PluginSettings) (*ScomClient, error) {
	//Authenticate
	tokens, err := Authenticate(settings.Url, settings.UserName, settings.Secrets.Password, settings.IsSkipTlsVerifyCheck)
	if err != nil {
		return nil, fmt.Errorf("failed to authenticate: %v", err)
	}

	httpOptions.ConfigureTLSConfig = func(opts httpclient.Options, tlsConfig *tls.Config) {
		tlsConfig.InsecureSkipVerify = settings.IsSkipTlsVerifyCheck
	}

	httpOptions.Middlewares = append(httpOptions.Middlewares, httpclient.MiddlewareFunc(AuthMiddleware(tokens)))
	httpOptions.Timeouts.Timeout = time.Second * 10

	client, err := httpclient.New(httpOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP client: %v", err)
	}

	return &ScomClient{
		settings:   settings,
		httpClient: client,
	}, nil
}

func AuthMiddleware(tokens AuthTokens) httpclient.MiddlewareFunc {
	return httpclient.MiddlewareFunc(func(opts httpclient.Options, next http.RoundTripper) http.RoundTripper {
		return httpclient.RoundTripperFunc(func(req *http.Request) (*http.Response, error) {
			req.Header.Set("Authorization", "Basic "+tokens.AuthToken)
			req.Header.Set("SCOM-CSRF-TOKEN", tokens.CSRFToken)
			req.Header.Set("Cookie", tokens.SessionID)
			req.Header.Set("Content-Type", "application/json")

			return next.RoundTrip(req)
		})
	})
}

func requestToType[T any](client *ScomClient, method, endpoint string, body interface{}) (T, error) {

	resp, err := client.request(method, endpoint, body)
	if err != nil {
		return *new(T), fmt.Errorf("failed to send request: %w", err)
	}

	defer resp.Body.Close() // Ensure response body is closed

	// Handle non-200 responses
	if resp.StatusCode != http.StatusOK {
		responseData, _ := io.ReadAll(resp.Body) // Read response body to include in the error message
		return *new(T), fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(responseData))
	}
	// responseData, _ := io.ReadAll(resp.Body)
	// test := string(responseData)
	// fmt.Println(test)
	// Deserialize JSON if body exists
	var responseBody T
	if resp.ContentLength != 0 {
		if err := json.NewDecoder(resp.Body).Decode(&responseBody); err != nil {
			return *new(T), fmt.Errorf("failed to deserialize response body: %w", err)
		}
	}

	return responseBody, nil
}

// Request performs an HTTP request and returns the response content as a generic type.
func (c *ScomClient) request(method, endpoint string, body interface{}) (*http.Response, error) {
	var reqBody io.Reader
	if body != nil {
		// Marshal the body to JSON
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	// Create the HTTP request
	req, err := http.NewRequest(method, c.settings.Url+endpoint, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Send the request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	return resp, err
}

// https://learn.microsoft.com/en-us/rest/api/operationsmanager/data/retrieves-alert-data?tabs=HTTP
func (c *ScomClient) GetAlerts(criteria string) (models.ScomAlert, error) {
	// TODO: displayColumns does not include monitoringclassid
	body := map[string]interface{}{
		"criteria":       criteria,
		"displayColumns": []string{"severity", "monitoringobjectdisplayname", "name", "age", "repeatcount", "description", "monitoringobjectid", "monitoringclassid"},
		"classId":        "",
	}

	result, err := requestToType[models.ScomAlert](c, "POST", "/OperationsManager/data/alert", body)
	if err != nil {
		return result, fmt.Errorf("")
	}
	return result, err
}

// https://learn.microsoft.com/en-us/rest/api/operationsmanager/data/retrieve-state-data?tabs=HTTP
func (c *ScomClient) GetStateData(classId string, groupId string, objectIds []string, criteria string) ([]models.StateDataRow, error) {
	//Either classId or groupId should be provided

	//ObjectIds is probably an array of strings?
	body := models.StateDataRequestBody{
		ClassID:        classId,
		GroupID:        groupId,
		ObjectIds:      objectIds,
		Criteria:       criteria,
		DisplayColumns: []string{"healthstate", "displayname", "path", "maintenancemode"},
	}

	result, err := requestToType[models.StateDataResponse](c, "POST", "/OperationsManager/data/state", body)
	if err != nil {
		return []models.StateDataRow{}, err
	}

	return result.Rows, nil
}

// https://learn.microsoft.com/en-us/rest/api/operationsmanager/data/retrieve-monitoring-data?tabs=HTTP
func (c *ScomClient) GetMonitoringData(ids []string) ([]models.MonitoringDataResponse, error) {
	var (
		result []models.MonitoringDataResponse
		wg     = sync.WaitGroup{}
	)

	wg.Add(len(ids))

	for _, _id := range ids {
		go func(id string) {
			healthStateData, err := requestToType[models.MonitoringDataResponse](c, "GET", "/OperationsManager/data/monitoring/"+id, nil)
			if err == nil {
				result = append(result, healthStateData)
			} else {
				//maybe log ?
			}

			wg.Done()
		}(_id)
	}

	wg.Wait()

	return result, nil
}

func (c *ScomClient) GetPerformanceData(duration int, instances []models.MonitoringObject, counters []models.PerformanceCounter) ([]models.PerformanceResponse, error) {
	var performanceDataArray []models.PerformanceResponse

	for _, instance := range instances {
		requestBody := models.ScomPerformanceRequest{
			Duration:            duration,
			ID:                  instance.ID,
			PerformanceCounters: counters,
			// PerformanceCounters: []interface{}{
			// 	map[string]interface{}{
			// 		"countername":  counterName,
			// 		"objectname":   counterObjectName,
			// 		"instancename": counterInstanceName,
			// 	},
			// },
		}

		performanceData, err := requestToType[models.PerformanceResponse](c, "POST", "/OperationsManager/data/performance", requestBody)
		if err != nil {
			return []models.PerformanceResponse{}, err
		}

		// Adding object information to the performance data.
		performanceData.ObjectId = instance.ID
		performanceData.ObjectDisplayName = instance.DisplayName
		performanceData.ObjectPath = instance.Path
		performanceData.ObjectFullName = instance.FullName

		performanceDataArray = append(performanceDataArray, performanceData)
	}

	return performanceDataArray, nil
}

func (c *ScomClient) GetPerformanceCounters(objectId string) (models.PerformanceCounterData, error) {

	// models.PerformanceCounterData
	counters, err := requestToType[models.PerformanceCounterData](c, "GET", "/OperationsManager/data/performanceCounters/"+objectId, nil)
	if err != nil {
		return models.PerformanceCounterData{}, err
	}

	return counters, nil
}

func (c *ScomClient) GetClassesByDisplayName(query string) ([]models.MonitoringClass, error) {

	criteria := "DisplayName LIKE '%" + query + "%'"
	classes, err := requestToType[models.ScomClassResponse](c, "POST", "/OperationsManager/data/scomClasses", criteria)
	if err != nil {
		return []models.MonitoringClass{}, err
	}

	return classes.ScopeDatas, nil
}

func (c *ScomClient) GetGroups(query string) ([]models.ScomGroup, error) {
	criteria := "DisplayName LIKE '%%'"

	groups, err := requestToType[models.GroupResponse](c, "POST", "/OperationsManager/data/scomGroups", criteria)
	if err != nil {
		return nil, err
	}

	return groups.ScopeDatas, nil
}

// Do we really have to query like this?
func (c *ScomClient) GetObjects(objectIds []string) ([]models.MonitoringObject, error) {
	var objects []models.MonitoringObject
	for _, id := range objectIds {
		criteria := "Id = '" + id + "'"
		object, err := requestToType[models.ScomObjectResponse](c, "POST", "/OperationsManager/data/scomObjects", criteria)
		if err != nil {
			return nil, err
		}

		objects = append(objects, object.ScopeDatas...)
	}

	return objects, nil
}

func (c *ScomClient) GetObjectsByClass(className string) ([]models.MonitoringObject, error) {
	objects, err := requestToType[models.ObjectByClassResponse](c, "POST", "/OperationsManager/data/scomObjectsByClass", className)
	if err != nil {
		return []models.MonitoringObject{}, err
	}

	return objects.Rows, nil
}

func (c *ScomClient) GetHealthStateGroup(groupId, classId string) (models.StateDataResponse, error) {

	body := models.StateDataRequestBody{
		ClassID:        classId,
		GroupID:        groupId,
		ObjectIds:      []string{},
		Criteria:       "",
		DisplayColumns: []string{"healthstate", "displayname", "path", "maintenancemode"},
	}

	group, err := requestToType[models.StateDataResponse](c, "POST", "/OperationsManager/data/state", body)
	if err != nil {
		return models.StateDataResponse{}, err
	}

	return group, nil
}

func (c *ScomClient) GetObjectsByGroup(groupId, classId string) (models.StateDataResponse, error) {
	body := models.StateDataRequestBody{
		ClassID:        classId,
		GroupID:        groupId,
		ObjectIds:      []string{},
		Criteria:       "",
		DisplayColumns: []string{"healthstate", "displayname", "path", "maintenancemode"},
	}

	objects, err := requestToType[models.StateDataResponse](c, "POST", "/OperationsManager/data/state", body)
	if err != nil {
		return models.StateDataResponse{}, err
	}

	return objects, nil
}
