package models

import "time"

// QCRAssignment links inspectors to a QCR request
type QCRAssignment struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	QCRID       uint      `gorm:"not null;index" json:"qcr_id"`
	InspectorID uint      `gorm:"not null" json:"inspector_id"`
	Inspector   User      `gorm:"foreignKey:InspectorID" json:"inspector,omitempty"`
	AssignedBy  uint      `gorm:"not null" json:"assigned_by"`
	CreatedAt   time.Time `json:"created_at"`
}
