package handlers

import (
	"be-test1/config"
	"be-test1/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreatePaintingRequest struct {
	Date           string                 `json:"date" binding:"required"`
	Shift          string                 `json:"shift" binding:"required"`
	Group          string                 `json:"group" binding:"required"`
	Inspector      string                 `json:"inspector" binding:"required"`
	PaintingStatus string                 `json:"painting_status" binding:"required"`
	WheelType      string                 `json:"wheel_type" binding:"required"`
	Line           string                 `json:"line"`
	Brightness     map[string]interface{} `json:"brightness"`
	Thickness      map[string]interface{} `json:"thickness"`
	Gloss          map[string]interface{} `json:"gloss"`
	Photos         []string               `json:"photos"`
	Attachments    []string               `json:"attachments"`
	Comment        string                 `json:"comment"`
	Judgement      string                 `json:"judgement" binding:"required,oneof=OK NG"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof='Pending SPV' 'Pending GL' Approved Rejected"`
}

func CreatePaintingInspection(c *gin.Context) {
	var req CreatePaintingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid", "error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	inspection := models.PaintingInspection{
		Date:           req.Date,
		Shift:          req.Shift,
		GroupName:      req.Group,
		Inspector:      req.Inspector,
		PaintingStatus: req.PaintingStatus,
		WheelType:      req.WheelType,
		Line:           req.Line,
		Brightness:     models.JSONMap(req.Brightness),
		Thickness:      models.JSONMap(req.Thickness),
		Gloss:          models.JSONMap(req.Gloss),
		Photos:         models.StringArray(req.Photos),
		Attachments:    models.StringArray(req.Attachments),
		Comment:        req.Comment,
		Judgement:       req.Judgement,
		Status:         "Pending SPV",
		SubmittedBy:    userID.(uint),
	}

	if err := config.DB.Create(&inspection).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Inspection report berhasil disimpan",
		"data":    inspection,
	})
}

func GetPaintingInspections(c *gin.Context) {
	var inspections []models.PaintingInspection

	query := config.DB.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if line := c.Query("line"); line != "" {
		query = query.Where("line = ?", line)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("inspector ILIKE ? OR wheel_type ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if judgement := c.Query("judgement"); judgement != "" {
		query = query.Where("judgement = ?", judgement)
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
	query.Model(&models.PaintingInspection{}).Count(&total)

	query.Offset(offset).Limit(limit).Find(&inspections)

	c.JSON(http.StatusOK, gin.H{
		"data":  inspections,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func GetPaintingInspection(c *gin.Context) {
	id := c.Param("id")

	var inspection models.PaintingInspection
	if err := config.DB.First(&inspection, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": inspection})
}

func UpdatePaintingStatus(c *gin.Context) {
	id := c.Param("id")

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Status tidak valid"})
		return
	}

	result := config.DB.Model(&models.PaintingInspection{}).Where("id = ?", id).Update("status", req.Status)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status berhasil diupdate"})
}

func DeletePaintingInspection(c *gin.Context) {
	id := c.Param("id")

	result := config.DB.Delete(&models.PaintingInspection{}, id)
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data berhasil dihapus"})
}
