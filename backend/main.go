package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/majoo/todo-list-app/api"
	"github.com/majoo/todo-list-app/config"
	"github.com/majoo/todo-list-app/database"
	"github.com/majoo/todo-list-app/routes"
	"github.com/majoo/todo-list-app/utils"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Initialize Redis
	if err := database.InitRedis(cfg.RedisURL, cfg.RedisPassword); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}
	defer database.CloseRedis()

	// Initialize cron jobs
	utils.InitCronJobs()
	defer utils.StopCronJobs()

	// Start WebSocket manager in a goroutine
	go api.Manager.Start()

	app := fiber.New(fiber.Config{
		AppName: "Todo List Pastebin",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// Setup routes
	routes.SetupRoutes(app)

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
} 