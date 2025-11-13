# 極簡加密資產儀表板 - 部署指南

## 概述

「極簡加密資產儀表板」是一個全棧 Web 應用，採用 React 19 + Express 4 + tRPC 11 + MySQL 技術棧。本文件說明如何部署和配置應用。

## 系統要求

- Node.js 18+ 或 22+
- MySQL 5.7+ 或 TiDB
- 2GB+ 記憶體
- 穩定的網路連接

## 環境變數配置

應用需要以下環境變數。在生產環境中，這些應由平台自動注入：

### 必需環境變數

```bash
# 資料庫連接
DATABASE_URL=mysql://user:password@host:3306/crypto_dashboard

# OAuth 認證
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# 會話管理
JWT_SECRET=your_random_secret_key_min_32_chars

# 應用配置
VITE_APP_TITLE=極簡加密資產儀表板
VITE_APP_LOGO=https://your-domain.com/logo.png

# 所有者信息
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id
```

### 可選環境變數

```bash
# 區塊鏈掃描 API 密鑰（用於錢包追蹤功能）
ETHERSCAN_API_KEY=your_etherscan_key
BSCSCAN_API_KEY=your_bscscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
ARBISCAN_API_KEY=your_arbiscan_key

# 資產同步間隔（分鐘）
ASSET_SYNC_INTERVAL=10
```

## 資料庫初始化

1. **建立資料庫**

```bash
mysql -u root -p
CREATE DATABASE crypto_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **執行遷移**

```bash
pnpm db:push
```

此命令將根據 `drizzle/schema.ts` 建立所有必要的表。

## 本地開發

1. **安裝依賴**

```bash
pnpm install
```

2. **啟動開發伺服器**

```bash
pnpm dev
```

開發伺服器將在 `http://localhost:3000` 啟動。

## 生產部署

### 方案 1：使用 Manus 平台（推薦）

1. 在 Manus 管理面板中建立新專案
2. 連接 GitHub 倉庫
3. 配置環境變數
4. 點擊「Publish」按鈕自動部署

### 方案 2：自託管部署

1. **建立生產構建**

```bash
pnpm build
```

2. **啟動生產伺服器**

```bash
NODE_ENV=production node dist/server/index.js
```

3. **使用 PM2 管理進程**

```bash
npm install -g pm2

pm2 start "NODE_ENV=production node dist/server/index.js" --name crypto-dashboard
pm2 save
pm2 startup
```

4. **配置反向代理（Nginx）**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **配置 SSL（Let's Encrypt）**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 安全最佳實踐

### 1. API Key 加密

所有用戶的 API Key 使用 AES-256-GCM 加密儲存。加密金鑰來自環境變數 `JWT_SECRET`。

**確保：**
- `JWT_SECRET` 長度至少 32 字符
- 定期輪換 `JWT_SECRET`（需要重新加密所有 API Key）
- 在安全的地方備份 `JWT_SECRET`

### 2. 資料庫安全

- 使用強密碼保護資料庫帳號
- 限制資料庫訪問 IP
- 定期備份資料庫
- 啟用 SSL/TLS 連接

```bash
# MySQL 連接字符串示例（帶 SSL）
DATABASE_URL=mysql://user:password@host:3306/crypto_dashboard?ssl=true
```

### 3. OAuth 安全

- 確保 `VITE_APP_ID` 和相關密鑰安全存儲
- 定期檢查 OAuth 應用的權限設定
- 監控異常登入活動

### 4. 監控與日誌

```bash
# 查看應用日誌
pm2 logs crypto-dashboard

# 監控資源使用
pm2 monit
```

## 效能優化

### 1. 資料庫優化

```sql
-- 為常用查詢建立索引
CREATE INDEX idx_user_id ON api_keys(user_id);
CREATE INDEX idx_user_id ON wallet_addresses(user_id);
CREATE INDEX idx_user_id ON asset_snapshots(user_id);
CREATE INDEX idx_created_at ON asset_snapshots(created_at DESC);
```

### 2. 快取策略

- 幣價數據快取 5 分鐘
- 資產快照保留 90 天
- 使用 Redis 快取會話（可選）

### 3. API 速率限制

```bash
# 建議配置
- 交易所 API：每分鐘 10 次請求
- 區塊鏈掃描 API：每秒 5 次請求
- 幣價 API：無限制（CoinGecko 免費層）
```

## 故障排查

### 問題 1：資料庫連接失敗

```bash
# 檢查連接字符串
echo $DATABASE_URL

# 測試連接
mysql -u user -p -h host -D database_name
```

### 問題 2：OAuth 登入失敗

- 確認 `VITE_APP_ID` 和 `OAUTH_SERVER_URL` 正確
- 檢查應用的重定向 URI 設定
- 查看瀏覽器控制台的錯誤信息

### 問題 3：API Key 解密失敗

- 確認 `JWT_SECRET` 未被修改
- 檢查資料庫中的加密數據完整性
- 查看伺服器日誌中的錯誤信息

### 問題 4：資產同步失敗

- 檢查交易所 API 密鑰是否有效
- 確認交易所 API 未被速率限制
- 查看 `lastSyncError` 欄位的錯誤信息

## 監控與維護

### 定期任務

- **每日**：檢查應用日誌，監控錯誤率
- **每週**：檢查資料庫大小，清理舊快照
- **每月**：檢查 SSL 證書有效期，更新依賴

### 備份策略

```bash
# 每日備份資料庫
0 2 * * * mysqldump -u user -p database_name > /backup/crypto_dashboard_$(date +\%Y\%m\%d).sql

# 備份應用配置
0 3 * * 0 tar -czf /backup/config_$(date +\%Y\%m\%d).tar.gz /app/config/
```

## 升級步驟

1. **備份資料庫和配置**

```bash
mysqldump -u user -p database_name > backup.sql
```

2. **拉取最新代碼**

```bash
git pull origin main
```

3. **安裝依賴和執行遷移**

```bash
pnpm install
pnpm db:push
```

4. **重啟應用**

```bash
pm2 restart crypto-dashboard
```

5. **驗證升級**

訪問應用並確認所有功能正常。

## 聯繫與支援

如有問題或建議，請聯繫：

- 郵件：support@example.com
- 文件：https://docs.example.com
- GitHub Issues：https://github.com/your-repo/issues

## 許可證

MIT License - 詳見 LICENSE 檔案
