package main

import (
	"be-test1/config"
	"be-test1/models"
	"be-test1/routes"
	"log"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	config.ConnectDatabase()

	config.DB.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.PaintingInspection{},
		&models.Approval{},
		&models.QCR{},
		&models.QCRAssignment{},
		&models.QCRApproval{},
	)

	config.SeedDefaultUsers()
	config.SeedApprovalUsers()
	config.SeedQCRUsers()

	r := gin.Default()

	origins := []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	if extra := os.Getenv("CORS_ORIGINS"); extra != "" {
		for _, o := range strings.Split(extra, ",") {
			o = strings.TrimSpace(o)
			if o != "" {
				origins = append(origins, o)
			}
		}
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	os.MkdirAll("uploads", 0755)
	r.Static("/files", "./uploads")

	routes.SetupRoutes(r)

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
