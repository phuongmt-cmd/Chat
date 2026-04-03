package security

import "time"

type Incident struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	Type        string    `json:"type"`
	Severity    string    `json:"severity"`
	UserID      string    `json:"user_id"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}