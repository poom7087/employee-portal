package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port                 string
	MongoURI             string
	Database             string
	HistoryRetentionDays int
	Skills               []string
	UploadDir            string
}

func Load() Config {
	days, err := strconv.Atoi(env("HISTORY_RETENTION_DAYS", "7"))
	if err != nil || days < 1 {
		days = 7
	}
	items := strings.Split(env("SKILLS", "Go,React,Flutter,CI/CD,Node.js,TypeScript,Cloud,Leadership"), ",")
	skills := make([]string, 0, len(items))
	for _, item := range items {
		if value := strings.TrimSpace(item); value != "" {
			skills = append(skills, value)
		}
	}
	return Config{Port: env("PORT", "8080"), MongoURI: env("MONGODB_URI", "mongodb://localhost:27017"), Database: env("MONGODB_DATABASE", "people_portal"), HistoryRetentionDays: days, Skills: skills, UploadDir: env("UPLOAD_DIR", "./uploads")}
}
func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
