package http

import (
	"github.com/gin-gonic/gin"
	"github.com/phuongaz/chatchat/internal/delivery/http/handler"
	"github.com/phuongaz/chatchat/internal/delivery/websocket"
	middleware "github.com/phuongaz/chatchat/internal/infra/auth"
	"github.com/phuongaz/chatchat/internal/usecase/auth"
	"github.com/phuongaz/chatchat/internal/usecase/chat"
	"github.com/phuongaz/chatchat/internal/usecase/user"
)

func NewRouter(authUC auth.AuthUsecase, chatUC chat.ChatUsecase, userUC user.UserUsecase) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORS())

	api := r.Group("/api")

	authGroup := api.Group("/auth")
	{
		authHandler := handler.NewAuthHandler(authUC, userUC)
		authGroup.POST("/check-register", authHandler.CheckRegister)
		authGroup.POST("/pre-login", authHandler.PreLogin)
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)
	}

	chatGroup := api.Group("/chat")
	chatGroup.Use(middleware.JWTMiddleware())
	{
		chatHandler := handler.NewChatHandler(chatUC)
		chatGroup.POST("/send-message", chatHandler.SendMessage)
		chatGroup.GET("/history", chatHandler.HistoryChats)
		chatGroup.GET("/history/:userID", chatHandler.HistoryChatsByUserID)
		chatGroup.GET("/messages/:conversationID", chatHandler.GetMessagesByConversationID)
		chatGroup.DELETE("/conversation/:conversationID", chatHandler.DeleteConversation)
	}

	userGroup := api.Group("/user")
	{
		userHandler := handler.NewUserHandler(userUC)
		userGroup.GET("/public-key/:userID", userHandler.GetPublicKey)
		userGroup.GET("/search", userHandler.SearchUser)
		userGroup.GET("/:userID", userHandler.GetUser)
	}

	securityGroup := api.Group("/security")
	securityGroup.Use(middleware.JWTMiddleware())
	{
		securityHandler := handler.NewSecurityHandler()
		reportHandler := handler.NewSecurityReportHandler()

		securityGroup.GET("/incidents", securityHandler.GetIncidents)
		securityGroup.POST("/report", reportHandler.ReportSuspiciousContent)
		securityGroup.PUT("/incident/:id/resolve", securityHandler.ResolveIncident)
	}

	ws := websocket.NewWebSocketHandler(chatUC, userUC)
	api.GET("/ws", ws.HandleMessage)
	api.GET("/ws/:userID", ws.HandleMessage)

	return r
}