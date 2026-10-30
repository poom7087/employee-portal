package mongostore

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"people-portal/backend/internal/core/domain"
)

type Store struct {
	client   *mongo.Client
	profiles *mongo.Collection
	changes  *mongo.Collection
}

func New(ctx context.Context, uri, database string) (*Store, error) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	if err = client.Ping(ctx, nil); err != nil {
		_ = client.Disconnect(ctx)
		return nil, err
	}
	db := client.Database(database)
	return &Store{client: client, profiles: db.Collection("profiles"), changes: db.Collection("profile_history")}, nil
}
func (s *Store) Close(ctx context.Context) error { return s.client.Disconnect(ctx) }
func (s *Store) GetProfile(ctx context.Context, id string) (domain.Profile, error) {
	var result domain.Profile
	err := s.profiles.FindOne(ctx, bson.M{"_id": id}).Decode(&result)
	return result, err
}
func (s *Store) SaveProfile(ctx context.Context, p domain.Profile) error {
	_, err := s.profiles.ReplaceOne(ctx, bson.M{"_id": p.ID}, p, options.Replace().SetUpsert(true))
	return err
}
func (s *Store) AppendChanges(ctx context.Context, items []domain.Change, cutoff time.Time) error {
	if len(items) == 0 {
		return nil
	}
	if _, err := s.changes.DeleteMany(ctx, bson.M{"profile_id": items[0].ProfileID, "changed_at": bson.M{"$lt": cutoff}}); err != nil {
		return err
	}
	docs := make([]any, len(items))
	for i := range items {
		if items[i].ID == "" {
			items[i].ID = primitive.NewObjectID().Hex()
		}
		docs[i] = items[i]
	}
	_, err := s.changes.InsertMany(ctx, docs)
	return err
}
func (s *Store) ListChanges(ctx context.Context, id string, cutoff time.Time) ([]domain.Change, error) {
	cur, err := s.changes.Find(ctx, bson.M{"profile_id": id, "changed_at": bson.M{"$gte": cutoff}}, options.Find().SetSort(bson.D{{Key: "changed_at", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	items := []domain.Change{}
	err = cur.All(ctx, &items)
	return items, err
}
func (s *Store) SeedDemo(ctx context.Context) error {
	profile, err := s.GetProfile(ctx, "demo-employee")
	if errors.Is(err, mongo.ErrNoDocuments) {
		return s.SaveProfile(ctx, domain.Profile{
			ID:        "demo-employee",
			FirstName: "Puripong",
			LastName:  "Puhual",
			Contact: domain.ContactInfo{
				Mobile:  "+66 81 234 5678",
				Email:   "puripong.puhual@example.com",
				Address: "Khon Kaen, Thailand",
			},
			Skills:    []string{"Go", "React", "CI/CD"},
			UpdatedAt: time.Now().UTC(),
		})
	}
	if err != nil {
		return err
	}
	profile.FirstName = "Puripong"
	profile.LastName = "Puhual"
	if profile.Contact.Address == "Bangkok, Thailand" {
		profile.Contact.Address = "Khon Kaen, Thailand"
	}
	profile.UpdatedAt = time.Now().UTC()
	return s.SaveProfile(ctx, profile)
}
