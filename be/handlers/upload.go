package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

var allowedImageExts = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
}

var allowedDocExts = map[string]bool{
	".pdf": true, ".xlsx": true, ".xls": true, ".docx": true, ".doc": true, ".csv": true,
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
}

const maxFileSize = 10 << 20 // 10 MB

func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "File tidak ditemukan"})
		return
	}

	if file.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Ukuran file maksimal 10MB"})
		return
	}

	category := c.DefaultPostForm("category", "general")
	ext := strings.ToLower(filepath.Ext(file.Filename))

	if category == "photo" {
		if !allowedImageExts[ext] {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Format foto harus JPG, PNG, WEBP, atau GIF"})
			return
		}
	} else {
		if !allowedDocExts[ext] {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Format file tidak didukung"})
			return
		}
	}

	uploadDir := filepath.Join("uploads", category)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal membuat folder upload"})
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixMilli(), file.Filename)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan file"})
		return
	}

	fileURL := fmt.Sprintf("/files/%s/%s", category, filename)

	c.JSON(http.StatusOK, gin.H{
		"url":      fileURL,
		"filename": file.Filename,
		"size":     file.Size,
	})
}
