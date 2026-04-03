package handler

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	chatDomain "github.com/phuongaz/chatchat/internal/domain/chat"
	"github.com/phuongaz/chatchat/internal/dto"
	security "github.com/phuongaz/chatchat/internal/security"
	chatUsecase "github.com/phuongaz/chatchat/internal/usecase/chat"
)

var incidentStore = security.NewIncidentStore()
var floodDetector = security.NewFloodDetector(5, 10*time.Second, incidentStore)

type ChatHandler struct {
	chatUC chatUsecase.ChatUsecase
}

func NewChatHandler(chatUC chatUsecase.ChatUsecase) *ChatHandler {
	return &ChatHandler{chatUC: chatUC}
}

func (h *ChatHandler) HistoryChats(c *gin.Context) {
	senderIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.Response{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	userID, ok := senderIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: "Invalid user ID format",
		})
		return
	}

	chats, err := h.chatUC.GetChatList(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "History chats",
		Data: gin.H{
			"chats": chats,
		},
	})
}

func (h *ChatHandler) HistoryChatsByUserID(c *gin.Context) {
	userID := c.Param("userID")

	currentUserIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.Response{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	currentUserID, ok := currentUserIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: "Invalid user ID format",
		})
		return
	}

	conversationID, err := h.chatUC.GetOrCreateConversationID(c.Request.Context(), currentUserID, userID)
	if err != nil {
		log.Printf("Failed to get conversation ID: %v", err)
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	messages, err := h.chatUC.GetMessagesByConversationID(c.Request.Context(), conversationID)
	if err != nil {
		log.Printf("Failed to get messages for conversation %s: %v", conversationID, err)
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "Messages",
		Data: gin.H{
			"messages": messages,
		},
	})
}

func (h *ChatHandler) GetMessagesByConversationID(c *gin.Context) {
	conversationID := c.Param("conversationID")
	messages, err := h.chatUC.GetMessagesByConversationID(c.Request.Context(), conversationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "Messages",
		Data:    messages,
	})
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	var req struct {
		ReceiverID string `json:"receiver_id" binding:"required"`
		CipherText string `json:"cipher_text" binding:"required"`
		IV         string `json:"iv" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("SendMessage: Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, dto.Response{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	senderIDValue, exists := c.Get("userID")
	if !exists {
		log.Printf("SendMessage: No userID in context")
		c.JSON(http.StatusUnauthorized, dto.Response{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	senderID, ok := senderIDValue.(string)
	if !ok {
		log.Printf("SendMessage: Invalid userID format in context: %v", senderIDValue)
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: "Invalid user ID format",
		})
		return
	}

	// Phát hiện spam/flood
	if err := floodDetector.Check(senderID); err != nil {
		log.Printf("SendMessage: Flood detected for user %s: %v", senderID, err)
		c.JSON(http.StatusTooManyRequests, dto.Response{
			Code:    http.StatusTooManyRequests,
			Message: err.Error(),
		})
		return
	}

	// Lưu ý:
	// Ở đây backend chỉ nhận ciphertext + iv, không có plaintext message.
	// Vì vậy không thể kiểm tra trực tiếp XSS/suspicious content trong handler này.
	// Việc phát hiện nội dung nghi ngờ nên làm ở frontend trước khi mã hóa
	// hoặc ở một endpoint riêng nếu frontend gửi signal cảnh báo.

	encryptedMsg := chatDomain.EncryptedMessage{
		SenderID:   senderID,
		ReceiverID: req.ReceiverID,
		CipherText: req.CipherText,
		IV:         req.IV,
		Timestamp:  time.Now().Unix(),
	}

	err := h.chatUC.SendMessage(c.Request.Context(), encryptedMsg)
	if err != nil {
		log.Printf("SendMessage: Failed to send message: %v", err)
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	log.Printf("SendMessage: Successfully sent message from %s to %s", senderID, req.ReceiverID)
	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "Message sent successfully",
		Data: gin.H{
			"message_id": time.Now().Unix(),
			"timestamp":  encryptedMsg.Timestamp,
		},
	})
}

func (h *ChatHandler) DeleteConversation(c *gin.Context) {
	conversationID := c.Param("conversationID")

	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.Response{
			Code:    http.StatusUnauthorized,
			Message: "User not authenticated",
		})
		return
	}

	userID, ok := userIDValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: "Invalid user ID format",
		})
		return
	}

	err := h.chatUC.DeleteConversation(c.Request.Context(), conversationID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Response{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Code:    http.StatusOK,
		Message: "Conversation deleted successfully",
	})
}