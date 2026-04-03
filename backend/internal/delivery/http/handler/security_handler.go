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

func (h *SecurityHandler) ResolveIncident(c *gin.Context) {
	id := c.Param("id")

	err := incidentStore.UpdateStatus(id, "RESOLVED")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    http.StatusInternalServerError,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    http.StatusOK,
		"message": "Incident resolved successfully",
	})
}