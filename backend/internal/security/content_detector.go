package security

import (
	"fmt"
	"strings"
	"time"
)

type ContentDetector struct {
	incidents *IncidentStore
}

func NewContentDetector(incidents *IncidentStore) *ContentDetector {
	return &ContentDetector{
		incidents: incidents,
	}
}

func (d *ContentDetector) CheckMessage(userID string, message string) {
	lower := strings.ToLower(message)

	suspiciousPatterns := []string{
		"<script>",
		"javascript:",
		"onerror=",
		"<img",
	}

	for _, pattern := range suspiciousPatterns {
		if strings.Contains(lower, pattern) {
			d.incidents.Add(Incident{
				ID:          fmt.Sprintf("INC-%d", time.Now().UnixNano()),
				Type:        "SUSPICIOUS_CONTENT",
				Severity:    "MEDIUM",
				UserID:      userID,
				Description: "Phát hiện nội dung nghi ngờ XSS",
				Status:      "OPEN",
				CreatedAt:   time.Now(),
			})
			return
		}
	}
}