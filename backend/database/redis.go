package database

import (
	"context"
	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis(redisURL, password string) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     redisURL,
		Password: password,
		DB:       0,
	})

	// Test the connection
	ctx := context.Background()
	_, err := RedisClient.Ping(ctx).Result()
	return err
}

func CloseRedis() error {
	if RedisClient != nil {
		return RedisClient.Close()
	}
	return nil
} 