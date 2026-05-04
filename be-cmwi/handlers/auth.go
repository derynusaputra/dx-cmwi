package handlers

import (
	"be-test1/config"
	"be-test1/models"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string   `json:"username" binding:"required"`
	Password string   `json:"password" binding:"required,min=4"`
	Name     string   `json:"name"`
	Roles    []string `json:"roles"`
}

func generateAccessToken(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"id":       user.ID,
		"username": user.Username,
		"roles":    user.Roles,
		"exp":      time.Now().Add(15 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func generateRefreshTokenString() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Username dan password wajib diisi"})
		return
	}

	var user models.User
	if err := config.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Username atau password salah"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Username atau password salah"})
		return
	}

	accessToken, err := generateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		return
	}

	refreshTokenStr, err := generateRefreshTokenString()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate refresh token"})
		return
	}

	refreshToken := models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshTokenStr,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	config.DB.Create(&refreshToken)

	isHTTPS := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("refresh_token", refreshTokenStr, 7*24*3600, "/", "", isHTTPS, true)

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
		"user": gin.H{
			"id":           user.ID,
			"username":     user.Username,
			"name":         user.Name,
			"dept_section": user.DeptSection,
			"roles":        user.Roles,
		},
	})
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Username dan password wajib diisi (min 4 karakter)"})
		return
	}

	var existing models.User
	if config.DB.Where("username = ?", req.Username).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Username sudah digunakan"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to hash password"})
		return
	}

	roles := models.StringArray{"operator"}
	if len(req.Roles) > 0 {
		roles = req.Roles
	}

	user := models.User{
		Username:     req.Username,
		PasswordHash: string(hashed),
		Name:         req.Name,
		Roles:        roles,
	}
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi berhasil"})
}

func RefreshTokenHandler(c *gin.Context) {
	tokenStr, err := c.Cookie("refresh_token")
	if err != nil || tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "No refresh token"})
		return
	}

	var rt models.RefreshToken
	if err := config.DB.Where("token = ?", tokenStr).First(&rt).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
		return
	}

	if time.Now().After(rt.ExpiresAt) {
		config.DB.Delete(&rt)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Token expired"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, rt.UserID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found"})
		return
	}

	accessToken, err := generateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
		"user": gin.H{
			"id":           user.ID,
			"username":     user.Username,
			"name":         user.Name,
			"dept_section": user.DeptSection,
			"roles":        user.Roles,
		},
	})
}

func Logout(c *gin.Context) {
	tokenStr, _ := c.Cookie("refresh_token")
	if tokenStr != "" {
		config.DB.Where("token = ?", tokenStr).Delete(&models.RefreshToken{})
	}

	isHTTPS := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("refresh_token", "", -1, "/", "", isHTTPS, true)
	c.SetCookie("active_role", "", -1, "/", "", isHTTPS, false)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"profile": gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"roles":      user.Roles,
			"created_at": user.CreatedAt,
		},
	})
}
