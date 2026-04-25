package models

import "time"

type Approval struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	InspectionID uint      `gorm:"not null;index" json:"inspection_id"`
	Role         string    `gorm:"size:20;not null" json:"role"`   // "GL", "SPV", "AMG"
	Action       string    `gorm:"size:20;not null" json:"action"` // "approved", "rejected"
	Comment      string    `gorm:"type:text" json:"comment"`
	ApprovedBy   uint      `gorm:"not null" json:"approved_by"`
	ApproverName string    `gorm:"size:100" json:"approver_name"`
	CreatedAt    time.Time `json:"created_at"`
}
