package models

import (
	"time"
)

type TodoItem struct {
	ID          string    `json:"id"`
	Content     string    `json:"content"`
	Completed   bool      `json:"completed"`
	Order       int       `json:"order"`
	CreatedAt   time.Time `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type TodoList struct {
	ID           string     `json:"id"`
	Items        []TodoItem `json:"items"`
	CreatedAt    time.Time  `json:"created_at"`
	ExpiresAt    time.Time  `json:"expires_at"`
	EditToken    string     `json:"-"` // Not sent to client
	EditTokenHash string    `json:"edit_token_hash"` // Stored in Redis
}

type CreateTodoListRequest struct {
	ExpirationHours int        `json:"expiration_hours"`
	Items           []TodoItem `json:"items"`
}

type UpdateTodoListRequest struct {
	Items []TodoItem `json:"items"`
} 