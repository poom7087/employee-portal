package domain

import "time"

type ContactInfo struct {
	Mobile  string `json:"mobile" bson:"mobile"`
	Email   string `json:"email" bson:"email"`
	Address string `json:"address" bson:"address"`
}

type Profile struct {
	ID        string      `json:"id" bson:"_id"`
	FirstName string      `json:"firstName" bson:"first_name"`
	LastName  string      `json:"lastName" bson:"last_name"`
	PhotoURL  string      `json:"photoUrl" bson:"photo_url"`
	Contact   ContactInfo `json:"contact" bson:"contact"`
	Skills    []string    `json:"skills" bson:"skills"`
	UpdatedAt time.Time   `json:"updatedAt" bson:"updated_at"`
}

type Change struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	ProfileID string    `json:"profileId" bson:"profile_id"`
	Field     string    `json:"field" bson:"field"`
	Label     string    `json:"label" bson:"label"`
	Before    any       `json:"before" bson:"before"`
	After     any       `json:"after" bson:"after"`
	ChangedAt time.Time `json:"changedAt" bson:"changed_at"`
}

type ProfileUpdate struct {
	Contact ContactInfo `json:"contact"`
	Skills  []string    `json:"skills"`
}
