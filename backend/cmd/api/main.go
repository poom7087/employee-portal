package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"people-portal/backend/internal/adapters/httpapi"
	"people-portal/backend/internal/adapters/mongostore"
	"people-portal/backend/internal/config"
	"people-portal/backend/internal/core/service"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
		log.Fatalf("create upload directory: %v", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 12*time.Second)
	defer cancel()
	store, err := mongostore.New(ctx, cfg.MongoURI, cfg.Database)
	if err != nil {
		log.Fatalf("connect MongoDB: %v", err)
	}
	defer store.Close(context.Background())
	if err = store.SeedDemo(ctx); err != nil {
		log.Fatalf("seed profile: %v", err)
	}
	svc := service.New(store, cfg.HistoryRetentionDays)
	app := httpapi.New(svc, cfg)
	go func() {
		if err := app.Listen(":" + cfg.Port); err != nil {
			log.Printf("server stopped: %v", err)
		}
	}()
	log.Printf("People Portal API listening on :%s", cfg.Port)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	ctx, cancel = context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()
	_ = app.ShutdownWithContext(ctx)
}
