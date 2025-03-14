package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/majoo/todo-list-app/models"
	"log"
)

func CreateTodoList(c *fiber.Ctx) error {
	var req models.CreateTodoListRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate expiration hours
	if req.ExpirationHours <= 0 {
		req.ExpirationHours = 24 // Default to 24 hours
	}

	todoList, err := models.CreateTodoList(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Return both the view URL and edit URL
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id": todoList.ID,
		"edit_token": todoList.EditToken,
		"todo_list": todoList,
	})
}

func GetTodoList(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID is required",
		})
	}

	todoList, err := models.GetTodoList(c.Context(), id)
	if err == models.ErrTodoListNotFound {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Todo list not found",
		})
	} else if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(todoList)
}

func UpdateTodoList(c *fiber.Ctx) error {
	id := c.Params("id")
	editToken := c.Query("token")
	clientID := c.Query("client_id")

	if id == "" || editToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID and edit token are required",
		})
	}

	log.Printf("Received update request for todo list %s with token: %s", id, editToken)

	var req models.UpdateTodoListRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	todoList, err := models.UpdateTodoList(c.Context(), id, editToken, req)
	if err == models.ErrTodoListNotFound {
		log.Printf("Todo list not found: %s", id)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Todo list not found",
		})
	} else if err == models.ErrInvalidEditToken {
		log.Printf("Invalid edit token for todo list %s", id)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid edit token",
		})
	} else if err != nil {
		log.Printf("Error updating todo list %s: %v", id, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Broadcast the update to all clients except the one that made the change
	Manager.BroadcastToTodoList(id, clientID, todoList)

	return c.JSON(todoList)
} 