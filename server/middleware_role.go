package main

import (
	"net/http"

	"github.com/jesusmdy/goauth-server/internal/auth"
)

func (apiCfg *apiConfig) middlewareRole(handler authedHandler, role string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		apiKey, err := auth.GetAPIKey(r.Header)
		if err != nil {
			respondWithError(w, http.StatusForbidden, "Invalid API key")
			return
		}

		username, error := verifyToken(apiKey)

		if error != nil {
			respondWithError(w, http.StatusForbidden, "Invalid API key")
			return
		}

		user, err := apiCfg.DB.GetUserByUsername(r.Context(), username)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "User not found")
			return
		}

		if user.Role != role {
			respondWithError(w, http.StatusForbidden, "Invalid role")
			return
		}

		handler(w, r, user)
	}
}
