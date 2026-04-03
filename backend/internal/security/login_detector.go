package security

import (
	"fmt"
	"sync"
	"time"
)

type LoginAttemptDetector struct {
	mu        sync.Mutex
	records   map[string][]time.Time
	limit     int
	window    time.Duration
	incidents *IncidentStore
}

func NewLoginAttemptDetector(limit int, window time.Duration, incidents *IncidentStore) *LoginAttemptDetector {
	return &LoginAttemptDetector{
		records:   make(map[string][]time.Time),
		limit:     limit,
		window:    window,
		incidents: incidents,
	}
}

func (d *LoginAttemptDetector) RegisterFailure(key string) error {
	d.mu.Lock()
	defer d.mu.Unlock()

	now := time.Now()
	timestamps := d.records[key]

	valid := make([]time.Time, 0, len(timestamps))
	for _, t := range timestamps {
		if now.Sub(t) <= d.window {
			valid = append(valid, t)
		}
	}

	valid = append(valid, now)
	d.records[key] = valid

	if len(valid) > d.limit {
		if d.incidents != nil {
			d.incidents.Add(Incident{
				ID:          fmt.Sprintf("INC-%d", now.UnixNano()),
				Type:        "LOGIN_BRUTE_FORCE",
				Severity:    "HIGH",
				UserID:      key,
				Description: fmt.Sprintf("Đăng nhập sai quá %d lần trong %v", d.limit, d.window),
				Status:      "OPEN",
				CreatedAt:   now,
			})
		}

		return fmt.Errorf("đăng nhập sai quá nhiều lần, vui lòng thử lại sau")
	}

	return nil
}

func (d *LoginAttemptDetector) Reset(key string) {
	d.mu.Lock()
	defer d.mu.Unlock()
	delete(d.records, key)
}