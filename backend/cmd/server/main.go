package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/phuongaz/chatchat/internal/bootstrap"
	"github.com/phuongaz/chatchat/internal/delivery/http"
	"github.com/phuongaz/chatchat/internal/infra/repo"
	"github.com/phuongaz/chatchat/internal/usecase/auth"
	"github.com/phuongaz/chatchat/internal/usecase/chat"
	"github.com/phuongaz/chatchat/internal/usecase/user"
	"github.com/phuongaz/chatchat/pkg/jwt"
)

func main() {
	jwtSecret := os.Getenv("JWT_SECRET_KEY")

	db := bootstrap.ConnectMySQL()

	userRepo := repo.NewMysqlUserRepo(db)
	chatRepo := repo.NewMysqlChatRepo(db)

	jwtMaker := jwt.NewJWT(jwtSecret)
	authUC := auth.NewAuthUsecase(userRepo, jwtMaker)
	userUC := user.NewUserUsecase(userRepo)
	chatUC := chat.NewChatUsecase(chatRepo)

	// 👇 tạo router trước
	router := http.NewRouter(authUC, chatUC, userUC)

	// 👇 thêm CORS sau
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	log.Printf("Server starting on port 8089...")
	router.Run(":8089")
}