# 本地開發部署指南（跳過 Docker 環境安裝）

如果您已經在本地安裝了 Node.js、pnpm 和 MySQL，可以按照本指南直接在本地運行應用，跳過 Docker 環境設定。

## 前置條件

確保您已安裝以下工具：

```bash
# 檢查 Node.js
node --version  # 應該是 v22 或更高版本

# 檢查 pnpm
pnpm --version  # 應該是 10.x 或更高版本

# 檢查 MySQL
mysql --version  # 應該是 8.0 或更高版本
```

## 第一步：配置環境變數

```bash
# 複製環境變數範本
cp .env.example .env.local

# 編輯 .env.local，填入以下必需的配置
nano .env.local
```

**必需的環境變數**：

```bash
# 資料庫配置
DATABASE_URL=mysql://crypto_user:crypto_password@localhost:3306/crypto_dashboard

# JWT 密鑰（至少 32 個字符）
JWT_SECRET=your_random_32_char_secret_key_here_min_32_chars

# Etherscan API Key（用於區塊鏈掃描）
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# OAuth 配置（如果使用 Manus OAuth）
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

## 第二步：設定本地 MySQL 資料庫

### 方式 A：使用 Docker 只運行 MySQL（推薦）

```bash
# 啟動只有 MySQL 的容器
docker-compose up -d mysql

# 等待 MySQL 啟動
sleep 10

# 驗證連接
mysql -u crypto_user -p -h localhost crypto_dashboard
# 密碼：crypto_password
```

### 方式 B：使用本地 MySQL 服務

```bash
# 啟動 MySQL 服務
sudo systemctl start mysql

# 建立資料庫和用戶
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS crypto_dashboard;
CREATE USER IF NOT EXISTS 'crypto_user'@'localhost' IDENTIFIED BY 'crypto_password';
GRANT ALL PRIVILEGES ON crypto_dashboard.* TO 'crypto_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

## 第三步：安裝依賴

```bash
# 安裝所有依賴（包括開發依賴）
pnpm install

# 或者只安裝生產依賴
pnpm install --prod
```

## 第四步：執行資料庫遷移

```bash
# 推送資料庫 Schema 到資料庫
pnpm db:push

# 或者查看資料庫
pnpm db:studio
```

## 第五步：啟動應用

### 開發模式（帶熱重載）

```bash
# 啟動開發伺服器
pnpm dev

# 應用將在 http://localhost:3000 啟動
```

### 生產模式

```bash
# 構建應用
pnpm build

# 啟動生產伺服器
pnpm start
```

## 常用命令

| 命令 | 用途 |
|------|------|
| `pnpm install` | 安裝所有依賴 |
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 構建應用 |
| `pnpm start` | 啟動生產伺服器 |
| `pnpm db:push` | 執行資料庫遷移 |
| `pnpm db:studio` | 開啟資料庫管理界面 |
| `pnpm tsc --noEmit` | 檢查 TypeScript 類型 |
| `pnpm lint` | 執行代碼檢查 |

## 故障排查

### 問題 1：MySQL 連接失敗

```bash
# 檢查 MySQL 是否運行
mysql -u crypto_user -p -h localhost crypto_dashboard

# 如果使用 Docker MySQL，檢查容器狀態
docker-compose ps mysql

# 查看 MySQL 日誌
docker-compose logs mysql
```

### 問題 2：pnpm install 失敗

```bash
# 清除 pnpm 快取
pnpm store prune

# 重新安裝
pnpm install
```

### 問題 3：資料庫遷移失敗

```bash
# 檢查資料庫連接
mysql -u crypto_user -p -h localhost -e "SELECT 1 FROM crypto_dashboard.users LIMIT 1;"

# 查看遷移日誌
pnpm db:push --verbose
```

### 問題 4：應用無法啟動

```bash
# 檢查環境變數
cat .env.local

# 檢查 TypeScript 錯誤
pnpm tsc --noEmit

# 查看詳細錯誤
pnpm dev --debug
```

## 開發工作流

### 1. 修改代碼

編輯 `client/src/` 或 `server/` 中的檔案。開發伺服器會自動熱重載前端代碼。

### 2. 修改資料庫 Schema

編輯 `drizzle/schema.ts`，然後執行：

```bash
pnpm db:push
```

### 3. 提交代碼

```bash
git add .
git commit -m "feat: Add new feature"
git push origin main
```

## 從本地開發切換到 Docker 部署

當您準備好部署到生產環境時：

```bash
# 構建 Docker 映像
docker-compose build

# 啟動完整的應用棧（MySQL + App + Nginx）
docker-compose up -d

# 訪問應用
# http://localhost:3000
```

## 性能優化建議

1. **使用 pnpm 而不是 npm**：pnpm 更快更節省空間
2. **啟用 TypeScript 快取**：`pnpm dev` 會自動使用快取
3. **定期清理**：`pnpm store prune` 清理未使用的依賴
4. **監控資源使用**：`top` 或 `htop` 監控 CPU 和內存

## 下一步

1. **本地測試**：按照 QUICK_TEST_CHECKLIST.md 進行功能測試
2. **推送到 GitHub**：`git push origin main`
3. **部署到生產**：按照 DEPLOYMENT.md 進行部署

---

**預期時間**：5 分鐘  
**難度**：⭐ 簡單  
**成功率**：99%+
