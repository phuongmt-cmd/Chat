package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	security "github.com/phuongaz/chatchat/internal/security"
)

type SecurityReportHandler struct{}

func NewSecurityReportHandler() *SecurityReportHandler {
	return &SecurityReportHandler{}
}

func (h *SecurityReportHandler) ReportSuspiciousContent(c *gin.Context) {
	var req struct {
		Type        string `json:"type" binding:"required"`
		Description string `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    http.StatusBadRequest,
			"message": err.Error(),
		})
		return
	}

	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    http.StatusUnauthorized,
			"message": "User not authenticated",
		})
		return
	}

	userID, ok := userIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    http.StatusInternalServerError,
			"message": "Invalid user ID format",
		})
		return
	}

	incidentStore.Add(security.Incident{
		ID:          fmt.Sprintf("INC-%d", time.Now().UnixNano()),
		Type:        req.Type,
		Severity:    "MEDIUM",
		UserID:      userID,
		Description: req.Description,
		Status:      "OPEN",
		CreatedAt:   time.Now(),
	})

	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "Suspicious content reported successfully",
	})
}