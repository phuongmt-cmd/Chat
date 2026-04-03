package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	domainAuth "github.com/phuongaz/chatchat/internal/domain/auth"
	"github.com/phuongaz/chatchat/internal/dto"
	security "github.com/phuongaz/chatchat/internal/security"
	"github.com/phuongaz/chatchat/internal/usecase/auth"
	"github.com/phuongaz/chatchat/internal/usecase/user"
)

var loginAttemptDetector = security.NewLoginAttemptDetector(5, 5*time.Minute, incidentStore)

type AuthHandler struct {
	authUC auth.AuthUsecase
	userUC user.UserUsecase
}

func NewAuthHandler(authUC auth.AuthUsecase, userUC user.UserUsecase) *AuthHandler {
	return &AuthHandler{authUC: authUC, userUC: userUC}
}

func (h *AuthHandler) CheckRegister(c *gin.Context) {
	var req domainAuth.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	_, err := h.userUC.GetUserByUsername(c.Request.Context(), req.Username)
	if err == nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Code:    http.StatusBadRequest,
			Message: "User already exists",
			Data:    gin.H{"available": false},
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "User already exists",
		Data:    gin.H{"available": true},
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req domainAuth.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	err := h.authUC.Register(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "User registered successfully",
	})
}

func (h *AuthHandler) PreLogin(c *gin.Context) {
	var req domainAuth.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	user, err := h.userUC.GetUserByUsername(c.Request.Context(), req.Username)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Response{
			Code:    http.StatusNotFound,
			Message: "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "Pre-login info",
		Data:    gin.H{"salt": user.Salt},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Response{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	token, user, err := h.authUC.Login(req)
	if err != nil {
		if blockErr := loginAttemptDetector.RegisterFailure(req.Username); blockErr != nil {
			c.JSON(http.StatusTooManyRequests, dto.Response{
				Code:    http.StatusTooManyRequests,
				Message: blockErr.Error(),
			})
			return
		}

		c.JSON(http.StatusUnauthorized, dto.Response{
			Code:    http.StatusUnauthorized,
			Message: "Tên đăng nhập hoặc mật khẩu không đúng",
		})
		return
	}

	loginAttemptDetector.Reset(req.Username)

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "Login successful",
		Data: gin.H{
			"user_id":             user.ID,
			"username":            user.Username,
			"privateEncryptedKey": user.PrivateEncryptedKey,
			"salt":                user.Salt,
			"iv":                  user.IV,
		},
	})
}