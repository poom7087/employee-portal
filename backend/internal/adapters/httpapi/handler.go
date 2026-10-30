package httpapi

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"os"
	"path/filepath"
	"people-portal/backend/internal/config"
	"people-portal/backend/internal/core/domain"
	"people-portal/backend/internal/core/service"
	"strings"
	"time"
)

type Handler struct {
	service *service.ProfileService
	config  config.Config
}

func New(s *service.ProfileService, cfg config.Config) *fiber.App {
	h := &Handler{service: s, config: cfg}
	app := fiber.New(fiber.Config{AppName: "People Portal API", BodyLimit: 6 * 1024 * 1024, ErrorHandler: func(c *fiber.Ctx, err error) error {
		return c.Status(500).JSON(fiber.Map{"error": "internal server error"})
	}})
	app.Get("/health", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"status": "ok"}) })
	app.Static("/uploads", cfg.UploadDir)
	api := app.Group("/api/v1")
	api.Get("/profile", h.getProfile)
	api.Put("/profile", h.updateProfile)
	api.Post("/profile/photo", h.uploadPhoto)
	api.Get("/profile/history", h.history)
	api.Get("/config/skills", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"skills": cfg.Skills}) })
	return app
}
func (h *Handler) getProfile(c *fiber.Ctx) error {
	p, e := h.service.Get(c.UserContext())
	if e != nil {
		return c.Status(404).JSON(fiber.Map{"error": "profile not found"})
	}
	return c.JSON(p)
}
func (h *Handler) updateProfile(c *fiber.Ctx) error {
	var input domain.ProfileUpdate
	if e := c.BodyParser(&input); e != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	p, e := h.service.Update(c.UserContext(), input, h.config.Skills)
	if e != nil {
		if e == service.ErrInvalid || strings.Contains(e.Error(), service.ErrInvalid.Error()) {
			return c.Status(422).JSON(fiber.Map{"error": e.Error()})
		}
		return e
	}
	return c.JSON(p)
}
func (h *Handler) history(c *fiber.Ctx) error {
	items, e := h.service.History(c.UserContext())
	if e != nil {
		return e
	}
	return c.JSON(fiber.Map{"items": items, "retentionDays": h.config.HistoryRetentionDays})
}
func (h *Handler) uploadPhoto(c *fiber.Ctx) error {
	file, e := c.FormFile("photo")
	if e != nil {
		return c.Status(400).JSON(fiber.Map{"error": "photo file is required"})
	}
	if file.Size > 5*1024*1024 {
		return c.Status(413).JSON(fiber.Map{"error": "photo must be 5 MB or smaller"})
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return c.Status(422).JSON(fiber.Map{"error": "use a JPG, PNG, or WebP image"})
	}
	if e = os.MkdirAll(h.config.UploadDir, 0755); e != nil {
		return e
	}
	name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	path := filepath.Join(h.config.UploadDir, name)
	if e = c.SaveFile(file, path); e != nil {
		return e
	}
	p, e := h.service.UpdatePhoto(c.UserContext(), "/uploads/"+name)
	if e != nil {
		_ = os.Remove(path)
		return e
	}
	return c.JSON(p)
}
