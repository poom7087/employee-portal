package service

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"people-portal/backend/internal/core/domain"
	"people-portal/backend/internal/core/ports"
	"strings"
	"time"
)

const DemoProfileID = "demo-employee"

var ErrInvalid = errors.New("invalid profile data")

type ProfileService struct {
	repo      ports.ProfileRepository
	retention time.Duration
}

func New(repo ports.ProfileRepository, retentionDays int) *ProfileService {
	return &ProfileService{repo: repo, retention: time.Duration(retentionDays) * 24 * time.Hour}
}
func (s *ProfileService) Get(ctx context.Context) (domain.Profile, error) {
	return s.repo.GetProfile(ctx, DemoProfileID)
}
func (s *ProfileService) Update(ctx context.Context, update domain.ProfileUpdate, skillsAllowed []string) (domain.Profile, error) {
	profile, err := s.Get(ctx)
	if err != nil {
		return profile, err
	}
	update.Contact.Mobile = strings.TrimSpace(update.Contact.Mobile)
	update.Contact.Email = strings.TrimSpace(update.Contact.Email)
	update.Contact.Address = strings.TrimSpace(update.Contact.Address)
	if update.Contact.Email != "" {
		if _, err := mail.ParseAddress(update.Contact.Email); err != nil {
			return profile, fmt.Errorf("%w: email is invalid", ErrInvalid)
		}
	}
	if len(update.Contact.Mobile) > 40 || len(update.Contact.Email) > 254 || len(update.Contact.Address) > 500 {
		return profile, fmt.Errorf("%w: contact field is too long", ErrInvalid)
	}
	allowed := map[string]bool{}
	for _, skill := range skillsAllowed {
		allowed[skill] = true
	}
	seen := map[string]bool{}
	selected := make([]string, 0, len(update.Skills))
	for _, skill := range update.Skills {
		if !allowed[skill] {
			return profile, fmt.Errorf("%w: unsupported skill %q", ErrInvalid, skill)
		}
		if !seen[skill] {
			seen[skill] = true
			selected = append(selected, skill)
		}
	}
	now := time.Now().UTC()
	changes := make([]domain.Change, 0, 4)
	add := func(field, label string, before, after any) {
		if fmt.Sprint(before) != fmt.Sprint(after) {
			changes = append(changes, domain.Change{ProfileID: profile.ID, Field: field, Label: label, Before: before, After: after, ChangedAt: now})
		}
	}
	add("mobile", "Mobile phone", profile.Contact.Mobile, update.Contact.Mobile)
	add("email", "Email", profile.Contact.Email, update.Contact.Email)
	add("address", "Address", profile.Contact.Address, update.Contact.Address)
	add("skills", "Skills", profile.Skills, selected)
	profile.Contact = update.Contact
	profile.Skills = selected
	profile.UpdatedAt = now
	if err := s.repo.SaveProfile(ctx, profile); err != nil {
		return profile, err
	}
	if len(changes) > 0 {
		if err := s.repo.AppendChanges(ctx, changes, now.Add(-s.retention)); err != nil {
			return profile, err
		}
	}
	return profile, nil
}
func (s *ProfileService) UpdatePhoto(ctx context.Context, url string) (domain.Profile, error) {
	profile, err := s.Get(ctx)
	if err != nil {
		return profile, err
	}
	now := time.Now().UTC()
	before := profile.PhotoURL
	profile.PhotoURL = url
	profile.UpdatedAt = now
	if err = s.repo.SaveProfile(ctx, profile); err != nil {
		return profile, err
	}
	if before != url {
		err = s.repo.AppendChanges(ctx, []domain.Change{{ProfileID: profile.ID, Field: "photo", Label: "Profile photo", Before: before, After: url, ChangedAt: now}}, now.Add(-s.retention))
	}
	return profile, err
}
func (s *ProfileService) History(ctx context.Context) ([]domain.Change, error) {
	return s.repo.ListChanges(ctx, DemoProfileID, time.Now().UTC().Add(-s.retention))
}
