package handlers

import (
	"be-test1/config"
	"be-test1/models"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// ── Status flow maps ──────────────────────────────────────────────────────────

var qcrStatusToRole = map[string]string{
	"Pending Request Manager": "re_mg",
	"Pending QC-GL Approval": "gl",
	"Pending QC-SPV":         "spv",
	"Pending QC-AMG":         "amg",
}

var qcrNextStatus = map[string]string{
	"Pending Request Manager": "Pending QC-GL",
	"Pending QC-GL Approval": "Pending QC-SPV",
	"Pending QC-SPV":         "Pending QC-AMG",
	"Pending QC-AMG":         "Completed",
}

var qcrRoleLabel = map[string]string{
	"Pending Request Manager": "RE_MG",
	"Pending QC-GL Approval": "GL",
	"Pending QC-SPV":         "SPV",
	"Pending QC-AMG":         "AMG",
}

// ── Request structs ───────────────────────────────────────────────────────────

type CreateQCRRequest struct {
	DateRequest      string                 `json:"date_request" binding:"required"`
	DeptSection      string                 `json:"dept_section" binding:"required"`
	Purpose          string                 `json:"purpose"`
	WheelPhase       string                 `json:"wheel_phase" binding:"required"`
	ProcessWheel     string                 `json:"process_wheel" binding:"required"`
	ProductStatus    string                 `json:"product_status" binding:"required"`
	UrgencyLevel     string                 `json:"urgency_level" binding:"required"`
	TypeWheel        string                 `json:"type_wheel"`
	NoMold           string                 `json:"no_mold"`
	NoLineMachining  string                 `json:"no_line_machining"`
	NoShot           string                 `json:"no_shot"`
	LotPainting      string                 `json:"lot_painting"`
	Durability       map[string]interface{} `json:"durability"`
	Capability       map[string]interface{} `json:"capability"`
	PaintPerformance map[string]interface{} `json:"paint_performance"`
	Spore            string                 `json:"spore"`
	SpecialNotes     string                 `json:"special_notes"`
	EmailSLSPV       string                 `json:"email_sl_spv"`
	EmailAMGMGR      string                 `json:"email_amg_mgr"`
	StartCheck       string                 `json:"start_check"`
}

type QCRApproveRequest struct {
	Action  string `json:"action" binding:"required,oneof=approved rejected"`
	Comment string `json:"comment"`
}

type QCRReceiveRequest struct {
	FinishTarget string `json:"finish_target"` // "YYYY-MM-DD"
	InspectorIDs []uint `json:"inspector_ids" binding:"required,min=1"`
}

type QCRReportRequest struct {
	Judgement   string   `json:"judgement" binding:"required,oneof=OK NG"`
	ReportFiles []string `json:"report_files"`
	Comment     string   `json:"comment"`
}

// ── Handlers ──────────────────────────────────────────────────────────────────

func CreateQCR(c *gin.Context) {
	var req CreateQCRRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid", "error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

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
		Status:           "Pending Request Manager",
		SubmittedBy:      userID.(uint),
		StartCheck:       startCheckPtr,
	}

	if err := config.DB.Create(&qcr).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "QCR berhasil disimpan", "data": qcr})
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
	if limit < 1 || limit > 10000 {
		limit = 10
	}
	offset := (page - 1) * limit

	var total int64
	query.Model(&models.QCR{}).Count(&total)

	query.Preload("User").Preload("Assignments.Inspector").Preload("Approvals").
		Offset(offset).Limit(limit).Find(&qcrs)

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
	if err := config.DB.Preload("User").Preload("Assignments.Inspector").Preload("Approvals").
		First(&qcr, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": qcr})
}

// ApproveQCR handles approval/rejection for: SL, Request Manager, QC-GL (post-report), QC-SPV, QC-AMG
func ApproveQCR(c *gin.Context) {
	id := c.Param("id")

	var req QCRApproveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Action harus 'approved' atau 'rejected'"})
		return
	}

	if req.Action == "rejected" && req.Comment == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Komentar wajib diisi saat menolak"})
		return
	}

	var qcr models.QCR
	if err := config.DB.First(&qcr, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	requiredRole, ok := qcrStatusToRole[qcr.Status]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("Status '%s' tidak bisa di-approve/reject melalui endpoint ini", qcr.Status)})
		return
	}

	userRoles, _ := c.Get("roles")
	roles, _ := userRoles.([]string)
	username, _ := c.Get("username")
	userID, _ := c.Get("user_id")

	// Cek apakah role user sesuai dengan status QCR saat ini
	// (middleware RequireRole sudah memastikan user punya salah satu role QCR,
	// tapi di sini kita perlu pastikan role-nya cocok dengan STATUS-nya)
	if !hasRole(roles, requiredRole) && !hasRole(roles, "superadmin") && !hasRole(roles, "admin") {
		c.JSON(http.StatusForbidden, gin.H{
			"message": fmt.Sprintf("Status '%s' hanya bisa diproses oleh role '%s', bukan role Anda saat ini", qcr.Status, requiredRole),
		})
		return
	}

	// Check DeptSection match for SL and Request Managers
	if (requiredRole == "sl_requester" || requiredRole == "re_mg") && !hasRole(roles, "superadmin") && !hasRole(roles, "admin") {
		var approver models.User
		if err := config.DB.First(&approver, userID).Error; err == nil {
			if approver.DeptSection == "" {
				c.JSON(http.StatusForbidden, gin.H{
					"message": fmt.Sprintf("Akun Anda belum memiliki Dept/Section. Minta admin untuk mengisi dept_section agar bisa memproses QCR dari dept '%s'.", qcr.DeptSection),
				})
				return
			}
			if approver.DeptSection != qcr.DeptSection {
				c.JSON(http.StatusForbidden, gin.H{
					"message": fmt.Sprintf("Akses ditolak. QCR ini milik dept '%s', sedangkan Anda terdaftar di dept '%s'.", qcr.DeptSection, approver.DeptSection),
				})
				return
			}
		}
	}

	label := qcrRoleLabel[qcr.Status]
	var newStatus string
	if req.Action == "approved" {
		newStatus = qcrNextStatus[qcr.Status]
	} else {
		newStatus = fmt.Sprintf("Rejected by %s", label)
	}

	approval := models.QCRApproval{
		QCRID:        qcr.ID,
		Role:         label,
		Action:       req.Action,
		Comment:      req.Comment,
		ApprovedBy:   userID.(uint),
		ApproverName: username.(string),
	}

	tx := config.DB.Begin()
	if err := tx.Create(&approval).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan approval"})
		return
	}
	if err := tx.Model(&qcr).Update("status", newStatus).Error; err != nil {
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

// ReceiveQCR is called by QC-GL to receive/reject and assign inspectors
func ReceiveQCR(c *gin.Context) {
	id := c.Param("id")

	var req QCRReceiveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid: " + err.Error()})
		return
	}

	var qcr models.QCR
	if err := config.DB.First(&qcr, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	if qcr.Status != "Pending QC-GL" {
		c.JSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("QCR harus berstatus 'Pending QC-GL', saat ini: '%s'", qcr.Status)})
		return
	}

	userID, _ := c.Get("user_id")

	now := time.Now()
	uid := userID.(uint)

	updates := map[string]interface{}{
		"status":         "Assigned",
		"received_by_id": uid,
		"received_at":    now,
	}
	if req.FinishTarget != "" {
		t, err := time.Parse("2006-01-02", req.FinishTarget)
		if err == nil {
			updates["finish_target"] = t
		}
	}

	tx := config.DB.Begin()

	if err := tx.Model(&qcr).Updates(updates).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal update QCR"})
		return
	}

	// Delete existing assignments and re-create
	tx.Where("qcr_id = ?", qcr.ID).Delete(&models.QCRAssignment{})
	for _, inspID := range req.InspectorIDs {
		asgn := models.QCRAssignment{
			QCRID:       qcr.ID,
			InspectorID: inspID,
			AssignedBy:  uid,
		}
		if err := tx.Create(&asgn).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal assign inspector"})
			return
		}
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "QCR berhasil diterima dan inspector di-assign", "new_status": "Assigned"})
}

// StartQCRCheck is called by assigned QC-Inspector to mark start of check
func StartQCRCheck(c *gin.Context) {
	id := c.Param("id")

	var qcr models.QCR
	if err := config.DB.First(&qcr, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	if qcr.Status != "Assigned" {
		c.JSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("QCR harus berstatus 'Assigned', saat ini: '%s'", qcr.Status)})
		return
	}


	now := time.Now()
	if err := config.DB.Model(&qcr).Updates(map[string]interface{}{
		"status":      "In Progress",
		"start_check": now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Check dimulai", "new_status": "In Progress", "start_check": now})
}

// SubmitQCRReport is called by QC-Inspector when check is done
func SubmitQCRReport(c *gin.Context) {
	id := c.Param("id")

	var req QCRReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid: " + err.Error()})
		return
	}

	if req.Judgement == "NG" && req.Comment == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Komentar wajib diisi untuk judgement NG"})
		return
	}

	var qcr models.QCR
	if err := config.DB.First(&qcr, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data tidak ditemukan"})
		return
	}

	if qcr.Status != "In Progress" {
		c.JSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("QCR harus berstatus 'In Progress', saat ini: '%s'", qcr.Status)})
		return
	}


	now := time.Now()
	updates := map[string]interface{}{
		"status":            "Pending QC-GL Approval",
		"judgement":         req.Judgement,
		"report_files":      models.StringArray(req.ReportFiles),
		"inspector_comment": req.Comment,
		"finish_check":      now,
	}

	if err := config.DB.Model(&qcr).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report berhasil dikirim, menunggu approval QC-GL", "new_status": "Pending QC-GL Approval"})
}

// GetMyQCRAssignments returns QCRs assigned to the logged-in inspector
func GetMyQCRAssignments(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var assignments []models.QCRAssignment
	config.DB.Where("inspector_id = ?", userID.(uint)).Find(&assignments)

	if len(assignments) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []interface{}{}, "total": 0})
		return
	}

	var qcrIDs []uint
	for _, a := range assignments {
		qcrIDs = append(qcrIDs, a.QCRID)
	}

	var qcrs []models.QCR
	config.DB.Where("id IN ?", qcrIDs).
		Preload("User").Preload("Assignments.Inspector").Preload("Approvals").
		Order("created_at DESC").Find(&qcrs)

	c.JSON(http.StatusOK, gin.H{"data": qcrs, "total": len(qcrs)})
}

// GetInspectors returns all users with qc_inspector or operator role (for QC-GL assign dropdown)
func GetInspectors(c *gin.Context) {
	var users []models.User
	// PostgreSQL JSONB contains query
	config.DB.Where("roles::jsonb @> ? OR roles::jsonb @> ?", `["qc_inspector"]`, `["operator"]`).Find(&users)
	c.JSON(http.StatusOK, gin.H{"data": users})
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
