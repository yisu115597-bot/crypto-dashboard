# 本地開發快速啟動指南

如果您已經有了開發環境，可以按照本指南快速啟動應用。

## 5 分鐘快速啟動

### 1. 克隆項目

```bash
git clone https://github.com/your-username/crypto-dashboard.git
cd crypto-dashboard
```

### 2. 安裝依賴

```bash
pnpm install
```

### 3. 配置資料庫

```bash
# 建立資料庫
mysql -u root -p << EOF
CREATE DATABASE crypto_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crypto_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON crypto_dashboard.* TO 'crypto_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 執行遷移
pnpm db:push
```

### 4. 配置環境變數

```bash
# 複製範本
cp .env.example .env.local

# 編輯 .env.local，至少填入以下內容：
# DATABASE_URL=mysql://crypto_user:your_password@localhost:3306/crypto_dashboard
# JWT_SECRET=your_random_32_char_secret
# ETHERSCAN_API_KEY=your_etherscan_key
```

### 5. 啟動開發伺服器

```bash
pnpm dev
```

訪問 `http://localhost:3000`

## 常用開發命令

```bash
# 啟動開發伺服器
pnpm dev

# 分別啟動前端和後端
pnpm dev:client
pnpm dev:server

# 打開資料庫管理 UI
pnpm db:studio

# 構建生產版本
pnpm build

# 檢查 TypeScript 錯誤
pnpm tsc --noEmit

# 執行測試
pnpm test
```

## 常見問題

**Q: 資料庫連接失敗？**  
A: 檢查 MySQL 是否運行，確認 DATABASE_URL 正確

**Q: 端口 3000 已被佔用？**  
A: 殺死佔用進程：`lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9`

**Q: 依賴安裝失敗？**  
A: 清除快取並重新安裝：`pnpm install --force`

## 下一步

- 查看 [INSTALL_LOCAL.md](./INSTALL_LOCAL.md) 了解完整安裝指南
- 查看 [DEVELOPER.md](./DEVELOPER.md) 了解開發指南
- 查看 [API_DOCS.md](./API_DOCS.md) 了解 API 文檔
