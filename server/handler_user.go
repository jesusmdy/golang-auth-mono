package main

import (
	"encoding/json"
	"net/http"
	"regexp"
	"time"

	"github.com/google/uuid"
	"github.com/jesusmdy/goauth-server/internal/database"
)

func (apiCfg apiConfig) handleCreateUser(
	w http.ResponseWriter,
	r *http.Request,
) {
	type parametes struct {
		FullName string `json:"fullName"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	decoder := json.NewDecoder(r.Body)

	params := parametes{}
	err := decoder.Decode(&params)

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// check if any of the fields are empty
	if params.FullName == "" || params.Username == "" || params.Email == "" || params.Password == "" {
		respondWithError(w, http.StatusBadRequest, "All fields are required")
		return
	}

	passwordHash, err := HashPassword(params.Password)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error hashing password")
		return
	}

	// validate fullName to only contain letters and spaces
	fullNameRegex := "^[a-zA-Z ]+$"
	if !regexp.MustCompile(fullNameRegex).MatchString(params.FullName) {
		respondWithError(w, http.StatusBadRequest, "Invalid full name")
		return
	}

	// validate username to only contain letters, numbers, and underscores
	usernameRegex := "^[a-zA-Z0-9_]+$"
	if !regexp.MustCompile(usernameRegex).MatchString(params.Username) {
		respondWithError(w, http.StatusBadRequest, "Invalid username")
		return
	}

	// validate email
	emailRegex := "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
	if !regexp.MustCompile(emailRegex).MatchString(params.Email) {
		respondWithError(w, http.StatusBadRequest, "Invalid email")
		return
	}

	newUser := database.CreateUserParams{
		ID:        uuid.New(),
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
		Fullname:  params.FullName,
		Username:  params.Username,
		Email:     params.Email,
		Password:  passwordHash,
		Role:      "user",
	}

	_, err = apiCfg.DB.CreateUser(r.Context(), newUser)

	if err != nil {
		if err.Error() == "pq: duplicate key value violates unique constraint \"users_username_key\"" {
			respondWithError(w, http.StatusBadRequest, "Username already exists")
			return
		}

		if err.Error() == "pq: duplicate key value violates unique constraint \"users_email_key\"" {
			respondWithError(w, http.StatusBadRequest, "Email already exists")
			return
		}

		respondWithError(w, http.StatusInternalServerError, "Error creating user")
		return
	}

	type response struct {
		ID       uuid.UUID `json:"id"`
		FullName string    `json:"fullName"`
		Username string    `json:"username"`
		Email    string    `json:"email"`
		Role     string    `json:"role"`
	}

	respondWithJSON(w, http.StatusOK, response{
		ID:       newUser.ID,
		FullName: newUser.Fullname,
		Username: newUser.Username,
		Email:    newUser.Email,
	})
}

func (apiCfg apiConfig) handleAuthenticateUser(
	w http.ResponseWriter,
	r *http.Request,
) {

	type parametes struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Alt      bool   `json:"alt"`
	}

	decoder := json.NewDecoder(r.Body)

	params := parametes{}
	err := decoder.Decode(&params)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user := database.User{}

	if params.Alt {
		user, err = apiCfg.DB.GetUserByUsername(r.Context(), params.Email)
	} else {
		user, err = apiCfg.DB.GetUserByEmail(r.Context(), params.Email)
	}

	if user.ID == uuid.Nil {
		respondWithError(w, http.StatusUnauthorized, "Error getting user")
		return
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error getting user")
		return
	}

	if !CheckPasswordHash(params.Password, user.Password) {
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	token, err := createToken(user.Username)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error creating token")
		return
	}

	type response struct {
		ID       uuid.UUID `json:"id"`
		FullName string    `json:"fullName"`
		Username string    `json:"username"`
		Email    string    `json:"email"`
		Token    string    `json:"token"`
	}

	respondWithJSON(w, http.StatusOK, response{
		ID:       user.ID,
		FullName: user.Fullname,
		Username: user.Username,
		Email:    user.Email,
		Token:    token,
	})
}

func (apiCfg apiConfig) handleGetAuthenticatedUser(
	w http.ResponseWriter,
	r *http.Request,
	user database.User,
) {
	type response struct {
		ID       uuid.UUID `json:"id"`
		FullName string    `json:"fullName"`
		Username string    `json:"username"`
		Email    string    `json:"email"`
		Role     string    `json:"role"`
	}

	respondWithJSON(w, http.StatusOK, response{
		ID:       user.ID,
		FullName: user.Fullname,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
	})
}
