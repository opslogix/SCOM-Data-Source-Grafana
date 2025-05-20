package plugin

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"github.com/Azure/go-ntlmssp"
)

type AuthTokens struct {
	SessionID string
	CSRFToken string
	AuthToken string
}

func Authenticate(baseUrl string, userName string, password string, IsSkipTlsVerifyCheck bool) (AuthTokens, error) {
	result := AuthTokens{}

	//bodyraw := fmt.Sprintf("AuthenticationMode:%s:%s", userName, password)
	bytesAuthBody := []byte("Windows")
	scomAuthNBodyString := base64.StdEncoding.EncodeToString(bytesAuthBody)
	scomAuthNBody := fmt.Sprintf("'%s'", scomAuthNBodyString)

	scomAuthNUri := baseUrl + "/OperationsManager/authenticate"
	scomHeader := map[string]string{
		"Content-Type": "application/json; charset=utf-8",
	}

	// NTLM transport
	ntlmTransport := ntlmssp.Negotiator{
		RoundTripper: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: IsSkipTlsVerifyCheck},
		},
	}

	client := &http.Client{
		Transport: &ntlmTransport,
	}

	body := bytes.NewBufferString(scomAuthNBody)

	req, err := http.NewRequest("POST", scomAuthNUri, body)
	if err != nil {
		return result, err
	}

	// Set NTLM credentials
	req.SetBasicAuth(userName, password)

	for key, value := range scomHeader {
		req.Header.Set(key, value)
	}

	resp, err := client.Do(req)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return result, fmt.Errorf("HTTP request failed with status code: %v", resp.Status)
	}

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

	result.AuthToken = "" // NTLM is not using basic token
	result.CSRFToken = scomCSRFToken
	result.SessionID = scomSessionID

	return result, nil
}