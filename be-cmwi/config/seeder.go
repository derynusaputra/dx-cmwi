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
// SeedQCRUsers ensures all QCR workflow users exist
func SeedQCRUsers() {
	qcrUsers := []struct {
		Username    string
		Password    string
		Name        string
		DeptSection string
		Roles       models.StringArray
	}{
		// Requester side
		{Username: "requester1", Password: "req123", Name: "Requester PE Casting", DeptSection: "PE Casting", Roles: models.StringArray{"requester"}},
		{Username: "sl_casting", Password: "sl123", Name: "SL PE Casting", DeptSection: "PE Casting", Roles: models.StringArray{"sl_requester"}},
		{Username: "remg_casting", Password: "remg123", Name: "Request Manager PE Casting", DeptSection: "PE Casting", Roles: models.StringArray{"re_mg"}},
		// QC side
		{Username: "gl_qcr", Password: "gl123", Name: "QC Group Leader", Roles: models.StringArray{"qc_gl"}},
		{Username: "ara_rm", Password: "insp123", Name: "ARA R. M.", Roles: models.StringArray{"qc_inspector"}},
		{Username: "nurhadi", Password: "insp123", Name: "NURHADI", Roles: models.StringArray{"qc_inspector"}},
		{Username: "a_ginanjar", Password: "insp123", Name: "A. GINANJAR", Roles: models.StringArray{"qc_inspector"}},
		{Username: "rian_m", Password: "insp123", Name: "RIAN M.", Roles: models.StringArray{"qc_inspector"}},
		{Username: "hafiz_lu", Password: "insp123", Name: "HAFIZ L. U.", Roles: models.StringArray{"qc_inspector"}},
		{Username: "spv_qcr", Password: "spv123", Name: "QC Supervisor", Roles: models.StringArray{"qc_spv"}},
		{Username: "amg_qcr", Password: "amg123", Name: "QC Asst. Manager", Roles: models.StringArray{"qc_amg"}},
	}

	for _, u := range qcrUsers {
		var existing models.User
		if DB.Where("username = ?", u.Username).First(&existing).Error == nil {
			continue
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash password for %s: %v", u.Username, err)
			continue
		}

		user := models.User{
			Username:     u.Username,
			Name:         u.Name,
			DeptSection:  u.DeptSection,
			PasswordHash: string(hash),
			Roles:        u.Roles,
		}

		if err := DB.Create(&user).Error; err != nil {
			log.Printf("Failed to seed QCR user %s: %v", u.Username, err)
		} else {
			log.Printf("Seeded QCR user: %s (%s)", u.Username, u.Name)
		}
	}
}
