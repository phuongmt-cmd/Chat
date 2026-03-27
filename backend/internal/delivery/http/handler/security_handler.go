package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type SecurityHandler struct{}

func NewSecurityHandler() *SecurityHandler {
	return &SecurityHandler{}
}

func (h *SecurityHandler) GetIncidents(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "Incidents fetched successfully",
		"data":    incidentStore.List(),
	})
}