package ports

import (
	"context"
	"people-portal/backend/internal/core/domain"
	"time"
)

type ProfileRepository interface {
	GetProfile(context.Context, string) (domain.Profile, error)
	SaveProfile(context.Context, domain.Profile) error
	AppendChanges(context.Context, []domain.Change, time.Time) error
	ListChanges(context.Context, string, time.Time) ([]domain.Change, error)
	SeedDemo(context.Context) error
}
