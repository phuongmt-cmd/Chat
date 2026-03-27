package security

import (
	"sync"
	"time"
)

type Incident struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Severity    string    `json:"severity"`
	UserID      string    `json:"user_id"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type IncidentStore struct {
	mu        sync.Mutex
	incidents []Incident
}

func NewIncidentStore() *IncidentStore {
	return &IncidentStore{
		incidents: make([]Incident, 0),
	}
}

func (s *IncidentStore) Add(incident Incident) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.incidents = append([]Incident{incident}, s.incidents...)
}

func (s *IncidentStore) List() []Incident {
	s.mu.Lock()
	defer s.mu.Unlock()

	result := make([]Incident, len(s.incidents))
	copy(result, s.incidents)
	return result
}