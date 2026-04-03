package repo

import (
	domainSecurity "github.com/phuongaz/chatchat/internal/domain/security"
	"gorm.io/gorm"
)

type IncidentRepo struct {
	db *gorm.DB
}

func NewIncidentRepo(db *gorm.DB) *IncidentRepo {
	return &IncidentRepo{db: db}
}

func (r *IncidentRepo) Create(incident domainSecurity.Incident) error {
	return r.db.Create(&incident).Error
}

func (r *IncidentRepo) GetAll() ([]domainSecurity.Incident, error) {
	var incidents []domainSecurity.Incident
	err := r.db.Order("created_at desc").Find(&incidents).Error
	return incidents, err
}

func (r *IncidentRepo) UpdateStatus(id string, status string) error {
	return r.db.Model(&domainSecurity.Incident{}).
		Where("id = ?", id).
		Update("status", status).Error
}