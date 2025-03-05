package plugin

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"net/url"
)

type AuthTokens struct {
	SessionID string
	CSRFToken string
	AuthToken string
}

func Authenticate(baseUrl string, userName string, password string, IsSkipTlsVerifyCheck bool) (AuthTokens, error) {
	// Get tokens.
	result := AuthTokens{}

	bodyraw := fmt.Sprintf("AuthenticationMode:%s:%s", userName, password)
	bytesAuthBody := []byte(bodyraw)
	scomAuthNBodyString := base64.StdEncoding.EncodeToString(bytesAuthBody)
	scomAuthNBody := fmt.Sprintf("'%s'", scomAuthNBodyString)

	pair := fmt.Sprintf("%s:%s", userName, password)
	basicToken := base64.StdEncoding.EncodeToString([]byte(pair))

	scomAuthNUri := baseUrl + "/OperationsManager/authenticate"
	scomHeader := map[string]string{
		"Content-Type":  "application/json; charset=utf-8",
		"Authorization": "Basic " + basicToken,
	}

	// Create an HTTP client with custom TLS configuration to disable SSL certificate validation.
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: IsSkipTlsVerifyCheck},
		},
	}

	body := bytes.NewBufferString(scomAuthNBody)

	req, err := http.NewRequest("POST", scomAuthNUri, body)
	if err != nil {
		return result, err
	}

	for key, value := range scomHeader {
		req.Header.Set(key, value)
	}

	resp, err := client.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return result, errors.New(fmt.Sprintf("HTTP request failed with status code: %v", resp.Status))
	}

	// Extract and store token values.
	var scomSessionID, scomCSRFTokenEncoded string
	for _, cookie := range resp.Cookies() {
		if cookie.Name == "SCOMSessionId" {
			scomSessionID = "SCOMSessionId=" + cookie.Value
		} else if cookie.Name == "SCOM-CSRF-TOKEN" {
			scomCSRFTokenEncoded = cookie.Value
		}
	}

	scomCSRFToken, err := url.QueryUnescape(scomCSRFTokenEncoded)
	if err != nil {
		return result, err
	}

	if scomSessionID == "" || scomCSRFToken == "" {
		return result, errors.New("scomSessionID or scomCSRFToken is empty")
	}

	result.AuthToken = basicToken
	result.CSRFToken = scomCSRFToken
	result.SessionID = scomSessionID

	return result, nil
}
