package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

type StringArray []string

func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = StringArray{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to scan StringArray: %v", value)
	}
	return json.Unmarshal(bytes, s)
}

func (s StringArray) Value() (driver.Value, error) {
	return json.Marshal(s)
}

type JSONMap map[string]interface{}

func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = JSONMap{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to scan JSONMap: %v", value)
	}
	return json.Unmarshal(bytes, j)
}

func (j JSONMap) Value() (driver.Value, error) {
	return json.Marshal(j)
}
