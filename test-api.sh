#!/bin/bash
# Test script untuk be-cmwi API
B="http://localhost:8080"
CJ="/tmp/cmwi_cookies.txt"
rm -f $CJ

echo "==============================="
echo "1. HEALTH CHECK"
echo "==============================="
curl --max-time 5 -s "$B/health"
echo ""

echo ""
echo "==============================="
echo "2. LOGIN (admin)"
echo "==============================="
LOGIN=$(curl --max-time 5 -s -c $CJ -X POST "$B/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
echo "$LOGIN"
TK=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "Token: ${TK:0:30}..."

echo ""
echo "==============================="
echo "3. PROFILE"
echo "==============================="
curl --max-time 5 -s "$B/user/profile" \
  -H "Authorization: Bearer $TK"
echo ""

echo ""
echo "==============================="
echo "4. CREATE PAINTING INSPECTION"
echo "==============================="
CR=$(curl --max-time 5 -s -X POST "$B/painting-inspections" \
  -H "Authorization: Bearer $TK" \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2026-03-30","shift":"1","group_name":"A",
    "inspector":"Dery Test","painting_status":"OK",
    "wheel_type":"Alloy 14","line":"L1",
    "brightness":{},"thickness":{},"gloss":{},
    "photos":[],"attachments":[],
    "comment":"Test via script","judgement":"OK","status":"Pending SPV"
  }')
echo "$CR"
INSP_ID=$(echo "$CR" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "-> ID: $INSP_ID"

echo ""
echo "==============================="
echo "5. LIST INSPECTIONS"
echo "==============================="
curl --max-time 5 -s "$B/painting-inspections?page=1&limit=5" \
  -H "Authorization: Bearer $TK"
echo ""

echo ""
echo "==============================="
echo "6. GET DETAIL #$INSP_ID"
echo "==============================="
curl --max-time 5 -s "$B/painting-inspections/$INSP_ID" \
  -H "Authorization: Bearer $TK"
echo ""

echo ""
echo "==============================="
echo "7. UPDATE STATUS -> Approved"
echo "==============================="
curl --max-time 5 -s -X PUT "$B/painting-inspections/$INSP_ID/status" \
  -H "Authorization: Bearer $TK" \
  -H "Content-Type: application/json" \
  -d '{"status":"Approved"}'
echo ""

echo ""
echo "==============================="
echo "8. DELETE #$INSP_ID"
echo "==============================="
curl --max-time 5 -s -X DELETE "$B/painting-inspections/$INSP_ID" \
  -H "Authorization: Bearer $TK"
echo ""

echo ""
echo "==============================="
echo "9. REFRESH TOKEN"
echo "==============================="
curl --max-time 5 -s -b $CJ -c $CJ -X POST "$B/auth/refresh"
echo ""

echo ""
echo "==============================="
echo "10. LOGOUT"
echo "==============================="
curl --max-time 5 -s -b $CJ -X POST "$B/auth/logout"
echo ""

echo ""
echo "==============================="
echo "SELESAI"
echo "==============================="
