package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/majoo/todo-list-app/api"
)

func SetupRoutes(app *fiber.App) {
	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// API routes
	v1 := app.Group("/api/v1")

	// WebSocket Middleware
	app.Use("/ws", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client requested upgrade to the WebSocket protocol
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return c.SendStatus(fiber.StatusUpgradeRequired)
	})

	// Todo routes
	todos := v1.Group("/todos")
	todos.Post("/", api.CreateTodoList)
	todos.Get("/:id", api.GetTodoList)
	todos.Put("/:id", api.UpdateTodoList)

	// WebSocket route for real-time updates
	app.Get("/ws/todos/:id", api.WebSocketUpgrade())
} 