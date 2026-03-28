package models

import (
	"time"

	"gorm.io/gorm"
)

type PaintingInspection struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Date           string         `gorm:"size:20;not null" json:"date"`
	Shift          string         `gorm:"size:10;not null" json:"shift"`
	GroupName      string         `gorm:"size:10;not null" json:"group"`
	Inspector      string         `gorm:"size:100;not null" json:"inspector"`
	PaintingStatus string         `gorm:"size:50;not null" json:"painting_status"`
	WheelType      string         `gorm:"size:100;not null" json:"wheel_type"`
	Line           string         `gorm:"size:20" json:"line"`
	Brightness     JSONMap        `gorm:"type:jsonb;default:'{}'" json:"brightness"`
	Thickness      JSONMap        `gorm:"type:jsonb;default:'{}'" json:"thickness"`
	Gloss          JSONMap        `gorm:"type:jsonb;default:'{}'" json:"gloss"`
	Photos         StringArray    `gorm:"type:jsonb;default:'[]'" json:"photos"`
	Attachments    StringArray    `gorm:"type:jsonb;default:'[]'" json:"attachments"`
	Comment        string         `gorm:"type:text" json:"comment"`
	Judgement      string         `gorm:"size:5;not null" json:"judgement"`
	Status         string         `gorm:"size:30;not null;default:'Pending SPV'" json:"status"`
	SubmittedBy    uint           `gorm:"not null" json:"submitted_by"`
	User           User           `gorm:"foreignKey:SubmittedBy" json:"user,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
