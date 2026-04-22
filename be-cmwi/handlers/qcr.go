package handlers

import (
	"be-test1/config"
	"be-test1/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateQCRRequest struct {
	DateRequest     string                 `json:"date_request" binding:"required"`
	DeptSection     string                 `json:"dept_section" binding:"required"`
	Purpose         string                 `json:"purpose"`
	WheelPhase      string                 `json:"wheel_phase" binding:"required"`
	ProcessWheel    string                 `json:"process_wheel" binding:"required"`
	ProductStatus   string                 `json:"product_status" binding:"required"`
	UrgencyLevel    string                 `json:"urgency_level" binding:"required"`
	TypeWheel       string                 `json:"type_wheel"`
	NoMold          string                 `json:"no_mold"`
	NoLineMachining string                 `json:"no_line_machining"`
	NoShot          string                 `json:"no_shot"`
	LotPainting     string                 `json:"lot_painting"`
	Durability      map[string]interface{} `json:"durability"`
	Capability      map[string]interface{} `json:"capability"`
	PaintPerformance map[string]interface{} `json:"paint_performance"`
	Spore           string                 `json:"spore"`
	SpecialNotes    string                 `json:"special_notes"`
	EmailSLSPV      string                 `json:"email_sl_spv"`
	EmailAMGMGR     string                 `json:"email_amg_mgr"`
	StartCheck      string                 `json:"start_check"`
}

func CreateQCR(c *gin.Context) {
	var req CreateQCRRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid", "error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	// Parse optional start_check timestamp (ISO 8601 from frontend)
	var startCheckPtr *time.Time
	if req.StartCheck != "" {
		parsed, err := time.Parse(time.RFC3339, req.StartCheck)
		if err == nil {
			startCheckPtr = &parsed
		}
	}

	qcr := models.QCR{
		DateRequest:      req.DateRequest,
		DeptSection:      req.DeptSection,
		Purpose:          req.Purpose,
		WheelPhase:       req.WheelPhase,
		ProcessWheel:     req.ProcessWheel,
		ProductStatus:    req.ProductStatus,
		UrgencyLevel:     req.UrgencyLevel,
		TypeWheel:        req.TypeWheel,
		NoMold:           req.NoMold,
		NoLineMachining:  req.NoLineMachining,
		NoShot:           req.NoShot,
		LotPainting:      req.LotPainting,
		Durability:       models.JSONMap(req.Durability),
		Capability:       models.JSONMap(req.Capability),
		PaintPerformance: models.JSONMap(req.PaintPerformance),
		Spore:            req.Spore,
		SpecialNotes:     req.SpecialNotes,
		EmailSLSPV:       req.EmailSLSPV,
		EmailAMGMGR:      req.EmailAMGMGR,
		Status:           "Pending",
		SubmittedBy:      userID.(uint),
		StartCheck:       startCheckPtr,
	}

	if err := config.DB.Create(&qcr).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "QCR berhasil disimpan",
		"data":    qcr,
	})
}

func GetQCRs(c *gin.Context) {
	var qcrs []models.QCR

	query := config.DB.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if dept := c.Query("dept_section"); dept != "" {
		query = query.Where("dept_section = ?", dept)
	}
	if urgency := c.Query("urgency_level"); urgency != "" {
		query = query.Where("urgency_level = ?", urgency)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("dept_section ILIKE ? OR type_wheel ILIKE ? OR purpose ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if dateFrom := c.Query("date_from"); dateFrom != "" {
		query = query.Where("date_request >= ?", dateFrom)
	}
	if dateTo := c.Query("date_to"); dateTo != "" {
		query = query.Where("date_request <= ?", dateTo)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	var total int64
	query.Model(&models.QCR{}).Count(&total)

	query.Preload("User").Offset(offset).Limit(limit).Find(&qcrs)

	c.JSON(http.StatusOK, gin.H{
		"data":  qcrs,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func GetQCR(c *gin.Context) {
	id := c.Param("id")

	var qcr models.QCR
	if err := config.DB.Preload("User").First(&qcr, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": qcr})
}

func DeleteQCR(c *gin.Context) {
	id := c.Param("id")

	result := config.DB.Delete(&models.QCR{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data berhasil dihapus"})
}
