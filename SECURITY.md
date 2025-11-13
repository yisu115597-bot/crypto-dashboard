# 安全政策與最佳實踐

## 概述

「極簡加密資產儀表板」將用戶數據隱私和安全視為首要任務。本文件詳細說明我們採取的安全措施。

## 核心安全原則

### 1. 唯讀 API 權限

我們**絕不**使用可以進行交易、提款或其他資金操作的 API 權限。

- ✅ **允許**：查看帳戶餘額、交易歷史
- ❌ **禁止**：進行交易、提款、轉帳、修改設定

### 2. 端到端加密

用戶的 API Key 和密碼使用 AES-256-GCM 加密演算法加密儲存。

```
未加密的 API Key
        ↓
    [AES-256-GCM 加密]
        ↓
加密後的密文（儲存在資料庫）
```

### 3. 零知識原則

我們無法訪問您的：
- API Key 和 Secret
- 私鑰或助記詞
- 交易所帳號密碼
- 個人財務數據（未經您同意）

## 加密實現細節

### API Key 加密

```typescript
// 加密過程
const plaintext = apiKey;
const encrypted = encryptString(plaintext);
// encrypted = { iv, ciphertext, authTag }

// 解密過程
const decrypted = decryptString(encrypted);
// decrypted = apiKey
```

**使用的演算法：**
- 對稱加密：AES-256-GCM
- 金鑰衍生：PBKDF2（使用 JWT_SECRET）
- 隨機初始化向量：每次加密都不同

### 金鑰管理

- **金鑰來源**：`JWT_SECRET` 環境變數
- **金鑰長度**：256 位（32 字節）
- **金鑰輪換**：需要手動執行（涉及重新加密所有數據）

## 資料安全

### 資料庫安全

1. **訪問控制**
   - 限制資料庫訪問 IP
   - 使用強密碼保護帳號
   - 定期審計訪問日誌

2. **備份與恢復**
   - 每日自動備份
   - 備份數據也被加密
   - 定期測試恢復流程

3. **資料保留政策**
   - API Key：用戶刪除後立即清除
   - 錢包地址：用戶刪除後立即清除
   - 資產快照：保留 90 天後自動刪除
   - 訪問日誌：保留 30 天後自動刪除

### 資料隱私

- **不收集**：交易所帳號密碼、私鑰、個人身份信息
- **收集**：API Key（加密）、錢包地址（公開）、資產數據（計算用）
- **不分享**：所有數據僅用於您的帳號，不與第三方分享

## 認證與授權

### OAuth 認證

我們使用 Manus OAuth 進行安全認證。

```
用戶登入
   ↓
重定向到 Manus OAuth
   ↓
用戶授權
   ↓
獲取授權碼
   ↓
交換 JWT Token
   ↓
建立會話 Cookie
```

### 會話管理

- **會話 Token**：JWT，簽名使用 `JWT_SECRET`
- **有效期**：1 年
- **儲存方式**：HttpOnly Cookie（無法被 JavaScript 訪問）
- **傳輸**：HTTPS only

### 權限控制

```typescript
// 受保護的程序（需要登入）
protectedProcedure
  .input(...)
  .query(({ ctx }) => {
    // ctx.user 包含當前用戶信息
    // 只能訪問自己的數據
  })
```

## 網路安全

### HTTPS/TLS

- **必需**：所有通信必須使用 HTTPS
- **證書**：由受信任的 CA 簽發
- **版本**：TLS 1.2+
- **密碼套件**：現代密碼套件（禁用弱加密）

### CORS 政策

```typescript
// 只允許來自應用域名的請求
cors: {
  origin: process.env.VITE_FRONTEND_URL,
  credentials: true,
}
```

### 速率限制

```typescript
// 防止暴力攻擊
- 登入：每 IP 每小時 10 次
- API 調用：每用戶每分鐘 100 次
- 交易所 API：每分鐘 10 次（避免被限制）
```

## 代碼安全

### 依賴管理

```bash
# 定期檢查依賴漏洞
pnpm audit

# 更新依賴
pnpm update
```

### 輸入驗證

所有用戶輸入都通過 Zod 進行驗證：

```typescript
const input = z.object({
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  // ...
}).parse(userInput);
```

### SQL 注入防護

使用 Drizzle ORM 防止 SQL 注入：

```typescript
// ✅ 安全：使用參數化查詢
db.select().from(users).where(eq(users.id, userId));

// ❌ 不安全：字符串拼接
db.select().from(users).where(sql`id = ${userId}`);
```

## 監控與日誌

### 安全日誌

記錄以下事件：
- 登入/登出
- API Key 新增/刪除
- 資產同步成功/失敗
- 異常訪問嘗試

```typescript
console.log(`[SECURITY] User ${userId} added API key for ${exchange}`);
console.error(`[SECURITY] Failed API sync for user ${userId}: ${error}`);
```

### 異常檢測

- 異常登入地點
- 異常 API 調用模式
- 異常資源使用

## 漏洞報告

如果您發現安全漏洞，請**不要**在公開場合報告。

**請發送電子郵件至：** security@example.com

**包含以下信息：**
1. 漏洞描述
2. 受影響的組件
3. 重現步驟
4. 潛在影響

我們將在 48 小時內確認收到，並在 7 天內提供修復計劃。

## 安全檢查清單

部署前請確認：

- [ ] `JWT_SECRET` 長度至少 32 字符
- [ ] `DATABASE_URL` 使用 SSL 連接
- [ ] 所有環境變數已設定
- [ ] 資料庫備份已配置
- [ ] HTTPS 證書已安裝
- [ ] 防火牆規則已配置
- [ ] 定期備份計劃已設定
- [ ] 監控告警已配置
- [ ] 日誌收集已配置
- [ ] 依賴漏洞已檢查

## 合規性

### GDPR 合規

- ✅ 用戶可以訪問自己的數據
- ✅ 用戶可以刪除自己的數據
- ✅ 我們不與第三方分享數據
- ✅ 隱私政策清晰透明

### 資料保護

- ✅ 數據加密儲存
- ✅ 傳輸加密（HTTPS）
- ✅ 定期備份
- ✅ 訪問控制

## 常見問題

**Q: 您能看到我的 API Key 嗎？**
A: 不能。API Key 使用 AES-256 加密儲存，我們無法解密。

**Q: 您能進行交易嗎？**
A: 不能。我們只使用「唯讀」API 權限，技術上無法進行任何交易。

**Q: 如果您的伺服器被駭客入侵怎麼辦？**
A: 駭客只能獲得加密的 API Key，無法解密。您應立即在交易所重新生成 API Key。

**Q: 我的數據會保留多久？**
A: 資產快照保留 90 天，訪問日誌保留 30 天。刪除帳號後，所有數據立即清除。

**Q: 您如何處理資料洩露？**
A: 我們將在 24 小時內通知受影響用戶，並提供補救措施。

## 更新日誌

- **v1.0.0** (2024-11-14)：初始版本，實現 AES-256 加密和 OAuth 認證
