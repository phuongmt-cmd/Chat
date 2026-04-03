package security

import (
	"fmt"
	"sync"
	"time"
)

type FloodDetector struct {
	mu        sync.Mutex
	records   map[string][]time.Time
	limit     int
	window    time.Duration
	incidents *IncidentStore
}

func NewFloodDetector(limit int, window time.Duration, incidents *IncidentStore) *FloodDetector {
	return &FloodDetector{
		records:   make(map[string][]time.Time),
		limit:     limit,
		window:    window,
		incidents: incidents,
	}
}

func (d *FloodDetector) Check(userID string) error {
	d.mu.Lock()
	defer d.mu.Unlock()

	now := time.Now()
	timestamps := d.records[userID]

	valid := make([]time.Time, 0, len(timestamps))
	for _, t := range timestamps {
		if now.Sub(t) <= d.window {
			valid = append(valid, t)
		}
	}

	valid = append(valid, now)
	d.records[userID] = valid

	if len(valid) > d.limit {
		if d.incidents != nil {
			d.incidents.Add(Incident{
				ID:          fmt.Sprintf("INC-%d", now.UnixNano()),
				Type:        "MESSAGE_FLOOD",
				Severity:    "HIGH",
				UserID:      userID,
				Description: fmt.Sprintf("User gửi quá %d tin nhắn trong %v", d.limit, d.window),
				Status:      "OPEN",
				CreatedAt:   now,
			})
		}

		return fmt.Errorf("bạn đang gửi tin nhắn quá nhanh, vui lòng thử lại sau")
	}

	return nil
}