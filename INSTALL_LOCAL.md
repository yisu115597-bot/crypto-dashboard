# 本地自託管安裝指南

本指南詳細說明如何在您的本地機器或自己的伺服器上完全獨立運行「極簡加密資產儀表板」。

## 目錄

1. [系統要求](#系統要求)
2. [第一步：準備開發環境](#第一步準備開發環境)
3. [第二步：克隆和配置項目](#第二步克隆和配置項目)
4. [第三步：資料庫設定](#第三步資料庫設定)
5. [第四步：環境變數配置](#第四步環境變數配置)
6. [第五步：本地開發](#第五步本地開發)
7. [第六步：生產構建](#第六步生產構建)
8. [第七步：生產部署](#第七步生產部署)
9. [第八步：推送到 GitHub](#第八步推送到-github)
10. [故障排查](#故障排查)

---

## 系統要求

### 最低配置

- **CPU**：2 核心
- **記憶體**：2GB RAM
- **硬碟**：10GB 可用空間
- **網路**：穩定的網際網路連接

### 支援的作業系統

- macOS 10.15+
- Linux（Ubuntu 20.04+、CentOS 8+）
- Windows 10/11（使用 WSL2）

### 必需軟體

| 軟體 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ 或 22+ | JavaScript 運行時 |
| pnpm | 8+ | 套件管理器 |
| MySQL | 5.7+ 或 8.0+ | 資料庫 |
| Git | 2.0+ | 版本控制 |

---

## 第一步：準備開發環境

### 1.1 安裝 Node.js

**macOS（使用 Homebrew）：**
```bash
brew install node@22
brew link node@22
node --version  # 驗證版本
```

**Linux（Ubuntu）：**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

**Windows：**
訪問 https://nodejs.org/ 下載 LTS 版本並安裝。

### 1.2 安裝 pnpm

```bash
npm install -g pnpm
pnpm --version  # 驗證版本
```

### 1.3 安裝 MySQL

**macOS：**
```bash
brew install mysql
brew services start mysql
mysql --version
```

**Linux（Ubuntu）：**
```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
```

**Windows：**
訪問 https://dev.mysql.com/downloads/mysql/ 下載並安裝。

### 1.4 安裝 Git

**macOS：**
```bash
brew install git
```

**Linux：**
```bash
sudo apt-get install -y git
```

**Windows：**
訪問 https://git-scm.com/ 下載並安裝。

---

## 第二步：克隆和配置項目

### 2.1 克隆項目

```bash
# 從 GitHub 克隆（替換為您的倉庫地址）
git clone https://github.com/your-username/crypto-dashboard.git
cd crypto-dashboard
```

### 2.2 安裝依賴

```bash
pnpm install
```

這將安裝所有必需的 Node.js 依賴。

### 2.3 驗證安裝

```bash
pnpm --version
node --version
```

---

## 第三步：資料庫設定

### 3.1 建立資料庫

```bash
# 連接到 MySQL
mysql -u root -p

# 在 MySQL 命令行中執行
CREATE DATABASE crypto_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crypto_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON crypto_dashboard.* TO 'crypto_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.2 驗證連接

```bash
mysql -u crypto_user -p -h localhost crypto_dashboard
# 輸入密碼後應該能連接成功
```

### 3.3 執行資料庫遷移

```bash
# 生成遷移檔案
pnpm db:generate

# 執行遷移
pnpm db:push
```

---

## 第四步：環境變數配置

### 4.1 複製環境變數範本

```bash
cp .env.example .env.local
```

### 4.2 編輯 .env.local

使用您喜歡的編輯器打開 `.env.local`，填入以下變數：

```bash
# 資料庫連接
DATABASE_URL=mysql://crypto_user:your_secure_password@localhost:3306/crypto_dashboard

# OAuth 認證（如果使用 Manus OAuth，否則可以禁用）
# 對於本地自託管，您可以跳過這些或使用自訂認證
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# 會話管理（生成一個隨機的 32+ 字符密鑰）
JWT_SECRET=your_random_secret_key_min_32_characters_long_change_me_in_production

# 應用配置
VITE_APP_TITLE=極簡加密資產儀表板
VITE_APP_LOGO=https://your-domain.com/logo.png
NODE_ENV=development

# 所有者信息
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# 區塊鏈 API
ETHERSCAN_API_KEY=your_etherscan_api_key

# 內部 API（如果不使用 Manus，可以留空）
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

### 4.3 生成 JWT_SECRET

```bash
# 使用 Node.js 生成隨機密鑰
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

複製輸出的值到 `JWT_SECRET`。

---

## 第五步：本地開發

### 5.1 啟動開發伺服器

```bash
# 同時啟動前端和後端
pnpm dev

# 或分別啟動
pnpm dev:client  # 前端：http://localhost:5173
pnpm dev:server  # 後端：http://localhost:3000
```

### 5.2 訪問應用

打開瀏覽器，訪問 `http://localhost:3000`

### 5.3 開發工作流

```bash
# 編輯代碼時，開發伺服器會自動重新加載（HMR）

# 查看資料庫 UI
pnpm db:studio

# 執行測試
pnpm test

# 檢查 TypeScript 錯誤
pnpm tsc --noEmit
```

---

## 第六步：生產構建

### 6.1 構建應用

```bash
# 構建前端和後端
pnpm build

# 驗證構建結果
ls -la dist/
```

### 6.2 測試生產構建

```bash
# 預覽生產構建
NODE_ENV=production pnpm preview
```

訪問 `http://localhost:3000` 測試生產版本。

---

## 第七步：生產部署

### 7.1 使用 PM2 管理進程

```bash
# 全局安裝 PM2
npm install -g pm2

# 啟動應用
pm2 start "NODE_ENV=production node dist/server/index.js" --name crypto-dashboard

# 查看日誌
pm2 logs crypto-dashboard

# 設定開機自啟
pm2 startup
pm2 save
```

### 7.2 配置 Nginx 反向代理

建立 `/etc/nginx/sites-available/crypto-dashboard`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 證書（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日誌
    access_log /var/log/nginx/crypto-dashboard-access.log;
    error_log /var/log/nginx/crypto-dashboard-error.log;

    # 代理設定
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

啟用網站：

```bash
sudo ln -s /etc/nginx/sites-available/crypto-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7.3 配置 SSL 證書（Let's Encrypt）

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7.4 自動備份

建立備份腳本 `/home/ubuntu/backup-crypto-dashboard.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="crypto_dashboard"
DB_USER="crypto_user"
DATE=$(date +%Y%m%d_%H%M%S)

# 建立備份目錄
mkdir -p $BACKUP_DIR

# 備份資料庫
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# 備份應用檔案
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/ubuntu/crypto-dashboard

# 刪除 7 天前的備份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

設定 Cron 任務進行每日備份：

```bash
# 編輯 crontab
crontab -e

# 新增以下行（每天凌晨 2 點執行備份）
0 2 * * * /home/ubuntu/backup-crypto-dashboard.sh
```

---

## 第八步：推送到 GitHub

### 8.1 初始化 Git 倉庫（如果還未初始化）

```bash
git init
git add .
git commit -m "Initial commit: Crypto Dashboard"
```

### 8.2 新增遠端倉庫

```bash
# 替換為您的 GitHub 倉庫地址
git remote add origin https://github.com/your-username/crypto-dashboard.git
git branch -M main
git push -u origin main
```

### 8.3 設定 .gitignore

確保 `.gitignore` 包含敏感檔案：

```
.env.local
.env.production
node_modules/
dist/
.DS_Store
*.log
```

### 8.4 後續更新

```bash
# 進行更改
git add .
git commit -m "Description of changes"
git push origin main
```

---

## 故障排查

### 問題 1：資料庫連接失敗

```bash
# 檢查 MySQL 是否運行
sudo systemctl status mysql

# 測試連接
mysql -u crypto_user -p -h localhost crypto_dashboard

# 檢查 .env.local 中的 DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### 問題 2：端口已被佔用

```bash
# 查找佔用端口的進程
lsof -i :3000

# 殺死進程
kill -9 <PID>
```

### 問題 3：pnpm 命令找不到

```bash
# 重新安裝 pnpm
npm install -g pnpm

# 驗證
pnpm --version
```

### 問題 4：SSL 證書錯誤

```bash
# 檢查證書有效期
sudo certbot certificates

# 更新證書
sudo certbot renew
```

### 問題 5：應用無法啟動

```bash
# 檢查日誌
pm2 logs crypto-dashboard

# 檢查環境變數
cat .env.local

# 檢查資料庫遷移
pnpm db:push
```

---

## 常見命令速查表

| 命令 | 用途 |
|------|------|
| `pnpm install` | 安裝依賴 |
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 構建生產版本 |
| `pnpm db:push` | 執行資料庫遷移 |
| `pnpm db:studio` | 打開資料庫 UI |
| `pnpm test` | 執行測試 |
| `pnpm tsc --noEmit` | 檢查 TypeScript 錯誤 |
| `pm2 start ...` | 啟動應用（PM2） |
| `pm2 logs` | 查看日誌 |
| `git push origin main` | 推送到 GitHub |

---

## 安全建議

1. **更改預設密碼**
   - 更改 MySQL 根密碼
   - 更改 JWT_SECRET

2. **啟用防火牆**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **定期備份**
   - 設定自動備份任務
   - 定期測試恢復流程

4. **監控日誌**
   ```bash
   tail -f /var/log/nginx/crypto-dashboard-access.log
   pm2 logs crypto-dashboard
   ```

5. **更新依賴**
   ```bash
   pnpm update
   pnpm audit
   ```

---

## 下一步

1. 完成本地安裝和測試
2. 推送代碼到 GitHub
3. 在生產伺服器上部署
4. 配置自動備份
5. 設定監控和告警

---

## 聯繫支援

如有問題，請：
- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解更多部署選項
- 查看 [SECURITY.md](./SECURITY.md) 了解安全最佳實踐
- 查看 [DEVELOPER.md](./DEVELOPER.md) 了解開發指南

---

**最後更新**：2024-11-14  
**版本**：1.0.0
