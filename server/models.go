package main

import (
	"time"

	"github.com/google/uuid"
	"github.com/jesusmdy/goauth-server/internal/database"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Fullname  string    `json:"fullName"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
}

func databaseUserToUser(dbUser database.User) User {
	return User{
		ID:        dbUser.ID,
		CreatedAt: dbUser.CreatedAt,
		UpdatedAt: dbUser.UpdatedAt,
		Fullname:  dbUser.Fullname,
		Username:  dbUser.Username,
		Email:     dbUser.Email,
		Password:  dbUser.Password,
	}
}
