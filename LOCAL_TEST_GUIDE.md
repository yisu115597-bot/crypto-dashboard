# 本地測試和 GitHub 推送指南

本指南說明如何在本地測試應用，然後推送到 GitHub。

## 第一步：解壓 ZIP 檔案

```bash
# 解壓檔案
unzip crypto-dashboard-complete.zip

# 進入項目目錄
cd crypto-dashboard
```

## 第二步：本地開發環境設定

### 2.1 安裝必需的工具

```bash
# 安裝 Node.js（如果未安裝）
# macOS
brew install node pnpm

# Linux (Ubuntu)
curl -fsSL https://get.nodejs.org/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# Windows
# 訪問 https://nodejs.org/ 下載安裝程式
```

### 2.2 安裝依賴

```bash
# 使用 pnpm 安裝依賴
pnpm install
```

### 2.3 配置環境變數

```bash
# 複製範本
cp .env.example .env.local

# 編輯 .env.local，填入必需的配置
# 重要：至少需要填入以下內容：
# - DATABASE_URL=mysql://user:password@localhost:3306/crypto_dashboard
# - JWT_SECRET=your_random_secret_key_min_32_characters
# - ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 第三步：本地測試

### 3.1 使用 Docker Compose 啟動完整環境（推薦）

```bash
# 啟動所有容器（MySQL + Node.js + Nginx）
./deploy.sh start

# 或使用 docker-compose 直接啟動
docker-compose up -d

# 等待 MySQL 和應用啟動（約 30 秒）
sleep 30

# 執行資料庫遷移
docker-compose exec app pnpm db:push

# 訪問應用
# 本地：http://localhost:3000
# 或 https://localhost（如果配置了 SSL）
```

### 3.2 使用本地開發伺服器（快速開發）

```bash
# 啟動本地 MySQL（需要預先安裝）
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# 執行資料庫遷移
pnpm db:push

# 啟動開發伺服器
pnpm dev

# 訪問應用
# http://localhost:3000
```

### 3.3 檢查應用狀態

```bash
# 查看容器狀態
docker-compose ps

# 查看應用日誌
docker-compose logs -f app

# 查看資料庫日誌
docker-compose logs -f mysql

# 查看 Nginx 日誌
docker-compose logs -f nginx
```

## 第四步：功能測試清單

### 4.1 基本功能測試

- [ ] 訪問應用首頁（http://localhost:3000）
- [ ] 查看儀表板（資產總覽、交易所計數、錢包計數）
- [ ] 新增 API Key（Binance/OKX）
- [ ] 新增錢包地址（Ethereum/BSC）
- [ ] 查看資產持倉列表
- [ ] 同步資產數據
- [ ] 查看用戶設定

### 4.2 API 測試

```bash
# 測試 tRPC API
curl -X POST http://localhost:3000/api/trpc/auth.me \
  -H "Content-Type: application/json" \
  -d '{}'

# 測試資料庫連接
docker-compose exec app pnpm db:studio

# 查看資料庫
docker-compose exec mysql mysql -u crypto_user -p crypto_dashboard
```

### 4.3 性能測試

```bash
# 查看容器資源使用
docker stats

# 檢查應用響應時間
time curl http://localhost:3000/api/trpc/auth.me
```

## 第五步：故障排查

### 常見問題

**問題 1：資料庫連接失敗**

```bash
# 檢查 MySQL 容器狀態
docker-compose ps mysql

# 檢查 MySQL 日誌
docker-compose logs mysql

# 手動測試連接
docker-compose exec mysql mysql -u crypto_user -p -h localhost crypto_dashboard
```

**問題 2：應用無法啟動**

```bash
# 查看應用日誌
docker-compose logs app

# 檢查環境變數
cat .env.local

# 重新構建應用
docker-compose build --no-cache
```

**問題 3：端口被佔用**

```bash
# 查看佔用的進程
lsof -i :3000
lsof -i :3306
lsof -i :80

# 殺死進程（謹慎使用）
kill -9 <PID>
```

## 第六步：推送到 GitHub

### 6.1 初始化 Git 倉庫

```bash
# 初始化 Git
git init

# 新增所有檔案
git add .

# 建立初始提交
git commit -m "Initial commit: Crypto Dashboard MVP with Docker support"
```

### 6.2 在 GitHub 上建立新倉庫

1. 訪問 https://github.com/new
2. 填入倉庫名稱：`crypto-dashboard`
3. 選擇 **Private**（私有倉庫）
4. 點擊 **Create repository**

### 6.3 推送到 GitHub

```bash
# 替換 YOUR_USERNAME 為您的 GitHub 用戶名
git remote add origin https://github.com/YOUR_USERNAME/crypto-dashboard.git

# 重命名分支為 main
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 6.4 驗證推送成功

訪問 `https://github.com/YOUR_USERNAME/crypto-dashboard`，應該能看到您的代碼。

## 第七步：後續開發工作流

### 建立功能分支

```bash
# 建立新分支進行開發
git checkout -b feature/new-feature

# 進行開發和提交
git add .
git commit -m "feat: Add new feature"

# 推送分支到 GitHub
git push origin feature/new-feature
```

### 合併分支

1. 在 GitHub 上建立 Pull Request
2. 審查代碼
3. 合併到 main 分支

### 部署更新

```bash
# 拉取最新代碼
git pull origin main

# 重新構建和部署
./deploy.sh update
```

## 第八步：備份和恢復

### 備份資料庫

```bash
# 備份資料庫
./deploy.sh backup

# 查看備份列表
ls -la backups/
```

### 恢復備份

```bash
# 恢復備份
./deploy.sh restore backups/db_backup_20240101_120000.sql.gz
```

## 常用命令速查表

| 命令 | 用途 |
|------|------|
| `./deploy.sh start` | 啟動應用 |
| `./deploy.sh stop` | 停止應用 |
| `./deploy.sh restart` | 重啟應用 |
| `./deploy.sh update` | 更新應用 |
| `./deploy.sh logs` | 查看日誌 |
| `./deploy.sh status` | 查看狀態 |
| `./deploy.sh backup` | 備份資料庫 |
| `docker-compose ps` | 查看容器狀態 |
| `docker-compose logs -f` | 查看實時日誌 |
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 構建應用 |
| `pnpm db:push` | 執行資料庫遷移 |
| `git push origin main` | 推送到 GitHub |

## 項目文件說明

| 檔案 | 用途 |
|------|------|
| README.md | 項目概述和使用說明 |
| INSTALL_LOCAL.md | 詳細的本地安裝指南 |
| QUICKSTART_LOCAL.md | 快速啟動指南 |
| DOCKER_GUIDE.md | Docker 使用指南 |
| GITHUB_SETUP.md | GitHub 推送和管理指南 |
| API_DOCS.md | API 文檔 |
| DEVELOPER.md | 開發者指南 |
| SECURITY.md | 安全說明 |
| DEPLOYMENT.md | 部署指南 |
| deploy.sh | 自動化部署腳本 |
| docker-compose.yml | Docker Compose 配置 |
| Dockerfile | Docker 映像配置 |
| .env.example | 環境變數範本 |

## 需要幫助？

- 查看 DOCKER_GUIDE.md 了解 Docker 使用
- 查看 INSTALL_LOCAL.md 了解詳細安裝步驟
- 查看 API_DOCS.md 了解 API 文檔
- 查看 DEVELOPER.md 了解開發指南

---

**祝您開發順利！** 🚀
