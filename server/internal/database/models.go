// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.25.0

package database

import (
	"time"

	"github.com/google/uuid"
)

type Product struct {
	ID          uuid.UUID
	Title       string
	Price       int32
	Description string
	Category    string
	Image       string
	Rate        int32
	Count       int32
}

type User struct {
	ID        uuid.UUID
	CreatedAt time.Time
	UpdatedAt time.Time
	Fullname  string
	Username  string
	Email     string
	Password  string
	Role      string
	Disabled  bool
	Balance   int64
}

type UserShoppingList struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	ProductID uuid.UUID
	DateAdded time.Time
}
