# 本地測試快速清單（15 分鐘）

## 前置準備（5 分鐘）

```bash
# 1. 克隆項目
git clone https://github.com/YOUR_USERNAME/crypto-dashboard.git
cd crypto-dashboard

# 2. 複製環境變數
cp .env.example .env.local

# 3. 編輯 .env.local（至少填入這些）
# DATABASE_URL=mysql://crypto_user:crypto_password@localhost:3306/crypto_dashboard
# JWT_SECRET=your_random_32_char_secret_key_here
# ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## 啟動應用（5 分鐘）

### 方式 A：使用 Docker（推薦，無需本地 MySQL）

```bash
# 啟動所有容器
./deploy.sh start

# 等待 30 秒讓 MySQL 和應用啟動
sleep 30

# 訪問應用
# http://localhost:3000
```

### 方式 B：本地開發（需要預先安裝 MySQL）

```bash
# 安裝依賴
pnpm install

# 執行資料庫遷移
pnpm db:push

# 啟動開發伺服器
pnpm dev

# 訪問應用
# http://localhost:3000
```

## 核心功能測試（5 分鐘）

### ✅ 儀表板主頁
- [ ] 訪問 http://localhost:3000
- [ ] 看到歡迎信息和資產總覽卡片
- [ ] 顯示「已連接交易所：0」和「追蹤錢包：0」

### ✅ API Key 管理
- [ ] 點擊「新增交易所」按鈕
- [ ] 選擇 Binance 或 OKX
- [ ] 填入 API Key 和 Secret Key
- [ ] 點擊「保存」
- [ ] 驗證 API Key 出現在列表中

### ✅ 錢包管理
- [ ] 點擊「新增錢包」按鈕
- [ ] 選擇區塊鏈（Ethereum、BSC 等）
- [ ] 填入錢包地址
- [ ] 點擊「保存」
- [ ] 驗證錢包地址出現在列表中

### ✅ 資產同步
- [ ] 點擊「立即同步」按鈕
- [ ] 等待同步完成
- [ ] 查看資產持倉列表（如果有資產）

### ✅ 用戶設定
- [ ] 點擊「設定」進入用戶設定頁面
- [ ] 查看隱私政策和安全建議
- [ ] 驗證頁面正常顯示

## 故障排查

### 問題 1：無法訪問 http://localhost:3000

```bash
# 檢查容器狀態
docker-compose ps

# 查看應用日誌
docker-compose logs app

# 檢查端口是否被佔用
lsof -i :3000
```

### 問題 2：資料庫連接失敗

```bash
# 檢查 MySQL 容器
docker-compose ps mysql

# 測試連接
docker-compose exec mysql mysql -u crypto_user -p -h localhost crypto_dashboard
```

### 問題 3：應用無法啟動

```bash
# 重新構建應用
docker-compose build --no-cache

# 重新啟動
docker-compose up -d
```

## 成功標誌

✅ 應用成功啟動  
✅ 可以訪問儀表板  
✅ 可以新增 API Key  
✅ 可以新增錢包地址  
✅ 可以進行資產同步  
✅ 可以訪問用戶設定  

## 下一步

1. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Crypto Dashboard MVP"
   git push origin main
   ```

2. **進行後續開發**
   - 添加資產趨勢圖表
   - 實現定期自動同步任務
   - 添加更多交易所支援

3. **部署到生產環境**
   - 按照 DOCKER_GUIDE.md 配置 SSL
   - 按照 DEPLOYMENT.md 進行部署

---

**預期時間**：15 分鐘  
**難度**：⭐ 簡單  
**成功率**：95%+
