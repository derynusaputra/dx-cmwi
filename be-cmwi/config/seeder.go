package config

import (
	"be-test1/models"
	"log"

	"golang.org/x/crypto/bcrypt"
)

type seedUser struct {
	Username string
	Password string
	Roles    models.StringArray
}

func SeedDefaultUsers() {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}

	users := []seedUser{
		{Username: "superadmin", Password: "superadmin123", Roles: models.StringArray{"superadmin"}},
		{Username: "admin", Password: "admin123", Roles: models.StringArray{"admin"}},
		{Username: "operator", Password: "operator123", Roles: models.StringArray{"operator"}},
	}

	for _, u := range users {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash password for %s: %v", u.Username, err)
			continue
		}

		user := models.User{
			Username:     u.Username,
			PasswordHash: string(hash),
			Roles:        u.Roles,
		}

		if err := DB.Create(&user).Error; err != nil {
			log.Printf("Failed to seed user %s: %v", u.Username, err)
		} else {
			log.Printf("Seeded user: %s (password: %s, roles: %v)", u.Username, u.Password, u.Roles)
		}
	}
}

// SeedApprovalUsers ensures GL, SPV, and AMG users exist for the approval flow.
// This runs every startup and only creates users that don't exist yet.
func SeedApprovalUsers() {
	approvalUsers := []seedUser{
		{Username: "gl_painting", Password: "gl123", Roles: models.StringArray{"gl"}},
		{Username: "spv_painting", Password: "spv123", Roles: models.StringArray{"spv"}},
		{Username: "amg_painting", Password: "amg123", Roles: models.StringArray{"amg"}},
	}

	for _, u := range approvalUsers {
		var existing models.User
		if DB.Where("username = ?", u.Username).First(&existing).Error == nil {
			continue // user already exists
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash password for %s: %v", u.Username, err)
			continue
		}

		user := models.User{
			Username:     u.Username,
			PasswordHash: string(hash),
			Roles:        u.Roles,
		}

		if err := DB.Create(&user).Error; err != nil {
			log.Printf("Failed to seed approval user %s: %v", u.Username, err)
		} else {
			log.Printf("Seeded approval user: %s (password: %s, roles: %v)", u.Username, u.Password, u.Roles)
		}
	}
}

