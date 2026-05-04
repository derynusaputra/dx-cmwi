package models

import "time"

// QCRApproval tracks each approval/rejection action in the QCR workflow
type QCRApproval struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	QCRID        uint      `gorm:"not null;index" json:"qcr_id"`
	Role         string    `gorm:"size:30;not null" json:"role"`   // "SL", "AMG_REQ", "QC_GL", "QC_SPV", "QC_AMG"
	Action       string    `gorm:"size:20;not null" json:"action"` // "approved", "rejected"
	Comment      string    `gorm:"type:text" json:"comment"`
	ApprovedBy   uint      `gorm:"not null" json:"approved_by"`
	ApproverName string    `gorm:"size:100" json:"approver_name"`
	CreatedAt    time.Time `json:"created_at"`
}
