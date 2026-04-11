package handlers

import (
	"be-test1/config"
	"be-test1/models"
	"fmt"
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

type ApproveRequest struct {
	Action  string `json:"action" binding:"required,oneof=approved rejected"`
	Comment string `json:"comment"`
}

// Mapping: current status → required role that can act on it
var statusToRole = map[string]string{
	"Pending GL":  "gl",
	"Pending SPV": "spv",
	"Pending AMG": "amg",
}

// Mapping: current status → next status after approval
var nextStatus = map[string]string{
	"Pending GL":  "Pending SPV",
	"Pending SPV": "Pending AMG",
	"Pending AMG": "Approved",
}

// Mapping: current status → role label for rejection message
var roleLabel = map[string]string{
	"Pending GL":  "GL",
	"Pending SPV": "SPV",
	"Pending AMG": "AMG",
}

func hasRole(roles []string, target string) bool {
	for _, r := range roles {
		if r == target {
			return true
		}
	}
	return false
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
		Status:         "Pending GL",
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
	if wheelType := c.Query("wheel_type"); wheelType != "" {
		query = query.Where("wheel_type = ?", wheelType)
	}
	if dateFrom := c.Query("date_from"); dateFrom != "" {
		query = query.Where("date >= ?", dateFrom)
	}
	if dateTo := c.Query("date_to"); dateTo != "" {
		query = query.Where("date <= ?", dateTo)
	}
	if inspector := c.Query("inspector"); inspector != "" {
		query = query.Where("inspector ILIKE ?", "%"+inspector+"%")
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

	query.Preload("Approvals").Offset(offset).Limit(limit).Find(&inspections)

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
	if err := config.DB.Preload("Approvals").First(&inspection, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": inspection})
}

func ApprovePaintingInspection(c *gin.Context) {
	id := c.Param("id")

	var req ApproveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Action harus 'approved' atau 'rejected'"})
		return
	}

	// Reject requires a comment
	if req.Action == "rejected" && req.Comment == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Komentar wajib diisi saat menolak"})
		return
	}

	// Get the inspection
	var inspection models.PaintingInspection
	if err := config.DB.First(&inspection, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	// Check if status is actionable
	requiredRole, ok := statusToRole[inspection.Status]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("Status '%s' tidak dapat di-approve/reject", inspection.Status)})
		return
	}

	// Check user role - STRICT enforcement: GL can only act on Pending GL, etc.
	userRoles, _ := c.Get("roles")
	roles, _ := userRoles.([]string)
	username, _ := c.Get("username")
	userID, _ := c.Get("user_id")

	if !hasRole(roles, requiredRole) && !hasRole(roles, "superadmin") && !hasRole(roles, "admin") {
		c.JSON(http.StatusForbidden, gin.H{
			"message": fmt.Sprintf("Anda tidak memiliki akses. Status saat ini '%s' hanya bisa diproses oleh role '%s'", inspection.Status, requiredRole),
		})
		return
	}

	// Determine new status
	var newStatus string
	label := roleLabel[inspection.Status]
	if req.Action == "approved" {
		newStatus = nextStatus[inspection.Status]
	} else {
		newStatus = fmt.Sprintf("Rejected by %s", label)
	}

	// Create approval record
	approval := models.Approval{
		InspectionID: inspection.ID,
		Role:         label,
		Action:       req.Action,
		Comment:      req.Comment,
		ApprovedBy:   userID.(uint),
		ApproverName: username.(string),
	}

	// Use transaction to ensure atomicity
	tx := config.DB.Begin()

	if err := tx.Create(&approval).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan approval"})
		return
	}

	if err := tx.Model(&inspection).Update("status", newStatus).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal update status"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message":    fmt.Sprintf("Berhasil %s oleh %s", req.Action, label),
		"new_status": newStatus,
		"approval":   approval,
	})
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

