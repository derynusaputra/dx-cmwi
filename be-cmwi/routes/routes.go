package routes

import (
	"be-test1/handlers"
	"be-test1/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// ── Auth (public) ──────────────────────────────────────────────────────────
	auth := r.Group("/auth")
	{
		auth.POST("/login", handlers.Login)
		auth.POST("/register", handlers.Register)
		auth.POST("/refresh", handlers.RefreshTokenHandler)
		auth.POST("/logout", handlers.Logout)
	}

	// ── User (auth required) ───────────────────────────────────────────────────
	user := r.Group("/user")
	user.Use(middleware.AuthRequired())
	{
		user.GET("/profile", handlers.GetProfile)
	}

	// ── Upload (auth required) ─────────────────────────────────────────────────
	upload := r.Group("/uploads")
	upload.Use(middleware.AuthRequired())
	{
		upload.POST("", handlers.UploadFile)
	}

	// ── Painting Inspections (auth required) ───────────────────────────────────
	painting := r.Group("/painting-inspections")
	painting.Use(middleware.AuthRequired())
	{
		painting.POST("", handlers.CreatePaintingInspection)
		painting.GET("", handlers.GetPaintingInspections)
		painting.GET("/:id", handlers.GetPaintingInspection)
		painting.PUT("/:id/approve", handlers.ApprovePaintingInspection)
		painting.DELETE("/:id", handlers.DeletePaintingInspection)
	}

	// ── QCR (auth required) ────────────────────────────────────────────────────
	qcr := r.Group("/qcr")
	qcr.Use(middleware.AuthRequired())
	{
		// Semua user yang login bisa buat dan lihat QCR
		qcr.POST("", handlers.CreateQCR)
		qcr.GET("", handlers.GetQCRs)
		qcr.GET("/my-assignments", handlers.GetMyQCRAssignments)
		qcr.GET("/inspectors", handlers.GetInspectors)
		qcr.GET("/:id", handlers.GetQCR)

		// Approve: hanya role yang relevan di setiap tahap workflow
		// (dept_section check untuk re_mg tetap ada di dalam handler ApproveQCR)
		qcr.PUT("/:id/approve",
			middleware.RequireRole("re_mg", "gl", "spv", "amg"),
			handlers.ApproveQCR,
		)

		// Receive (Assign Inspector): khusus untuk GL (dan superadmin/admin)
		qcr.PUT("/:id/receive",
			middleware.RequireRole("gl"),
			handlers.ReceiveQCR,
		)

		// Start check: inspector, QC-GL, atau operator
		qcr.PUT("/:id/start",
			middleware.RequireRole("qc_inspector", "gl", "operator"),
			handlers.StartQCRCheck,
		)

		// Submit report: inspector, QC-GL, atau operator
		qcr.PUT("/:id/submit-report",
			middleware.RequireRole("qc_inspector", "gl", "operator"),
			handlers.SubmitQCRReport,
		)

		// Delete: semua user yang login (bisa diperketat nanti)
		qcr.DELETE("/:id", handlers.DeleteQCR)
	}
}
