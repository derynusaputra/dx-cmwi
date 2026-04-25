package routes

import (
	"be-test1/handlers"
	"be-test1/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	auth := r.Group("/auth")
	{
		auth.POST("/login", handlers.Login)
		auth.POST("/register", handlers.Register)
		auth.POST("/refresh", handlers.RefreshTokenHandler)
		auth.POST("/logout", handlers.Logout)
	}

	user := r.Group("/user")
	user.Use(middleware.AuthRequired())
	{
		user.GET("/profile", handlers.GetProfile)
	}

	upload := r.Group("/uploads")
	upload.Use(middleware.AuthRequired())
	{
		upload.POST("", handlers.UploadFile)
	}

	painting := r.Group("/painting-inspections")
	painting.Use(middleware.AuthRequired())
	{
		painting.POST("", handlers.CreatePaintingInspection)
		painting.GET("", handlers.GetPaintingInspections)
		painting.GET("/:id", handlers.GetPaintingInspection)
		painting.PUT("/:id/approve", handlers.ApprovePaintingInspection)
		painting.DELETE("/:id", handlers.DeletePaintingInspection)
	}

	qcr := r.Group("/qcr")
	qcr.Use(middleware.AuthRequired())
	{
		qcr.POST("", handlers.CreateQCR)
		qcr.GET("", handlers.GetQCRs)
		qcr.GET("/:id", handlers.GetQCR)
		qcr.DELETE("/:id", handlers.DeleteQCR)
	}
}
