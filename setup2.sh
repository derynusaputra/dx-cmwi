#!/usr/bin/env bash
# =============================================================================
# Setup Universal — auto-deteksi Ubuntu/Linux atau Windows
#
# Linux/Ubuntu  : bash setup.sh          (perlu sudo)
# Windows       : bash setup.sh          (via Git Bash / WSL)
# =============================================================================

set -euo pipefail

# ─── Warna output ─────────────────────────────────────────────────────────────
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

step() { echo -e "\n${CYAN}>>> $*${NC}"; }
ok()   { echo -e "    ${GREEN}[OK]${NC} $*"; }
warn() { echo -e "    ${YELLOW}[!]${NC}  $*"; }
die()  { echo -e "${RED}[ERROR] $*${NC}"; exit 1; }

# ─── Baca .env ke environment ─────────────────────────────────────────────────
load_env() {
    local envfile="$1"
    [[ -f "$envfile" ]] || die "File .env tidak ditemukan di: $envfile"
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^[[:space:]]*# ]] && continue
        [[ -z "$key" ]] && continue
        value="${value%%#*}"
        value="${value#"${value%%[![:space:]]*}"}"
        value="${value%"${value##*[![:space:]]}"}"
        export "$key=$value"
    done < "$envfile"
}

# ─── Deteksi OS ───────────────────────────────────────────────────────────────
detect_os() {
    local uname_out
    uname_out="$(uname -s 2>/dev/null || true)"

    case "$uname_out" in
        Linux*)
            if grep -qi microsoft /proc/version 2>/dev/null; then
                echo "wsl"
            else
                echo "linux"
            fi
            ;;
        MINGW*|MSYS*|CYGWIN*)
            echo "windows_bash"
            ;;
        *)
            [[ -n "${WINDIR:-}${windir:-}" ]] && echo "windows_bash" || echo "unknown"
            ;;
    esac
}

# =============================================================================
#  LINUX / UBUNTU — menggunakan systemd
# =============================================================================
setup_linux() {
    local SCRIPT_DIR APP_DIR SUDO LOCAL_IP
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    APP_DIR="/opt/applokal"
    SUDO=""
    [[ "$EUID" -ne 0 ]] && { warn "Berjalan tanpa root, menggunakan sudo"; SUDO="sudo"; }

    # 1. Dependensi sistem
    step "Update sistem dan install dependensi dasar..."
    $SUDO apt-get update -qq
    $SUDO apt-get install -y curl wget git build-essential ca-certificates gnupg

    # 2. Go
    step "Mengecek Go..."
    if ! command -v go &>/dev/null; then
        local GO_VER="1.22.3"
        warn "Go belum ada, menginstall v$GO_VER..."
        wget -q "https://go.dev/dl/go${GO_VER}.linux-amd64.tar.gz" -O /tmp/go.tar.gz
        $SUDO rm -rf /usr/local/go
        $SUDO tar -C /usr/local -xzf /tmp/go.tar.gz
        rm /tmp/go.tar.gz
        echo 'export PATH=$PATH:/usr/local/go/bin' | $SUDO tee /etc/profile.d/go.sh > /dev/null
        export PATH=$PATH:/usr/local/go/bin
        ok "Go berhasil diinstall: $(go version)"
    else
        ok "Go sudah ada: $(go version)"
    fi

    # 3. Node.js LTS
    step "Mengecek Node.js..."
    if ! command -v node &>/dev/null; then
        warn "Node.js belum ada, menginstall LTS..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
        $SUDO apt-get install -y nodejs
        ok "Node.js berhasil diinstall: $(node -v)"
    else
        ok "Node.js sudah ada: $(node -v)"
    fi

    # 4. PostgreSQL
    step "Mengecek PostgreSQL..."
    if ! command -v psql &>/dev/null; then
        warn "PostgreSQL belum ada, menginstall..."
        $SUDO apt-get install -y postgresql postgresql-contrib
        $SUDO systemctl enable postgresql
        $SUDO systemctl start postgresql
        ok "PostgreSQL berhasil diinstall"
    else
        ok "PostgreSQL sudah ada"
        $SUDO systemctl start postgresql 2>/dev/null || true
    fi

    # 5. Setup database
    step "Menyiapkan database..."
    load_env "$SCRIPT_DIR/.env"
    $SUDO -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" \
        | grep -q 1 || $SUDO -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    $SUDO -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" \
        | grep -q 1 || $SUDO -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    $SUDO -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
    ok "Database '$DB_NAME' siap"

    # 6. Salin file ke /opt/applokal
    step "Menyalin file ke $APP_DIR..."
    $SUDO mkdir -p "$APP_DIR/be" "$APP_DIR/fe" "$APP_DIR/logs"
    $SUDO cp -r "$SCRIPT_DIR/be/."  "$APP_DIR/be/"
    $SUDO cp -r "$SCRIPT_DIR/fe/."  "$APP_DIR/fe/"
    $SUDO cp    "$SCRIPT_DIR/.env"  "$APP_DIR/.env"
    $SUDO chown -R "$USER:$USER"    "$APP_DIR"
    ok "File disalin ke $APP_DIR"

    # 7. Build backend
    step "Build backend Go..."
    cd "$APP_DIR/be"
    go mod tidy
    go build -o "$APP_DIR/be/server" .
    chmod +x "$APP_DIR/be/server"
    ok "Binary: $APP_DIR/be/server"

    # 8. Build frontend
    step "Install dependensi dan build frontend Next.js..."
    cd "$APP_DIR/fe"
    npm install --silent
    npm run build
    ok "Frontend berhasil di-build"

    # 9. Buat systemd services
    step "Membuat systemd service..."
    # Hindari path Node milik Cursor IDE, prioritaskan node sistem
    local NODE_BIN
    if   [[ -x /usr/bin/node ]]; then       NODE_BIN="/usr/bin/node"
    elif [[ -x /usr/local/bin/node ]]; then NODE_BIN="/usr/local/bin/node"
    else NODE_BIN="$(which node)"; fi

    $SUDO tee /etc/systemd/system/applokal-backend.service > /dev/null <<EOF
[Unit]
Description=AppLokal Backend (Go API)
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/be
ExecStart=$APP_DIR/be/server
EnvironmentFile=$APP_DIR/.env
Environment=GIN_MODE=release
Environment=PORT=8080
Restart=always
RestartSec=5
StandardOutput=append:$APP_DIR/logs/backend.log
StandardError=append:$APP_DIR/logs/backend-error.log

[Install]
WantedBy=multi-user.target
EOF

    $SUDO tee /etc/systemd/system/applokal-frontend.service > /dev/null <<EOF
[Unit]
Description=AppLokal Frontend (Next.js)
After=network.target applokal-backend.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR/fe
ExecStart=$NODE_BIN $APP_DIR/fe/node_modules/.bin/next start -p 3000
Environment=NODE_ENV=production
Restart=always
RestartSec=5
StandardOutput=append:$APP_DIR/logs/frontend.log
StandardError=append:$APP_DIR/logs/frontend-error.log

[Install]
WantedBy=multi-user.target
EOF

    # 10. Enable & start
    step "Mengaktifkan dan menjalankan service..."
    $SUDO systemctl daemon-reload
    $SUDO systemctl enable  applokal-backend applokal-frontend
    $SUDO systemctl restart applokal-backend
    sleep 3
    $SUDO systemctl restart applokal-frontend
    sleep 3
    ok "applokal-backend  : $($SUDO systemctl is-active applokal-backend)"
    ok "applokal-frontend : $($SUDO systemctl is-active applokal-frontend)"

    # 11. Firewall
    step "Mengatur firewall (UFW)..."
    if command -v ufw &>/dev/null; then
        $SUDO ufw allow 3000/tcp comment "AppLokal Frontend" 2>/dev/null || true
        $SUDO ufw allow 8080/tcp comment "AppLokal Backend"  2>/dev/null || true
        ok "Port 3000 dan 8080 dibuka"
    else
        warn "UFW tidak ditemukan, lewati konfigurasi firewall"
    fi

    LOCAL_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
    print_summary "$LOCAL_IP" "$APP_DIR"
    echo "  Perintah berguna:"
    echo "    sudo systemctl status  applokal-backend applokal-frontend"
    echo "    sudo systemctl restart applokal-backend"
    echo "    tail -f $APP_DIR/logs/backend.log"
    print_footer
}

# =============================================================================
#  UPDATE — rebuild dan restart tanpa install ulang (Linux)
# =============================================================================
update_linux() {
    local SCRIPT_DIR APP_DIR SUDO
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    APP_DIR="/opt/applokal"
    SUDO=""; [[ "$EUID" -ne 0 ]] && SUDO="sudo"

    step "Menghentikan service..."
    $SUDO systemctl stop applokal-frontend applokal-backend 2>/dev/null || true

    step "Menyalin file terbaru..."
    $SUDO cp -r "$SCRIPT_DIR/be/." "$APP_DIR/be/"
    $SUDO cp -r "$SCRIPT_DIR/fe/." "$APP_DIR/fe/"
    $SUDO cp    "$SCRIPT_DIR/.env" "$APP_DIR/.env"
    $SUDO chown -R "$USER:$USER"   "$APP_DIR"

    step "Rebuild backend..."
    cd "$APP_DIR/be" && go build -o "$APP_DIR/be/server" .

    step "Rebuild frontend..."
    cd "$APP_DIR/fe" && npm run build

    step "Menjalankan ulang service..."
    $SUDO systemctl start applokal-backend
    sleep 2
    $SUDO systemctl start applokal-frontend

    ok "Update selesai!"
    $SUDO systemctl status applokal-backend applokal-frontend --no-pager
}

# =============================================================================
#  WSL — tanya user mau deploy ke WSL atau Windows native
# =============================================================================
setup_wsl() {
    echo -e "${YELLOW}"
    echo "  Terdeteksi WSL (Windows Subsystem for Linux)."
    echo "  Pilih target deploy:"
    echo "  [1] Jalankan di dalam WSL (Linux service)"
    echo "  [2] Deploy ke Windows native via PowerShell (rekomendasi 24/7)"
    echo -e "${NC}"
    read -rp "  Pilihan (1/2): " choice
    case "$choice" in
        1) setup_linux ;;
        2)
            local SCRIPT_DIR WIN_PATH
            SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
            WIN_PATH="$(wslpath -w "$SCRIPT_DIR/setup2-windows-server.ps1")"
            step "Memanggil PowerShell setup..."
            powershell.exe -ExecutionPolicy Bypass -File "$WIN_PATH"
            ;;
        *) die "Pilihan tidak valid" ;;
    esac
}

# =============================================================================
#  WINDOWS via Git Bash / Cygwin — panggil PowerShell sebagai Admin
# =============================================================================
setup_windows_from_bash() {
    local SCRIPT_DIR WIN_SCRIPT
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    WIN_SCRIPT="$SCRIPT_DIR/setup2-windows-server.ps1"
    [[ -f "$WIN_SCRIPT" ]] || die "setup2-windows-server.ps1 tidak ditemukan"

    step "Windows terdeteksi — memanggil PowerShell setup..."
    warn "Jika muncul prompt UAC (izin Admin), klik Yes"

    # Konversi path ke format Windows (cygpath untuk Cygwin/MSYS)
    local WIN_PATH
    WIN_PATH="$(cygpath -w "$WIN_SCRIPT" 2>/dev/null || echo "$WIN_SCRIPT")"

    powershell.exe -Command \
        "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"$WIN_PATH\"' -Verb RunAs"

    ok "PowerShell setup diluncurkan di jendela baru. Ikuti instruksinya."
}

# ─── Tampilkan ringkasan ───────────────────────────────────────────────────────
print_summary() {
    local ip="$1" dir="$2"
    echo ""
    echo -e "${BOLD}=============================================${NC}"
    echo -e "${GREEN}  Setup Selesai!${NC}"
    echo -e "${BOLD}=============================================${NC}"
    echo ""
    echo "  Akses dari jaringan lokal:"
    echo -e "  Frontend : ${YELLOW}http://$ip:3000${NC}"
    echo -e "  API      : ${YELLOW}http://$ip:8080/api/v1/items${NC}"
    echo -e "  Health   : ${YELLOW}http://$ip:8080/health${NC}"
    echo ""
    echo "  Log: $dir/logs/"
    echo ""
}

print_footer() {
    echo -e "${BOLD}=============================================${NC}"
    echo ""
}

# =============================================================================
#  ENTRY POINT
# =============================================================================
OS="$(detect_os)"

echo -e "${BOLD}"
echo "============================================="
echo "  Setup Aplikasi Lokal"
echo "  OS Terdeteksi : $OS"
echo "============================================="
echo -e "${NC}"

# Jika ada argument --update, jalankan update saja
if [[ "${1:-}" == "--update" ]]; then
    [[ "$OS" == "linux" ]] || die "--update hanya untuk Linux/Ubuntu"
    update_linux
    exit 0
fi

case "$OS" in
    linux)        setup_linux ;;
    wsl)          setup_wsl ;;
    windows_bash) setup_windows_from_bash ;;
    *) die "OS tidak dikenali: $(uname -s 2>/dev/null || echo unknown)" ;;
esac
