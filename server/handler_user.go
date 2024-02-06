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
		Disabled:  false,
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
		Disabled bool      `json:"disabled"`
	}

	respondWithJSON(w, http.StatusOK, response{
		ID:       newUser.ID,
		FullName: newUser.Fullname,
		Username: newUser.Username,
		Email:    newUser.Email,
		Role:     newUser.Role,
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

func (apiCfg apiConfig) handleUpdateUserAvailability(
	w http.ResponseWriter,
	r *http.Request,
	user database.User,
) {
	type parametes struct {
		Disabled bool `json:"disabled"`
	}

	decoder := json.NewDecoder(r.Body)

	params := parametes{}
	err := decoder.Decode(&params)

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// get user id from url
	userID := r.URL.Query().Get("userId")

	if userID == "" {
		respondWithError(w, http.StatusBadRequest, "User ID is required")
		return
	}

	// check if user id is valid
	_, err = uuid.Parse(userID)

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	// check if user is trying to disable themselves
	if user.ID.String() == userID {
		respondWithError(w, http.StatusBadRequest, "You cannot disable yourself")
		return
	}

	// check if user is trying to disable an admin
	userToDisable, err := apiCfg.DB.GetUserById(r.Context(), uuid.MustParse(userID))
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error getting user")
		return
	}

	if userToDisable.Role == "admin" {
		respondWithError(w, http.StatusBadRequest, "You cannot disable an admin")
		return
	}

	// update user availability
	updatedAt := time.Now().UTC()
	_, err = apiCfg.DB.UpdateUserAvailability(
		r.Context(),
		database.UpdateUserAvailabilityParams{
			ID:        uuid.MustParse(userID),
			UpdatedAt: updatedAt,
			Disabled:  params.Disabled,
		},
	)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error updating user availability")
		return
	}

	message := "User disabled"

	if !params.Disabled {
		message = "User enabled"
	}

	respondWithJSON(w, http.StatusOK, message)
}

func (apiCfg apiConfig) handleCheckUsernameAvailability(
	w http.ResponseWriter,
	r *http.Request,
) {
	userName := r.URL.Query().Get("username")

	if userName == "" {
		respondWithError(w, http.StatusBadRequest, "Username is required")
		return
	}

	// check if username is valid
	usernameRegex := "^[a-zA-Z0-9_]+$"
	if !regexp.MustCompile(usernameRegex).MatchString(userName) {
		respondWithError(w, http.StatusBadRequest, "Invalid username")
		return
	}

	// check if username is already taken
	user, err := apiCfg.DB.GetUserByUsername(r.Context(), userName)

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			respondWithJSON(w, http.StatusOK, "Username available")
			return
		} else {
			respondWithError(w, http.StatusInternalServerError, "Error checking username availability")
			return
		}
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error checking username availability")
		return
	}

	if user.ID != uuid.Nil {
		respondWithError(w, http.StatusFound, "Username already exists")
		return
	}

	respondWithJSON(w, http.StatusOK, "Username available")
}

func (apiCfg apiConfig) handleCheckEmailAvailability(
	w http.ResponseWriter,
	r *http.Request,
) {
	email := r.URL.Query().Get("email")

	if email == "" {
		respondWithError(w, http.StatusBadRequest, "Email is required")
		return
	}

	// check if email is valid
	emailRegex := "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
	if !regexp.MustCompile(emailRegex).MatchString(email) {
		respondWithError(w, http.StatusBadRequest, "Invalid email")
		return
	}

	// check if email is already taken
	user, err := apiCfg.DB.GetUserByEmail(r.Context(), email)

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			respondWithJSON(w, http.StatusOK, "Email available")
			return
		} else {
			respondWithError(w, http.StatusInternalServerError, "Error checking email availability")
			return
		}
	}

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error checking email availability")
		return
	}

	if user.ID != uuid.Nil {
		respondWithError(w, http.StatusFound, "Email already exists")
		return
	}

	respondWithJSON(w, http.StatusOK, "Email available")
}

func (apiCfg apiConfig) handleUpdateUserDetails(
	w http.ResponseWriter,
	r *http.Request,
	user database.User,
) {
	type parametes struct {
		FullName string `json:"fullName"`
		Username string `json:"username"`
		Email    string `json:"email"`
	}

	decoder := json.NewDecoder(r.Body)

	params := parametes{}
	err := decoder.Decode(&params)

	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// check if any of the fields are empty
	if params.FullName == "" || params.Username == "" || params.Email == "" {
		respondWithError(w, http.StatusBadRequest, "All fields are required")
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

	// check if username is already taken
	userByUsername, err := apiCfg.DB.GetUserByUsername(r.Context(), params.Username)

	if err != nil {
		if err.Error() != "sql: no rows in result set" {
			respondWithError(w, http.StatusInternalServerError, "Error checking username availability")
			return
		}
	}

	if userByUsername.ID != uuid.Nil && userByUsername.ID != user.ID {
		respondWithError(w, http.StatusFound, "Username already exists")
		return
	}

	// check if email is already taken
	userByEmail, err := apiCfg.DB.GetUserByEmail(r.Context(), params.Email)

	if err != nil {
		if err.Error() != "sql: no rows in result set" {
			respondWithError(w, http.StatusInternalServerError, "Error checking email availability")
			return
		}
	}

	if userByEmail.ID != uuid.Nil && userByEmail.ID != user.ID {
		respondWithError(w, http.StatusFound, "Email already exists")
		return
	}

	// update user details
	updatedAt := time.Now().UTC()
	_, err = apiCfg.DB.UpdateUserDetails(
		r.Context(),
		database.UpdateUserDetailsParams{
			ID:        user.ID,
			UpdatedAt: updatedAt,
			Fullname:  params.FullName,
			Username:  params.Username,
			Email:     params.Email,
		},
	)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error updating user details")
		return
	}

	type response struct {
		ID       uuid.UUID `json:"id"`
		FullName string    `json:"fullName"`
		Username string    `json:"username"`
		Email    string    `json:"email"`
		Role     string    `json:"role"`
		Disabled bool      `json:"disabled"`
	}

	respondWithJSON(w, http.StatusOK, response{
		ID:       user.ID,
		FullName: params.FullName,
		Username: params.Username,
		Email:    params.Email,
		Role:     user.Role,
		Disabled: user.Disabled,
	})

}
