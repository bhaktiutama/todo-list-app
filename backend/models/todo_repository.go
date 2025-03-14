package models

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/majoo/todo-list-app/database"
	"github.com/google/uuid"
	"crypto/sha256"
	"encoding/hex"
	"log"
)

var (
	ErrTodoListNotFound = errors.New("todo list not found")
	ErrInvalidEditToken = errors.New("invalid edit token")
)

func CreateTodoList(ctx context.Context, req CreateTodoListRequest) (*TodoList, error) {
	id := uuid.New().String()
	editToken := uuid.New().String()
	
	// Hash the edit token
	hasher := sha256.New()
	hasher.Write([]byte(editToken))
	editTokenHash := hex.EncodeToString(hasher.Sum(nil))

	now := time.Now()
	expiresAt := now.Add(time.Duration(req.ExpirationHours) * time.Hour)

	todoList := &TodoList{
		ID:            id,
		Items:         req.Items,
		CreatedAt:     now,
		ExpiresAt:     expiresAt,
		EditToken:     editToken,
		EditTokenHash: editTokenHash,
	}

	// Set IDs and creation time for items
	for i := range todoList.Items {
		todoList.Items[i].ID = uuid.New().String()
		todoList.Items[i].CreatedAt = now
		todoList.Items[i].Order = i
	}

	// Store in Redis
	data, err := json.Marshal(todoList)
	if err != nil {
		return nil, err
	}

	err = database.RedisClient.Set(ctx, "todo:"+id, data, time.Until(expiresAt)).Err()
	if err != nil {
		return nil, err
	}

	return todoList, nil
}

func GetTodoList(ctx context.Context, id string) (*TodoList, error) {
	data, err := database.RedisClient.Get(ctx, "todo:"+id).Bytes()
	if err != nil {
		return nil, ErrTodoListNotFound
	}

	var todoList TodoList
	if err := json.Unmarshal(data, &todoList); err != nil {
		return nil, err
	}

	return &todoList, nil
}

func UpdateTodoList(ctx context.Context, id, editToken string, req UpdateTodoListRequest) (*TodoList, error) {
	todoList, err := GetTodoList(ctx, id)
	if err != nil {
		return nil, err
	}

	// Verify edit token
	hasher := sha256.New()
	hasher.Write([]byte(editToken))
	providedTokenHash := hex.EncodeToString(hasher.Sum(nil))
	
	log.Printf("Token validation for todo list %s:", id)
	log.Printf("Provided token hash: %s", providedTokenHash)
	log.Printf("Stored token hash:   %s", todoList.EditTokenHash)
	
	if providedTokenHash != todoList.EditTokenHash {
		return nil, ErrInvalidEditToken
	}

	// Update items while preserving IDs
	itemMap := make(map[string]TodoItem)
	for _, item := range todoList.Items {
		itemMap[item.ID] = item
	}

	// Update with new items
	todoList.Items = req.Items
	for i := range todoList.Items {
		if existing, ok := itemMap[todoList.Items[i].ID]; ok {
			// Preserve creation time for existing items
			todoList.Items[i].CreatedAt = existing.CreatedAt
		} else {
			// Set creation time for new items
			todoList.Items[i].ID = uuid.New().String()
			todoList.Items[i].CreatedAt = time.Now()
		}
		todoList.Items[i].Order = i
	}

	// Store updated list
	data, err := json.Marshal(todoList)
	if err != nil {
		return nil, err
	}

	err = database.RedisClient.Set(ctx, "todo:"+id, data, time.Until(todoList.ExpiresAt)).Err()
	if err != nil {
		return nil, err
	}

	return todoList, nil
} 