#!/bin/bash

################################################################################
# 極簡加密資產儀表板 - 自動化部署腳本
# 
# 用途：自動化 Docker 容器的構建、部署和更新
# 使用方式：./deploy.sh [命令] [選項]
#
# 命令：
#   start       啟動應用（首次部署）
#   stop        停止應用
#   restart     重啟應用
#   update      更新應用（拉取最新代碼並重新部署）
#   logs        查看應用日誌
#   status      查看應用狀態
#   backup      備份資料庫
#   restore     恢復資料庫備份
#   clean       清理 Docker 資源
#   help        顯示幫助信息
################################################################################

set -e

# 配置變數
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="crypto-dashboard"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="$SCRIPT_DIR/.env.local"
BACKUP_DIR="$SCRIPT_DIR/backups"
LOG_FILE="$SCRIPT_DIR/deploy.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# 日誌函數
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

################################################################################
# 檢查函數
################################################################################

check_prerequisites() {
    log_info "檢查必要工具..."

    # 檢查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安裝，請先安裝 Docker"
        exit 1
    fi
    log_success "Docker 已安裝"

    # 檢查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安裝，請先安裝 Docker Compose"
        exit 1
    fi
    log_success "Docker Compose 已安裝"

    # 檢查 git
    if ! command -v git &> /dev/null; then
        log_error "Git 未安裝，請先安裝 Git"
        exit 1
    fi
    log_success "Git 已安裝"

    # 檢查 .env.local
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env.local 檔案不存在"
        log_info "請複製 .env.example 為 .env.local 並填入配置"
        exit 1
    fi
    log_success ".env.local 已存在"
}

check_docker_running() {
    if ! docker info &> /dev/null; then
        log_error "Docker 守護進程未運行，請啟動 Docker"
        exit 1
    fi
}

################################################################################
# 部署函數
################################################################################

start_application() {
    log_info "啟動應用..."

    check_docker_running

    # 建立備份目錄
    mkdir -p "$BACKUP_DIR"

    # 構建 Docker 映像
    log_info "構建 Docker 映像..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache

    # 啟動容器
    log_info "啟動容器..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

    # 等待應用啟動
    log_info "等待應用啟動..."
    sleep 10

    # 執行資料庫遷移
    log_info "執行資料庫遷移..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T app pnpm db:push || true

    # 檢查應用狀態
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps | grep -q "app.*Up"; then
        log_success "應用已成功啟動"
        log_info "應用地址：http://localhost:3000"
    else
        log_error "應用啟動失敗，請檢查日誌"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs app
        exit 1
    fi
}

stop_application() {
    log_info "停止應用..."

    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down

    log_success "應用已停止"
}

restart_application() {
    log_info "重啟應用..."

    stop_application
    sleep 2
    start_application

    log_success "應用已重啟"
}

update_application() {
    log_info "更新應用..."

    # 拉取最新代碼
    log_info "拉取最新代碼..."
    cd "$SCRIPT_DIR"
    git fetch origin
    git pull origin main

    # 重新構建和部署
    log_info "重新構建應用..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache

    log_info "重新啟動應用..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

    # 等待應用啟動
    sleep 10

    # 執行資料庫遷移
    log_info "執行資料庫遷移..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T app pnpm db:push || true

    log_success "應用已更新"
}

view_logs() {
    log_info "查看應用日誌（按 Ctrl+C 退出）..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f app
}

view_status() {
    log_info "應用狀態："
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

    log_info "容器資源使用情況："
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps -q)
}

backup_database() {
    log_info "備份資料庫..."

    mkdir -p "$BACKUP_DIR"

    BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T mysql mysqldump \
        -u crypto_user -p"${MYSQL_PASSWORD:-crypto_password_change_me}" \
        crypto_dashboard > "$BACKUP_FILE"

    log_success "資料庫備份完成：$BACKUP_FILE"

    # 壓縮備份
    gzip "$BACKUP_FILE"
    log_success "備份已壓縮：${BACKUP_FILE}.gz"

    # 清理 7 天前的備份
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
    log_info "已清理 7 天前的備份"
}

restore_database() {
    if [ -z "$1" ]; then
        log_error "請指定備份檔案"
        log_info "用法：./deploy.sh restore <備份檔案路徑>"
        exit 1
    fi

    BACKUP_FILE="$1"

    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "備份檔案不存在：$BACKUP_FILE"
        exit 1
    fi

    log_warning "即將恢復資料庫，此操作將覆蓋現有數據"
    read -p "確認繼續？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "已取消"
        exit 0
    fi

    log_info "恢復資料庫..."

    # 如果是 gzip 壓縮的，先解壓
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        gunzip -c "$BACKUP_FILE" | docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T mysql mysql \
            -u crypto_user -p"${MYSQL_PASSWORD:-crypto_password_change_me}" \
            crypto_dashboard
    else
        cat "$BACKUP_FILE" | docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T mysql mysql \
            -u crypto_user -p"${MYSQL_PASSWORD:-crypto_password_change_me}" \
            crypto_dashboard
    fi

    log_success "資料庫已恢復"
}

clean_resources() {
    log_warning "此操作將刪除所有 Docker 容器、映像和卷"
    read -p "確認繼續？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "已取消"
        exit 0
    fi

    log_info "清理 Docker 資源..."

    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v

    log_success "Docker 資源已清理"
}

show_help() {
    cat << EOF
使用方式：./deploy.sh [命令] [選項]

命令：
  start       啟動應用（首次部署）
  stop        停止應用
  restart     重啟應用
  update      更新應用（拉取最新代碼並重新部署）
  logs        查看應用日誌
  status      查看應用狀態
  backup      備份資料庫
  restore     恢復資料庫備份
  clean       清理 Docker 資源
  help        顯示此幫助信息

示例：
  ./deploy.sh start                           # 首次啟動應用
  ./deploy.sh update                          # 更新應用
  ./deploy.sh logs                            # 查看日誌
  ./deploy.sh backup                          # 備份資料庫
  ./deploy.sh restore backups/db_backup_*.sql.gz  # 恢復備份

環境變數：
  .env.local  應用配置檔案（必需）

日誌檔案：
  $LOG_FILE

EOF
}

################################################################################
# 主程序
################################################################################

main() {
    # 建立日誌檔案
    touch "$LOG_FILE"

    # 檢查命令
    COMMAND="${1:-help}"

    case "$COMMAND" in
        start)
            check_prerequisites
            start_application
            ;;
        stop)
            check_docker_running
            stop_application
            ;;
        restart)
            check_prerequisites
            restart_application
            ;;
        update)
            check_prerequisites
            update_application
            ;;
        logs)
            check_docker_running
            view_logs
            ;;
        status)
            check_docker_running
            view_status
            ;;
        backup)
            check_docker_running
            backup_database
            ;;
        restore)
            check_docker_running
            restore_database "$2"
            ;;
        clean)
            check_docker_running
            clean_resources
            ;;
        help)
            show_help
            ;;
        *)
            log_error "未知命令：$COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# 執行主程序
main "$@"
