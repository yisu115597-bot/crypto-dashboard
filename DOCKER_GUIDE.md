# Docker 容器化部署指南

本指南說明如何使用 Docker 和 Docker Compose 在本地或伺服器上部署「極簡加密資產儀表板」。

## 目錄

1. [系統要求](#系統要求)
2. [Docker 安裝](#docker-安裝)
3. [快速啟動](#快速啟動)
4. [部署腳本使用](#部署腳本使用)
5. [容器管理](#容器管理)
6. [故障排查](#故障排查)
7. [生產部署](#生產部署)

---

## 系統要求

### 最低配置

- **CPU**：2 核心
- **記憶體**：2GB RAM
- **硬碟**：10GB 可用空間
- **網路**：穩定的網際網路連接

### 支援的作業系統

- macOS 10.15+（Docker Desktop）
- Linux（Ubuntu 20.04+、CentOS 8+）
- Windows 10/11（Docker Desktop + WSL2）

---

## Docker 安裝

### macOS

```bash
# 使用 Homebrew 安裝
brew install docker docker-compose

# 或訪問 https://www.docker.com/products/docker-desktop 下載 Docker Desktop
```

### Linux（Ubuntu）

```bash
# 更新套件列表
sudo apt-get update

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 新增當前用戶到 docker 組（避免使用 sudo）
sudo usermod -aG docker $USER
newgrp docker

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 驗證安裝
docker --version
docker-compose --version
```

### Windows（WSL2）

1. 安裝 WSL2：https://docs.microsoft.com/en-us/windows/wsl/install
2. 安裝 Docker Desktop：https://www.docker.com/products/docker-desktop
3. 在 Docker Desktop 設定中啟用 WSL2 整合

---

## 快速啟動

### 1. 克隆項目

```bash
git clone https://github.com/your-username/crypto-dashboard.git
cd crypto-dashboard
```

### 2. 配置環境變數

```bash
# 複製範本
cp .env.example .env.local

# 編輯 .env.local，填入必需的配置
# 至少需要填入：
# - DATABASE_URL（資料庫連接字符串）
# - JWT_SECRET（會話密鑰）
# - ETHERSCAN_API_KEY（區塊鏈 API 密鑰）
```

### 3. 啟動應用

```bash
# 使用部署腳本（推薦）
./deploy.sh start

# 或使用 docker-compose 直接啟動
docker-compose up -d
```

### 4. 驗證部署

```bash
# 查看容器狀態
docker-compose ps

# 查看應用日誌
docker-compose logs -f app

# 訪問應用
# 本地：http://localhost:3000
# 遠端：https://your-domain.com
```

---

## 部署腳本使用

### 基本命令

```bash
# 顯示幫助信息
./deploy.sh help

# 首次啟動應用
./deploy.sh start

# 停止應用
./deploy.sh stop

# 重啟應用
./deploy.sh restart

# 查看應用日誌
./deploy.sh logs

# 查看應用狀態
./deploy.sh status
```

### 更新應用

```bash
# 更新應用（自動拉取最新代碼並重新部署）
./deploy.sh update

# 手動步驟
git pull origin main
docker-compose build --no-cache
docker-compose up -d
docker-compose exec app pnpm db:push
```

### 資料庫備份和恢復

```bash
# 備份資料庫
./deploy.sh backup

# 查看備份列表
ls -la backups/

# 恢復備份
./deploy.sh restore backups/db_backup_20240101_120000.sql.gz
```

### 清理資源

```bash
# 清理所有 Docker 資源（謹慎使用）
./deploy.sh clean
```

---

## 容器管理

### Docker Compose 常用命令

```bash
# 啟動容器
docker-compose up -d

# 停止容器
docker-compose down

# 查看容器狀態
docker-compose ps

# 查看日誌
docker-compose logs -f [服務名]

# 進入容器
docker-compose exec [服務名] /bin/sh

# 重建映像
docker-compose build --no-cache

# 查看容器資源使用
docker stats
```

### 進入容器執行命令

```bash
# 進入應用容器
docker-compose exec app /bin/sh

# 進入 MySQL 容器
docker-compose exec mysql mysql -u crypto_user -p

# 執行資料庫遷移
docker-compose exec app pnpm db:push

# 查看應用日誌
docker-compose exec app tail -f logs/app.log
```

### 容器服務

| 服務名 | 用途 | 端口 |
|--------|------|------|
| app | Node.js 應用 | 3000 |
| mysql | MySQL 資料庫 | 3306 |
| nginx | 反向代理 | 80, 443 |

---

## 故障排查

### 問題 1：容器無法啟動

```bash
# 查看詳細錯誤信息
docker-compose logs app

# 檢查 .env.local 配置
cat .env.local

# 檢查端口是否被佔用
lsof -i :3000
lsof -i :3306
lsof -i :80
```

### 問題 2：資料庫連接失敗

```bash
# 檢查 MySQL 容器狀態
docker-compose ps mysql

# 查看 MySQL 日誌
docker-compose logs mysql

# 測試資料庫連接
docker-compose exec mysql mysql -u crypto_user -p -h localhost crypto_dashboard
```

### 問題 3：應用無法訪問

```bash
# 檢查 Nginx 容器狀態
docker-compose ps nginx

# 查看 Nginx 日誌
docker-compose logs nginx

# 檢查 Nginx 配置
docker-compose exec nginx nginx -t
```

### 問題 4：磁碟空間不足

```bash
# 查看 Docker 磁碟使用
docker system df

# 清理未使用的映像
docker image prune -a

# 清理未使用的卷
docker volume prune

# 完全清理（謹慎使用）
docker system prune -a
```

### 問題 5：容器頻繁重啟

```bash
# 查看容器重啟次數
docker-compose ps

# 查看詳細日誌
docker-compose logs --tail=100 app

# 檢查健康檢查狀態
docker inspect $(docker-compose ps -q app) | grep -A 10 Health
```

---

## 生產部署

### 1. 配置 SSL 證書

```bash
# 建立 ssl 目錄
mkdir -p docker/ssl

# 使用 Let's Encrypt 生成證書
sudo certbot certonly --standalone -d your-domain.com

# 複製證書到 Docker 目錄
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/key.pem
sudo chown $USER:$USER docker/ssl/*.pem
```

### 2. 配置環境變數

```bash
# 編輯 .env.local，設定生產環境
NODE_ENV=production

# 生成強密鑰
JWT_SECRET=$(openssl rand -base64 32)

# 設定資料庫密碼
MYSQL_PASSWORD=$(openssl rand -base64 16)

# 設定其他必需的 API 密鑰
ETHERSCAN_API_KEY=your_key
```

### 3. 配置 Nginx

編輯 `docker/nginx.conf`，設定您的域名：

```nginx
server_name your-domain.com;
```

### 4. 啟動應用

```bash
./deploy.sh start
```

### 5. 設定自動更新

建立 cron 任務進行定期更新：

```bash
# 編輯 crontab
crontab -e

# 新增以下行（每天凌晨 2 點更新）
0 2 * * * cd /path/to/crypto-dashboard && ./deploy.sh update >> deploy.log 2>&1

# 每週備份一次
0 3 * * 0 cd /path/to/crypto-dashboard && ./deploy.sh backup >> deploy.log 2>&1
```

### 6. 監控應用

```bash
# 查看容器資源使用
docker stats

# 設定告警（使用 PM2 或其他監控工具）
# 參考 INSTALL_LOCAL.md 中的監控部分
```

---

## 常見配置

### 修改應用端口

編輯 `docker-compose.yml`：

```yaml
app:
  ports:
    - "8080:3000"  # 改為 8080
```

### 修改資料庫密碼

編輯 `.env.local`：

```bash
MYSQL_PASSWORD=your_new_password
```

### 增加容器資源限制

編輯 `docker-compose.yml`：

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### 使用外部資料庫

編輯 `.env.local`：

```bash
DATABASE_URL=mysql://user:password@external-host:3306/crypto_dashboard
```

然後在 `docker-compose.yml` 中移除 MySQL 服務。

---

## 效能優化

### 1. 啟用 Gzip 壓縮

已在 `docker/nginx.conf` 中配置。

### 2. 快取靜態資源

已在 `docker/nginx.conf` 中配置（30 天快取）。

### 3. 資料庫查詢優化

```bash
# 進入 MySQL 容器
docker-compose exec mysql mysql -u crypto_user -p

# 查看慢查詢日誌
SHOW VARIABLES LIKE 'slow_query_log%';
```

### 4. 應用日誌輪轉

```bash
# 檢查日誌大小
du -sh logs/

# 手動清理舊日誌
find logs/ -name "*.log" -mtime +30 -delete
```

---

## 安全建議

1. **更改預設密碼**
   ```bash
   MYSQL_ROOT_PASSWORD=strong_password
   MYSQL_PASSWORD=strong_password
   JWT_SECRET=strong_secret_key
   ```

2. **啟用防火牆**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **定期備份**
   ```bash
   ./deploy.sh backup
   ```

4. **更新依賴**
   ```bash
   docker-compose exec app pnpm update
   docker-compose exec app pnpm audit
   ```

5. **監控日誌**
   ```bash
   docker-compose logs -f
   ```

---

## 參考資源

- [Docker 官方文檔](https://docs.docker.com/)
- [Docker Compose 官方文檔](https://docs.docker.com/compose/)
- [Nginx 官方文檔](https://nginx.org/en/docs/)
- [MySQL 官方文檔](https://dev.mysql.com/doc/)

---

**最後更新**：2024-11-14  
**版本**：1.0.0
