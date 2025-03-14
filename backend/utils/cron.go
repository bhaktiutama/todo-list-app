package utils

import (
	"log"

	"github.com/robfig/cron/v3"
)

var cronScheduler *cron.Cron

// InitCronJobs initializes and starts the cron jobs
func InitCronJobs() {
	cronScheduler = cron.New()

	// Run cleanup job every hour
	_, err := cronScheduler.AddFunc("0 * * * *", cleanupExpiredTodoLists)
	if err != nil {
		log.Printf("Failed to schedule cleanup job: %v", err)
	}

	cronScheduler.Start()
	log.Println("Cron jobs initialized")
}

// StopCronJobs stops all cron jobs
func StopCronJobs() {
	if cronScheduler != nil {
		cronScheduler.Stop()
	}
}

// cleanupExpiredTodoLists removes expired todo lists
// Note: Redis TTL handles this automatically, but this is a backup
func cleanupExpiredTodoLists() {
	log.Println("Running cleanup job for expired todo lists")
	// Redis handles TTL automatically, so this is just a log for now
	// In a real-world scenario, you might want to do additional cleanup
	// like removing related data or sending notifications
} 