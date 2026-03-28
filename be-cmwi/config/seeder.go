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
