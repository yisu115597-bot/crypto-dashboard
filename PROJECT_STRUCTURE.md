# 極簡加密資產儀表板 - 項目結構概覽

## 📦 完整項目結構

```
crypto-dashboard/
├── 📄 README.md                    # 項目概述
├── 📄 QUICKSTART_LOCAL.md          # 快速啟動指南（5分鐘）
├── 📄 INSTALL_LOCAL.md             # 詳細安裝指南
├── 📄 DOCKER_GUIDE.md              # Docker 使用指南
├── 📄 GITHUB_SETUP.md              # GitHub 推送指南
├── 📄 LOCAL_TEST_GUIDE.md          # 本地測試指南
├── 📄 API_DOCS.md                  # API 文檔
├── 📄 DEVELOPER.md                 # 開發者指南
├── 📄 SECURITY.md                  # 安全說明
├── 📄 DEPLOYMENT.md                # 部署指南
├── 📄 PROJECT_STRUCTURE.md         # 項目結構概覽（本檔案）
├── 📄 todo.md                      # 開發待辦清單
│
├── 🐳 Docker 配置
├── Dockerfile                      # Docker 映像配置
├── docker-compose.yml              # Docker Compose 配置
├── .dockerignore                   # Docker 構建忽略檔案
├── deploy.sh                       # 自動化部署腳本（600+ 行）
├── docker/
│   ├── nginx.conf                  # Nginx 反向代理配置
│   └── mysql-init.sql              # MySQL 初始化腳本
│
├── 📁 前端代碼 (client/)
├── client/
│   ├── index.html                  # HTML 入口
│   ├── src/
│   │   ├── App.tsx                 # 應用路由和佈局
│   │   ├── main.tsx                # React 入口
│   │   ├── index.css               # 全局樣式
│   │   ├── const.ts                # 常數定義
│   │   ├── lib/
│   │   │   └── trpc.ts             # tRPC 客戶端配置
│   │   ├── _core/
│   │   │   └── hooks/
│   │   │       └── useAuth.ts      # 認證 Hook
│   │   ├── pages/
│   │   │   ├── Home.tsx            # 儀表板主頁
│   │   │   ├── ApiKeys.tsx         # API Key 管理
│   │   │   ├── Wallets.tsx         # 錢包管理
│   │   │   └── Settings.tsx        # 用戶設定
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx # 儀表板佈局
│   │   │   ├── AIChatBox.tsx       # AI 聊天框
│   │   │   ├── Map.tsx             # Google Maps 集成
│   │   │   └── ui/                 # shadcn/ui 元件庫
│   │   └── contexts/
│   │       └── ThemeContext.tsx    # 主題上下文
│   └── public/                     # 靜態資源
│
├── 📁 後端代碼 (server/)
├── server/
│   ├── _core/                      # 核心框架代碼
│   │   ├── index.ts                # 伺服器入口
│   │   ├── context.ts              # tRPC 上下文
│   │   ├── trpc.ts                 # tRPC 配置
│   │   ├── env.ts                  # 環境變數
│   │   ├── oauth.ts                # OAuth 認證
│   │   ├── cookies.ts              # Cookie 管理
│   │   ├── llm.ts                  # LLM 集成
│   │   ├── imageGeneration.ts      # 圖像生成
│   │   ├── voiceTranscription.ts   # 語音轉文字
│   │   ├── notification.ts         # 通知系統
│   │   └── systemRouter.ts         # 系統路由
│   ├── routers.ts                  # tRPC 路由定義
│   ├── db.ts                       # 資料庫查詢助手
│   ├── crypto.ts                   # AES-256 加密工具
│   ├── storage.ts                  # S3 存儲助手
│   ├── exchanges/                  # 交易所 API 適配器
│   │   ├── index.ts                # 交易所工廠
│   │   ├── binance.ts              # Binance API
│   │   └── okx.ts                  # OKX API
│   └── services/                   # 業務邏輯服務
│       ├── assetSync.ts            # 資產同步服務
│       ├── priceService.ts         # 幣價數據服務
│       ├── blockchainScanner.ts    # 區塊鏈掃描服務
│       └── walletScanner.ts        # 錢包掃描服務
│
├── 📁 資料庫 (drizzle/)
├── drizzle/
│   ├── schema.ts                   # 資料庫 Schema 定義
│   ├── relations.ts                # 表關係定義
│   ├── 0000_misty_shadow_king.sql  # 初始遷移
│   ├── 0001_flawless_william_stryker.sql  # 擴展遷移
│   └── meta/                       # 遷移元數據
│
├── 📁 共享代碼 (shared/)
├── shared/
│   ├── const.ts                    # 共享常數
│   ├── types.ts                    # 共享類型定義
│   └── _core/
│       └── errors.ts               # 錯誤定義
│
├── 📁 配置檔案
├── package.json                    # 項目依賴和腳本
├── pnpm-lock.yaml                  # 依賴鎖定檔案
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite 構建配置
├── vitest.config.ts                # Vitest 測試配置
├── drizzle.config.ts               # Drizzle ORM 配置
├── components.json                 # shadcn/ui 配置
├── .gitignore                      # Git 忽略檔案
├── .prettierrc                     # Prettier 格式化配置
├── .prettierignore                 # Prettier 忽略檔案
└── .env.example                    # 環境變數範本
```

## 🎯 核心功能模塊

### 1. 認證系統 (Authentication)
- **檔案**：`server/_core/oauth.ts`、`client/_core/hooks/useAuth.ts`
- **功能**：Manus OAuth 整合、會話管理、保護路由

### 2. 資料庫層 (Database)
- **檔案**：`drizzle/schema.ts`、`server/db.ts`
- **表結構**：users、api_keys、wallet_addresses、asset_snapshots
- **功能**：CRUD 操作、資料持久化

### 3. 加密安全 (Encryption)
- **檔案**：`server/crypto.ts`
- **算法**：AES-256-GCM
- **用途**：API Key 和密碼加密

### 4. 交易所集成 (Exchange Integration)
- **檔案**：`server/exchanges/`
- **支援**：Binance、OKX
- **功能**：帳戶資訊查詢、資產餘額查詢

### 5. 區塊鏈掃描 (Blockchain Scanning)
- **檔案**：`server/services/blockchainScanner.ts`
- **支援**：Ethereum、BSC、Polygon、Arbitrum、Optimism、TRON
- **功能**：原生幣和 ERC-20/BEP-20 代幣查詢

### 6. 幣價數據 (Price Service)
- **檔案**：`server/services/priceService.ts`
- **來源**：CoinGecko API
- **功能**：實時幣價、USD/TWD 轉換、5 分鐘快取

### 7. 資產同步 (Asset Sync)
- **檔案**：`server/services/assetSync.ts`
- **功能**：定期同步交易所和錢包資產、計算總價值

### 8. 前端儀表板 (Dashboard UI)
- **檔案**：`client/src/pages/Home.tsx`
- **功能**：資產總覽、分佈圖表、快速操作

### 9. API 管理 (API Key Management)
- **檔案**：`client/src/pages/ApiKeys.tsx`
- **功能**：新增、編輯、刪除 API Key

### 10. 錢包管理 (Wallet Management)
- **檔案**：`client/src/pages/Wallets.tsx`
- **功能**：新增、編輯、刪除錢包地址

## 🔧 技術棧

### 前端
- **框架**：React 19
- **樣式**：Tailwind CSS 4
- **UI 元件**：shadcn/ui
- **狀態管理**：tRPC + React Query
- **路由**：wouter
- **構建**：Vite

### 後端
- **運行時**：Node.js 22
- **框架**：Express 4
- **RPC**：tRPC 11
- **ORM**：Drizzle ORM
- **資料庫**：MySQL 8.0
- **認證**：Manus OAuth

### DevOps
- **容器化**：Docker + Docker Compose
- **反向代理**：Nginx
- **部署**：自動化腳本（deploy.sh）

## 📊 資料庫 Schema

### users 表
```sql
- id (INT, PK)
- openId (VARCHAR, UNIQUE)
- name (TEXT)
- email (VARCHAR)
- loginMethod (VARCHAR)
- role (ENUM: user, admin)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- lastSignedIn (TIMESTAMP)
```

### api_keys 表
```sql
- id (INT, PK)
- userId (INT, FK)
- exchange (VARCHAR: binance, okx)
- encryptedApiKey (TEXT)
- encryptedSecretKey (TEXT)
- label (VARCHAR)
- isActive (BOOLEAN)
- lastSyncedAt (TIMESTAMP)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### wallet_addresses 表
```sql
- id (INT, PK)
- userId (INT, FK)
- address (VARCHAR)
- blockchain (VARCHAR: ethereum, bsc, polygon, arbitrum, optimism, tron)
- label (VARCHAR)
- isActive (BOOLEAN)
- lastSyncedAt (TIMESTAMP)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### asset_snapshots 表
```sql
- id (INT, PK)
- userId (INT, FK)
- sourceId (VARCHAR: api_key_id or wallet_address_id)
- sourceType (VARCHAR: exchange, wallet)
- symbol (VARCHAR)
- balance (DECIMAL)
- usdValue (DECIMAL)
- twdValue (DECIMAL)
- snapshotTime (TIMESTAMP)
- createdAt (TIMESTAMP)
```

## 🚀 快速開始

### 最快的方式（5 分鐘）
```bash
unzip crypto-dashboard-complete.zip
cd crypto-dashboard
cp .env.example .env.local
# 編輯 .env.local 填入配置
./deploy.sh start
# 訪問 http://localhost:3000
```

### 詳細步驟
見 `LOCAL_TEST_GUIDE.md`

## 📚 文件導航

| 文件 | 用途 |
|------|------|
| README.md | 項目概述 |
| QUICKSTART_LOCAL.md | 5 分鐘快速啟動 |
| LOCAL_TEST_GUIDE.md | 本地測試和 GitHub 推送 |
| INSTALL_LOCAL.md | 詳細安裝指南 |
| DOCKER_GUIDE.md | Docker 使用指南 |
| GITHUB_SETUP.md | GitHub 推送指南 |
| API_DOCS.md | API 文檔 |
| DEVELOPER.md | 開發者指南 |
| SECURITY.md | 安全說明 |
| DEPLOYMENT.md | 部署指南 |
| PROJECT_STRUCTURE.md | 項目結構概覽 |

## 🎓 學習路徑

1. **了解項目**：閱讀 README.md
2. **快速啟動**：按照 QUICKSTART_LOCAL.md 啟動應用
3. **本地測試**：按照 LOCAL_TEST_GUIDE.md 進行測試
4. **推送到 GitHub**：按照 GITHUB_SETUP.md 推送代碼
5. **深入開發**：閱讀 DEVELOPER.md 和 API_DOCS.md
6. **部署上線**：按照 DEPLOYMENT.md 和 DOCKER_GUIDE.md 部署

## 💡 開發建議

1. **使用 Docker**：所有開發和部署都使用 Docker，確保環境一致性
2. **定期備份**：使用 `./deploy.sh backup` 定期備份資料庫
3. **監控日誌**：使用 `docker-compose logs -f` 監控應用狀態
4. **版本控制**：使用 Git 進行版本控制，遵循提交規範
5. **代碼審查**：使用 Pull Request 進行代碼審查

---

**最後更新**：2024-11-14  
**版本**：1.0.0 (MVP)
