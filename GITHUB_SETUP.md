# GitHub 推送和管理指南

本指南說明如何將本地項目推送到 GitHub，並進行版本管理。

## 第一次推送到 GitHub

### 1. 在 GitHub 上建立新倉庫

1. 訪問 https://github.com/new
2. 填入倉庫名稱：`crypto-dashboard`
3. 選擇 **Private**（私有倉庫，保護您的代碼）
4. 點擊 **Create repository**

### 2. 初始化本地 Git 倉庫

```bash
cd crypto-dashboard

# 初始化 Git
git init

# 新增所有檔案
git add .

# 建立初始提交
git commit -m "Initial commit: Crypto Dashboard MVP"
```

### 3. 連接到遠端倉庫

```bash
# 替換 YOUR_USERNAME 為您的 GitHub 用戶名
git remote add origin https://github.com/YOUR_USERNAME/crypto-dashboard.git

# 重命名分支為 main
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 4. 驗證推送成功

訪問 `https://github.com/YOUR_USERNAME/crypto-dashboard`，應該能看到您的代碼。

## 日常開發工作流

### 進行更改並提交

```bash
# 查看修改狀態
git status

# 新增特定檔案
git add server/services/newFeature.ts

# 或新增所有修改
git add .

# 提交更改（使用有意義的提交信息）
git commit -m "feat: Add new feature for asset tracking"

# 推送到 GitHub
git push origin main
```

### 提交信息規範

使用以下格式編寫提交信息：

```
feat: 新增功能
fix: 修復 bug
docs: 文件更新
style: 代碼格式調整
refactor: 代碼重構
perf: 性能改進
test: 測試相關
chore: 構建或依賴更新
```

示例：
```bash
git commit -m "feat: Add blockchain wallet scanning for Ethereum and BSC"
git commit -m "fix: Resolve database connection timeout issue"
git commit -m "docs: Update installation guide for local deployment"
```

## 分支管理

### 建立功能分支

```bash
# 建立新分支
git checkout -b feature/wallet-scanning

# 進行開發和提交
git add .
git commit -m "feat: Implement wallet scanning service"

# 推送分支到 GitHub
git push origin feature/wallet-scanning
```

### 合併分支（Pull Request）

1. 在 GitHub 上訪問您的倉庫
2. 點擊 **Pull requests** 標籤
3. 點擊 **New pull request**
4. 選擇 `feature/wallet-scanning` → `main`
5. 填寫描述並點擊 **Create pull request**
6. 審查代碼後點擊 **Merge pull request**

### 刪除已合併的分支

```bash
# 本地刪除
git branch -d feature/wallet-scanning

# 遠端刪除
git push origin --delete feature/wallet-scanning
```

## 版本發佈

### 建立發佈版本

```bash
# 建立標籤
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送標籤到 GitHub
git push origin v1.0.0

# 推送所有標籤
git push origin --tags
```

### 在 GitHub 上建立 Release

1. 訪問 https://github.com/YOUR_USERNAME/crypto-dashboard/releases
2. 點擊 **Draft a new release**
3. 選擇標籤 `v1.0.0`
4. 填寫發佈說明
5. 點擊 **Publish release**

## 重要檔案管理

### .gitignore 配置

確保敏感檔案不被提交：

```
# 環境變數
.env.local
.env.production
.env.*.local

# 依賴
node_modules/
pnpm-lock.yaml

# 構建輸出
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 日誌
*.log
npm-debug.log*
pnpm-debug.log*

# 臨時檔案
tmp/
temp/
```

### 保護敏感資訊

**永遠不要提交：**
- API 密鑰
- 資料庫密碼
- JWT 密鑰
- 個人信息

**如果意外提交了敏感信息：**

```bash
# 從歷史記錄中移除檔案
git rm --cached .env.local
git commit --amend -m "Remove sensitive files"
git push origin main --force-with-lease

# 更改所有密鑰（因為它們已暴露）
```

## 協作開發

### 邀請協作者

1. 訪問倉庫設定：Settings → Collaborators
2. 點擊 **Add people**
3. 輸入協作者的 GitHub 用戶名
4. 選擇權限級別

### 同步遠端更改

```bash
# 拉取最新代碼
git pull origin main

# 如果有衝突，手動解決後提交
git add .
git commit -m "Merge remote changes"
git push origin main
```

## 常用 Git 命令

| 命令 | 用途 |
|------|------|
| `git status` | 查看修改狀態 |
| `git add .` | 新增所有修改 |
| `git commit -m "message"` | 提交更改 |
| `git push origin main` | 推送到 GitHub |
| `git pull origin main` | 拉取最新代碼 |
| `git log` | 查看提交歷史 |
| `git diff` | 查看修改詳情 |
| `git branch` | 列出分支 |
| `git checkout -b branch-name` | 建立新分支 |
| `git merge branch-name` | 合併分支 |

## 故障排查

### 推送被拒絕

```bash
# 原因：遠端有新提交
# 解決：先拉取再推送
git pull origin main
git push origin main
```

### 提交信息寫錯

```bash
# 修改最後一次提交信息
git commit --amend -m "Correct message"

# 推送修改
git push origin main --force-with-lease
```

### 誤刪檔案

```bash
# 查看刪除歷史
git log --diff-filter=D --summary

# 恢復檔案
git checkout <commit-hash>^ -- path/to/file
```

## 備份和恢復

### 本地備份

```bash
# 克隆完整倉庫（包含所有歷史）
git clone --mirror https://github.com/YOUR_USERNAME/crypto-dashboard.git
```

### 恢復到之前的版本

```bash
# 查看提交歷史
git log --oneline

# 恢復到特定提交
git reset --hard <commit-hash>

# 強制推送（謹慎使用）
git push origin main --force-with-lease
```

## 安全最佳實踐

1. **啟用雙因素認證（2FA）**
   - GitHub Settings → Security → Two-factor authentication

2. **使用 SSH 密鑰代替密碼**
   ```bash
   # 生成 SSH 密鑰
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # 新增到 GitHub：Settings → SSH and GPG keys
   ```

3. **定期更新依賴**
   ```bash
   pnpm update
   pnpm audit
   ```

4. **啟用分支保護**
   - Settings → Branches → Add rule
   - 要求 pull request 審查
   - 要求狀態檢查通過

## 參考資源

- [GitHub 官方文檔](https://docs.github.com)
- [Git 官方文檔](https://git-scm.com/doc)
- [GitHub CLI 工具](https://cli.github.com/)

---

**提示**：定期備份您的代碼到多個地方，確保數據安全。
