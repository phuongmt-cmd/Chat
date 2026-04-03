package bootstrap

import (
	"fmt"
	"log"

	domainSecurity "github.com/phuongaz/chatchat/internal/domain/security"
	"github.com/phuongaz/chatchat/internal/infra/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectMySQL() *gorm.DB {
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true",
		"root", "Maiphuong03@", "localhost:3306", "chatchat")

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect MySQL:", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Printf("Failed to migrate User table: %v", err)
	}

	err = db.AutoMigrate(&models.Conversation{})
	if err != nil {
		log.Printf("Failed to migrate Conversation table: %v", err)
	}

	err = db.AutoMigrate(&models.Messages{})
	if err != nil {
		log.Printf("Failed to migrate Messages table: %v", err)
	}

	err = db.AutoMigrate(&models.ConversationHistory{})
	if err != nil {
		log.Printf("Failed to migrate ConversationHistory table: %v", err)
	}

	err = db.AutoMigrate(&domainSecurity.Incident{})
	if err != nil {
		log.Printf("Failed to migrate Incident table: %v", err)
	}

	log.Println("Database migration completed successfully")
	return db
}