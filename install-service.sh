#!/usr/bin/env bash
# Jalankan sekali di terminal: sudo bash install-service.sh
set -e
PROJ="/home/bosani/Documents/percobaan lokal"
APP="/opt/applokal"
USER_NAME="bosani"

echo ">>> Menyalin file ke $APP..."
mkdir -p "$APP/be" "$APP/fe" "$APP/logs"
cp -r "$PROJ/be/." "$APP/be/"
cp -r "$PROJ/fe/." "$APP/fe/"
cp    "$PROJ/.env" "$APP/.env"
chown -R "$USER_NAME:$USER_NAME" "$APP"

echo ">>> Setup database PostgreSQL..."
DB_USER="bosani"; DB_PASS="1234567890"; DB_NAME="dbl"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
echo "    [OK] Database '$DB_NAME' siap"

echo ">>> Membuat systemd service..."
cat > /etc/systemd/system/applokal-backend.service <<EOF
[Unit]
Description=AppLokal Backend (Go API)
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$APP/be
ExecStart=$APP/be/server
EnvironmentFile=$APP/.env
Environment=GIN_MODE=release
Environment=PORT=8080
Restart=always
RestartSec=5
StandardOutput=append:$APP/logs/backend.log
StandardError=append:$APP/logs/backend-error.log

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/applokal-frontend.service <<EOF
[Unit]
Description=AppLokal Frontend (Next.js)
After=network.target applokal-backend.service

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$APP/fe
ExecStart=/usr/bin/node $APP/fe/node_modules/.bin/next start -p 3000
Environment=NODE_ENV=production
Restart=always
RestartSec=5
StandardOutput=append:$APP/logs/frontend.log
StandardError=append:$APP/logs/frontend-error.log

[Install]
WantedBy=multi-user.target
EOF

echo ">>> Enable & start service..."
systemctl daemon-reload
systemctl enable  applokal-backend applokal-frontend
systemctl restart applokal-backend
sleep 3
systemctl restart applokal-frontend
sleep 3

echo ">>> Membuka port firewall..."
ufw allow 3000/tcp comment "AppLokal Frontend" 2>/dev/null || true
ufw allow 8080/tcp comment "AppLokal Backend"  2>/dev/null || true

echo ""
echo "============================================="
echo "  Selesai!"
IP=$(hostname -I | awk '{print $1}')
echo "  Frontend : http://$IP:3000"
echo "  Backend  : http://$IP:8080/health"
echo "============================================="
systemctl status applokal-backend applokal-frontend --no-pager -l
