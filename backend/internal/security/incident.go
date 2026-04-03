package security

import (
	"sync"

	domainSecurity "github.com/phuongaz/chatchat/internal/domain/security"
	"github.com/phuongaz/chatchat/internal/infra/repo"
	"gorm.io/gorm"
)

type Incident = domainSecurity.Incident

var incidentRepo *repo.IncidentRepo

func SetIncidentRepo(db *gorm.DB) {
	incidentRepo = repo.NewIncidentRepo(db)
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

	if incidentRepo != nil {
		_ = incidentRepo.Create(incident)
	}
}

func (s *IncidentStore) List() []Incident {
	if incidentRepo != nil {
		incidents, err := incidentRepo.GetAll()
		if err == nil {
			return incidents
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	result := make([]Incident, len(s.incidents))
	copy(result, s.incidents)
	return result
}

func (s *IncidentStore) UpdateStatus(id string, status string) error {
	if incidentRepo != nil {
		return incidentRepo.UpdateStatus(id, status)
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.incidents {
		if s.incidents[i].ID == id {
			s.incidents[i].Status = status
			break
		}
	}

	return nil
}