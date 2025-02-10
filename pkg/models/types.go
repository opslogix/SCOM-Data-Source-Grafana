package models

//Query between frontend and backend
type QueryModel struct {
	//Type of data queries. (alerts, performance, state)
	Type      string               `json:"type"`
	Criteria  string               `json:"criteria"`
	Classes   []MonitoringClass    `json:"classes"`
	Instances []MonitoringObject   `json:"instances"`
	Counters  []PerformanceCounter `json:"counters"`
	Groups    []ScomGroup          `json:"groups"`
}

type PerformanceCounter struct {
	ObjectName   string `json:"objectName"`
	CounterName  string `json:"counterName"`
	InstanceName string `json:"instanceName"`
}

type ScomAlert struct {
	TableColumns []struct {
		Field  string `json:"field"`
		Header string `json:"header"`
		Type   string `json:"type"`
		Hidden bool   `json:"hidden"`
	} `json:"tableColumns"`
	Rows []struct {
		ID                 string  `json:"id"`
		Severity           string  `json:"severity"`
		MonitoringObject   string  `json:"monitoringobjectdisplayname"`
		Name               string  `json:"name"`
		Age                string  `json:"age"`
		AgeInMilliseconds  float64 `json:"ageinmilliseconds"`
		RepeatCount        int64   `json:"repeatcount"`
		Description        string  `json:"description"`
		MonitoringObjectId string  `json:"monitoringobjectid"`
		MonitoringClassId  string  `json:"monitoringclassid"`
	} `json:"rows"`
}

type StateDataRequestBody struct {
	ClassID        string   `json:"classId"`
	GroupID        string   `json:"groupId"`
	ObjectIds      []string `json:"objectIds"`
	Criteria       string   `json:"criteria"`
	DisplayColumns []string `json:"displayColumns"`
}

type StateDataRow struct {
	ID              string `json:"id"`
	HealthState     string `json:"healthstate"`
	DisplayName     string `json:"displayname"`
	Path            string `json:"path"`
	MaintenanceMode string `json:"maintenancemode"`
}

type StateDataResponse struct {
	TableColumns []interface{}  `json:"tableColumns"`
	Rows         []StateDataRow `json:"rows"`
}

type ChildNodeData struct {
	HealthState        string `json:"healthState"`
	ID                 string `json:"id"`
	MonitorID          string `json:"monitorId"`
	MonitorDisplayName string `json:"monitorDisplayName,omitempty"`
	MonitorName        string `json:"monitorName"`
	LastTimeModified   string `json:"lastTimeModified"`
}

type MonitoringDataResponse struct {
	ChildNodeDatas []ChildNodeData `json:"childNodeDatas"`
	AlertCount     int             `json:"alertCount"`
	HealthState    string          `json:"healthState"`
	ObjectID       string          `json:"objectId"`
}

type Legend struct {
	TableColumns []struct {
		Field  string      `json:"field"`
		Header string      `json:"header"`
		Type   interface{} `json:"type"`
		Hidden bool        `json:"hidden"`
	} `json:"tableColumns"`
	Rows []struct {
		PerformanceObject   string  `json:"performanceobject"`
		PerformanceCounter  string  `json:"performancecounter"`
		PerformanceInstance string  `json:"performanceinstance"`
		AverageValue        float64 `json:"averagevalue"`
		MaximumValue        float64 `json:"maximumvalue"`
		MinimumValue        float64 `json:"minimumvalue"`
		LastValue           float64 `json:"lastvalue"`
		Path                string  `json:"path"`
		Target              string  `json:"target"`
		ID                  string  `json:"id"`
	} `json:"rows"`
}

type Dataset struct {
	Data map[string]interface{} `json:"data"`
	ID   string                 `json:"id"`
}

type PerformanceResponse struct {
	Datasets          []Dataset `json:"datasets"`
	Legends           Legend    `json:"legends"`
	ObjectId          string    `json:"objectId"`
	ObjectDisplayName string    `json:"objectDisplayName"`
	ObjectPath        string    `json:"objectPath"`
	ObjectFullName    string    `json:"objectFullName"`
}

type ScomPerformanceRequest struct {
	Duration            int                  `json:"duration"`
	ID                  string               `json:"id"`
	PerformanceCounters []PerformanceCounter `json:"performanceCounters"`
}

type ScomPerformanceResponse struct {
	Datasets []Dataset `json:"datasets"`
	Legends  Legend    `json:"legends"`
}

type PerformanceCounterData struct {
	TableColumns []struct {
		Field  string      `json:"field"`
		Header string      `json:"header"`
		Type   interface{} `json:"type"`
		Hidden bool        `json:"hidden"`
	} `json:"tableColumns"`
	Rows []struct {
		ObjectName   string `json:"objectname"`
		CounterName  string `json:"countername"`
		InstanceName string `json:"instancename"`
	} `json:"rows"`
}

type MonitoringClass struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	ClassName   string `json:"className"`
	Path        string `json:"path"`
	FullName    string `json:"fullName"`
}

type ScomClassResponse struct {
	ScopeDatas []MonitoringClass `json:"scopeDatas"`
}

type ScomGroup struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	ClassName   string `json:"className"`
	Path        string `json:"path"`
	FullName    string `json:"fullName"`
}

type GroupResponse struct {
	ScopeDatas []ScomGroup `json:"scopeDatas"`
}

type MonitoringObject struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	ClassName   string `json:"className"`
	Path        string `json:"path"`
	FullName    string `json:"fullName"`
}

type ScomObjectResponse struct {
	ScopeDatas []MonitoringObject `json:"scopeDatas"`
}

// type ScomMonitoringObject struct {
// 	ID          string `json:"id"`
// 	DisplayName string `json:"displayname"`
// 	Path        string `json:"path"`
// 	FullName    string `json:"fullname"`
// }

type ObjectByClassResponse struct {
	TableColumns []struct {
		Field  string      `json:"field"`
		Header string      `json:"header"`
		Type   interface{} `json:"type"` // using interface{} since type can be null/unknown
		Hidden bool        `json:"hidden"`
	} `json:"tableColumns"`
	Rows []MonitoringObject `json:"rows"`
}
