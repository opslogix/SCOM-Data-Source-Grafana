package models

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type PluginSettings struct {
	Path                 string                `json:"path"`
	Secrets              *SecretPluginSettings `json:"-"`
	Url                  string                `json:"url"`
	UserName             string                `json:"userName"`
	IsSkipTlsVerifyCheck bool                  `json:"isSkipTlsVerifyCheck"`
}

type SecretPluginSettings struct {
	Password string `json:"password"`
}

// Values from when user enters config data for using the plugin.
func LoadPluginSettings(source backend.DataSourceInstanceSettings) (*PluginSettings, error) {
	settings := PluginSettings{}
	err := json.Unmarshal(source.JSONData, &settings)
	if err != nil {
		return nil, fmt.Errorf("could not unmarshal PluginSettings json: %w", err)
	}

	// TODO
	//log.Println("********************* TLS VALUE !! > ", settings.IsSkipTlsVerifyCheck)

	settings.Secrets = loadSecretPluginSettings(source.DecryptedSecureJSONData)

	return &settings, nil
}

func loadSecretPluginSettings(source map[string]string) *SecretPluginSettings {
	return &SecretPluginSettings{
		Password: source["password"],
	}
}
