package models

import (
	"time"

	"gorm.io/gorm"
)

type QCR struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	DateRequest     string         `gorm:"size:20;not null" json:"date_request"`
	DeptSection     string         `gorm:"size:100;not null" json:"dept_section"`
	Purpose         string         `gorm:"type:text" json:"purpose"`
	WheelPhase      string         `gorm:"size:100;not null" json:"wheel_phase"`
	ProcessWheel    string         `gorm:"size:100;not null" json:"process_wheel"`
	ProductStatus   string         `gorm:"size:50;not null" json:"product_status"`
	UrgencyLevel    string         `gorm:"size:30;not null" json:"urgency_level"`
	TypeWheel       string         `gorm:"size:100" json:"type_wheel"`
	NoMold          string         `gorm:"size:20" json:"no_mold"`
	NoLineMachining string         `gorm:"size:20" json:"no_line_machining"`
	NoShot          string         `gorm:"size:100" json:"no_shot"`
	LotPainting     string         `gorm:"size:100" json:"lot_painting"`
	// Item Evaluasi — stored as JSONB
	Durability       JSONMap `gorm:"type:jsonb;default:'{}'" json:"durability"`
	Capability       JSONMap `gorm:"type:jsonb;default:'{}'" json:"capability"`
	PaintPerformance JSONMap `gorm:"type:jsonb;default:'{}'" json:"paint_performance"`
	Spore            string  `gorm:"type:text" json:"spore"`
	SpecialNotes     string  `gorm:"type:text" json:"special_notes"`
	EmailSLSPV       string  `gorm:"size:200" json:"email_sl_spv"`
	EmailAMGMGR      string  `gorm:"size:200" json:"email_amg_mgr"`
	// Meta
	Status      string         `gorm:"size:30;not null;default:'Pending'" json:"status"`
	SubmittedBy uint           `gorm:"not null" json:"submitted_by"`
	User        User           `gorm:"foreignKey:SubmittedBy" json:"user,omitempty"`
	StartCheck  *time.Time     `gorm:"type:timestamptz" json:"start_check"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
