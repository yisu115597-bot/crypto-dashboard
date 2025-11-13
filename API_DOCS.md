# API 文檔

本文件詳細說明所有 tRPC 程序的使用方法。

## 概述

應用使用 tRPC 作為 RPC 框架，提供端到端的類型安全。所有 API 調用都通過 `/api/trpc` 端點進行。

## 認證

所有受保護的程序都需要有效的會話 Cookie。登入後會自動設定。

```typescript
// 公開程序（無需認證）
const result = await trpc.auth.me.useQuery();

// 受保護程序（需要認證）
const result = await trpc.apiKeys.list.useQuery();
```

## 認證 (auth)

### auth.me

獲取當前用戶信息。

**類型**：Query（公開）

**返回值**：
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
} | null
```

**示例**：
```typescript
const user = await trpc.auth.me.useQuery();
if (user) {
  console.log(`歡迎，${user.name}！`);
}
```

### auth.logout

登出當前用戶。

**類型**：Mutation（公開）

**返回值**：
```typescript
{ success: true }
```

**示例**：
```typescript
const logout = trpc.auth.logout.useMutation();
logout.mutate();
```

## API Key 管理 (apiKeys)

### apiKeys.add

新增一個 API Key。

**類型**：Mutation（受保護）

**輸入參數**：
```typescript
{
  exchange: "binance" | "okx";
  apiKey: string;           // API Key
  apiSecret: string;        // API Secret
  passphrase?: string;      // OKX 專用
  label?: string;           // 自訂標籤
}
```

**返回值**：
```typescript
{ success: true }
```

**錯誤**：
- `Invalid API credentials` - API Key 無效
- `API key already exists` - 該 API Key 已存在

**示例**：
```typescript
const addKey = trpc.apiKeys.add.useMutation({
  onSuccess: () => {
    toast.success("API Key 已新增");
    refetch();
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

addKey.mutate({
  exchange: "binance",
  apiKey: "your_api_key",
  apiSecret: "your_api_secret",
  label: "主帳號",
});
```

### apiKeys.list

列出所有 API Key。

**類型**：Query（受保護）

**返回值**：
```typescript
{
  id: number;
  exchange: "binance" | "okx";
  label: string | null;
  isActive: boolean;
  lastSyncedAt: Date | null;
  lastSyncError: string | null;
  createdAt: Date;
}[]
```

**示例**：
```typescript
const { data: apiKeys } = trpc.apiKeys.list.useQuery();
apiKeys?.forEach((key) => {
  console.log(`${key.exchange}: ${key.label || "未命名"}`);
});
```

### apiKeys.delete

刪除一個 API Key。

**類型**：Mutation（受保護）

**輸入參數**：
```typescript
{ id: number }
```

**返回值**：
```typescript
{ success: true }
```

**示例**：
```typescript
const deleteKey = trpc.apiKeys.delete.useMutation();
deleteKey.mutate({ id: 123 });
```

### apiKeys.update

更新 API Key 的標籤或活動狀態。

**類型**：Mutation（受保護）

**輸入參數**：
```typescript
{
  id: number;
  label?: string;
  isActive?: boolean;
}
```

**返回值**：
```typescript
{ success: true }
```

**示例**：
```typescript
const updateKey = trpc.apiKeys.update.useMutation();
updateKey.mutate({
  id: 123,
  label: "交易機器人",
  isActive: false,
});
```

## 錢包管理 (wallets)

### wallets.add

新增一個錢包地址。

**類型**：Mutation（受保護）

**輸入參數**：
```typescript
{
  network: "ethereum" | "bsc" | "polygon" | "arbitrum" | "tron";
  address: string;
  label?: string;
}
```

**返回值**：
```typescript
{ success: true }
```

**示例**：
```typescript
const addWallet = trpc.wallets.add.useMutation();
addWallet.mutate({
  network: "ethereum",
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  label: "主錢包",
});
```

### wallets.list

列出所有錢包地址。

**類型**：Query（受保護）

**返回值**：
```typescript
{
  id: number;
  network: "ethereum" | "bsc" | "polygon" | "arbitrum" | "tron";
  address: string;
  label: string | null;
  isActive: boolean;
  lastSyncedAt: Date | null;
  lastSyncError: string | null;
  createdAt: Date;
}[]
```

**示例**：
```typescript
const { data: wallets } = trpc.wallets.list.useQuery();
```

### wallets.delete

刪除一個錢包地址。

**類型**：Mutation（受保護）

**輸入參數**：
```typescript
{ id: number }
```

**返回值**：
```typescript
{ success: true }
```

### wallets.update

更新錢包的標籤或活動狀態。

**類型**：Mutation（受保護）

**輸入參數**：
```typescript
{
  id: number;
  label?: string;
  isActive?: boolean;
}
```

**返回值**：
```typescript
{ success: true }
```

## 資產管理 (assets)

### assets.getLatest

獲取最新的資產快照。

**類型**：Query（受保護）

**返回值**：
```typescript
{
  id: number;
  userId: number;
  totalValueUsd: string;
  totalValueTwd: string;
  assetsData: {
    [key: string]: {
      symbol: string;
      free: number;
      locked: number;
      total: number;
      source: string;
      priceUsd?: number;
      valueUsd?: number;
    };
  };
  source: "auto_sync" | "manual_sync";
  createdAt: Date;
} | null
```

**示例**：
```typescript
const { data: snapshot } = trpc.assets.getLatest.useQuery();
if (snapshot) {
  console.log(`總資產：$${snapshot.totalValueUsd}`);
  Object.entries(snapshot.assetsData).forEach(([key, asset]) => {
    console.log(`${asset.symbol}: ${asset.total}`);
  });
}
```

### assets.getHistory

獲取資產快照歷史。

**類型**：Query（受保護）

**輸入參數**：
```typescript
{ limit?: number } // 預設 30
```

**返回值**：
```typescript
{
  id: number;
  userId: number;
  totalValueUsd: string;
  totalValueTwd: string;
  assetsData: {...};
  source: "auto_sync" | "manual_sync";
  createdAt: Date;
}[]
```

**示例**：
```typescript
const { data: history } = trpc.assets.getHistory.useQuery({ limit: 7 });
history?.forEach((snapshot) => {
  console.log(`${snapshot.createdAt}: $${snapshot.totalValueUsd}`);
});
```

### assets.sync

手動觸發資產同步。

**類型**：Mutation（受保護）

**返回值**：
```typescript
{
  success: boolean;
  error?: string;
  assetsCount?: number;
}
```

**示例**：
```typescript
const sync = trpc.assets.sync.useMutation({
  onSuccess: (result) => {
    toast.success(`已同步 ${result.assetsCount} 項資產`);
  },
  onError: (error) => {
    toast.error(`同步失敗：${error.message}`);
  },
});

sync.mutate();
```

## 錯誤處理

所有 tRPC 調用都可能返回錯誤。使用 `onError` 回調處理：

```typescript
const mutation = trpc.apiKeys.add.useMutation({
  onError: (error) => {
    if (error.code === "UNAUTHORIZED") {
      // 用戶未登入
    } else if (error.code === "BAD_REQUEST") {
      // 輸入驗證失敗
      console.log(error.message);
    } else {
      // 其他錯誤
      console.error(error);
    }
  },
});
```

## 類型定義

### Exchange

```typescript
type Exchange = "binance" | "okx";
```

### Network

```typescript
type Network = "ethereum" | "bsc" | "polygon" | "arbitrum" | "tron";
```

### Asset

```typescript
interface Asset {
  symbol: string;
  free: number;        // 可用數量
  locked: number;      // 凍結數量
  total: number;       // 總數量
  source: string;      // 來源（交易所名稱）
  priceUsd?: number;   // USD 價格
  valueUsd?: number;   // USD 價值
}
```

## 最佳實踐

### 1. 使用 Optimistic Updates

```typescript
const mutation = trpc.apiKeys.delete.useMutation({
  onMutate: async (variables) => {
    // 立即更新 UI
    await trpc.useUtils().apiKeys.list.cancel();
    const previousData = trpc.useUtils().apiKeys.list.getData();
    
    trpc.useUtils().apiKeys.list.setData(
      undefined,
      (old) => old?.filter((k) => k.id !== variables.id)
    );
    
    return { previousData };
  },
  onError: (error, variables, context) => {
    // 恢復之前的數據
    if (context?.previousData) {
      trpc.useUtils().apiKeys.list.setData(undefined, context.previousData);
    }
  },
});
```

### 2. 自動重新驗證

```typescript
const { data, refetch } = trpc.assets.getLatest.useQuery(undefined, {
  refetchInterval: 60000, // 每 60 秒重新驗證
});
```

### 3. 禁用自動驗證

```typescript
const { data } = trpc.apiKeys.list.useQuery(undefined, {
  enabled: isAuthenticated, // 只在登入後查詢
});
```

## 常見問題

### Q: 如何處理網路錯誤？

**A:** tRPC 會自動重試失敗的請求。如需自訂，使用 `onError` 回調。

### Q: 如何取消正在進行的請求？

**A:** 使用 `abort` 方法：
```typescript
const mutation = trpc.assets.sync.useMutation();
mutation.abort();
```

### Q: 如何檢查請求是否正在進行？

**A:** 使用 `isPending` 或 `isLoading` 狀態：
```typescript
const mutation = trpc.apiKeys.add.useMutation();
if (mutation.isPending) {
  console.log("正在新增 API Key...");
}
```

## 更新日誌

- **v1.0.0** (2024-11-14)：初始版本
