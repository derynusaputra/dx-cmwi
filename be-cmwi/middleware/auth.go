package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization header required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization format"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(parts[1], func(t *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or expired token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token claims"})
			c.Abort()
			return
		}

		userID, _ := claims["id"].(float64)
		username, _ := claims["username"].(string)

		// Extract roles from JWT claims
		var roles []string
		if rawRoles, ok := claims["roles"].([]interface{}); ok {
			for _, r := range rawRoles {
				if s, ok := r.(string); ok {
					roles = append(roles, s)
				}
			}
		}

		c.Set("user_id", uint(userID))
		c.Set("username", username)
		c.Set("roles", roles)
		c.Next()
	}
}

// RequireRole returns a middleware that allows access only if the authenticated user
// has at least one of the specified roles. superadmin and admin always bypass this check.
//
// Usage:
//   qcr.PUT("/:id/approve", middleware.RequireRole("re_mg", "qc_gl", "qc_spv", "qc_amg"), handlers.ApproveQCR)
func RequireRole(allowed ...string) gin.HandlerFunc {
	allowedSet := make(map[string]struct{}, len(allowed))
	for _, r := range allowed {
		allowedSet[r] = struct{}{}
	}

	return func(c *gin.Context) {
		userRoles, _ := c.Get("roles")
		roles, _ := userRoles.([]string)

		// superadmin and admin always bypass role checks
		for _, r := range roles {
			if r == "superadmin" || r == "admin" {
				c.Next()
				return
			}
		}

		// Check if user has at least one of the allowed roles
		for _, r := range roles {
			if _, ok := allowedSet[r]; ok {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"message": "Akses ditolak. Role yang diizinkan: " + strings.Join(allowed, ", "),
		})
		c.Abort()
	}
}
