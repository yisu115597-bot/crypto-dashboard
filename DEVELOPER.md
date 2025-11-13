# 開發者指南

本文件為開發者提供項目架構、開發流程和貢獻指南。

## 項目架構

### 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| 前端 | React 19 | 19.0+ |
| 前端框架 | Vite | 5.0+ |
| 樣式 | Tailwind CSS 4 | 4.0+ |
| UI 元件 | shadcn/ui | - |
| 後端 | Express 4 | 4.0+ |
| RPC 框架 | tRPC 11 | 11.0+ |
| 資料庫 | MySQL/TiDB | 5.7+ |
| ORM | Drizzle | 0.30+ |
| 認證 | Manus OAuth | - |

### 目錄結構

```
crypto-dashboard/
├── client/                    # 前端應用
│   ├── public/               # 靜態資源
│   ├── src/
│   │   ├── pages/           # 頁面元件
│   │   ├── components/      # 可重用元件
│   │   ├── contexts/        # React Context
│   │   ├── hooks/           # 自訂 Hook
│   │   ├── lib/             # 工具函數
│   │   ├── App.tsx          # 主應用
│   │   ├── main.tsx         # 入口點
│   │   ├── index.css        # 全域樣式
│   │   └── const.ts         # 常數定義
│   ├── index.html           # HTML 模板
│   └── vite.config.ts       # Vite 配置
│
├── server/                    # 後端應用
│   ├── _core/               # 核心框架
│   │   ├── context.ts       # tRPC Context
│   │   ├── trpc.ts          # tRPC 設定
│   │   ├── env.ts           # 環境變數
│   │   └── index.ts         # 伺服器入口
│   ├── services/            # 業務邏輯
│   │   ├── assetSync.ts     # 資產同步
│   │   ├── priceService.ts  # 幣價服務
│   │   └── walletScanner.ts # 錢包掃描
│   ├── exchanges/           # 交易所適配器
│   │   ├── binance.ts       # Binance API
│   │   ├── okx.ts           # OKX API
│   │   └── index.ts         # 適配器工廠
│   ├── db.ts                # 資料庫查詢
│   ├── routers.ts           # tRPC 路由
│   ├── crypto.ts            # 加密工具
│   └── storage.ts           # 檔案儲存
│
├── drizzle/                  # 資料庫
│   ├── schema.ts            # 表定義
│   └── migrations/          # 遷移檔案
│
├── shared/                   # 共享代碼
│   ├── const.ts             # 共享常數
│   └── types.ts             # 共享類型
│
├── README.md                # 用戶指南
├── API_DOCS.md              # API 文檔
├── DEPLOYMENT.md            # 部署指南
├── SECURITY.md              # 安全說明
├── DEVELOPER.md             # 本檔案
├── package.json             # 依賴管理
├── tsconfig.json            # TypeScript 配置
└── .env.example             # 環境變數範本
```

## 開發流程

### 1. 環境設定

```bash
# 克隆倉庫
git clone <repository-url>
cd crypto-dashboard

# 安裝依賴
pnpm install

# 複製環境變數
cp .env.example .env.local

# 編輯 .env.local，填入必要的環境變數
```

### 2. 啟動開發伺服器

```bash
# 啟動開發伺服器（前後端同時）
pnpm dev

# 或分別啟動
pnpm dev:client  # 前端：http://localhost:5173
pnpm dev:server  # 後端：http://localhost:3000
```

### 3. 資料庫設定

```bash
# 執行遷移
pnpm db:push

# 生成 ORM 類型
pnpm db:generate

# 查看資料庫 UI
pnpm db:studio
```

### 4. 代碼編輯

編輯代碼時，開發伺服器會自動重新加載（HMR）。

### 5. 測試

```bash
# 執行測試
pnpm test

# 監視模式
pnpm test:watch

# 覆蓋率報告
pnpm test:coverage
```

### 6. 構建

```bash
# 構建生產版本
pnpm build

# 預覽構建結果
pnpm preview
```

## 常見開發任務

### 新增新頁面

1. 在 `client/src/pages/` 建立新檔案（例如 `NewPage.tsx`）
2. 在 `client/src/App.tsx` 中新增路由
3. 在 `client/src/pages/Home.tsx` 中新增導航連結

```typescript
// client/src/pages/NewPage.tsx
import { useAuth } from "@/_core/hooks/useAuth";

export default function NewPage() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>新頁面</h1>
      {/* 您的內容 */}
    </div>
  );
}
```

### 新增新 API 程序

1. 在 `server/routers.ts` 中新增程序
2. 在前端使用 `trpc.*.useQuery()` 或 `trpc.*.useMutation()`

```typescript
// server/routers.ts
export const appRouter = router({
  myFeature: router({
    getData: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        // 實現邏輯
        return data;
      }),
  }),
});

// client/src/pages/MyPage.tsx
const { data } = trpc.myFeature.getData.useQuery({ id: 123 });
```

### 新增資料庫表

1. 在 `drizzle/schema.ts` 中定義表
2. 執行遷移

```typescript
// drizzle/schema.ts
export const myTable = mysqlTable("my_table", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

```bash
pnpm db:push
```

### 新增交易所支援

1. 在 `server/exchanges/` 中建立新適配器
2. 實現 `ExchangeAdapter` 介面
3. 在 `server/exchanges/index.ts` 中註冊

```typescript
// server/exchanges/myexchange.ts
export class MyExchangeAdapter implements ExchangeAdapter {
  async validateCredentials(...): Promise<boolean> { ... }
  async getAssets(...): Promise<Asset[]> { ... }
}

// server/exchanges/index.ts
export function getAdapter(exchange: ExchangeName): ExchangeAdapter {
  switch (exchange) {
    case "myexchange":
      return new MyExchangeAdapter();
    // ...
  }
}
```

## 代碼風格

### TypeScript

- 使用嚴格模式（`strict: true`）
- 為所有函數新增類型註解
- 避免使用 `any` 類型

```typescript
// ✅ 好
function getUserById(id: number): Promise<User | null> {
  // ...
}

// ❌ 不好
function getUserById(id: any): any {
  // ...
}
```

### React

- 使用函數元件和 Hook
- 避免在 render 中建立新物件
- 使用 `useCallback` 和 `useMemo` 優化效能

```typescript
// ✅ 好
function MyComponent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => setCount(c => c + 1), []);
  
  return <button onClick={handleClick}>{count}</button>;
}

// ❌ 不好
function MyComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### CSS

- 使用 Tailwind CSS 工具類
- 避免自訂 CSS（除非必要）
- 使用 shadcn/ui 元件

```typescript
// ✅ 好
<div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
  <h1 className="text-2xl font-bold">標題</h1>
</div>

// ❌ 不好
<div style={{ display: "flex", gap: "16px", padding: "16px" }}>
  <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>標題</h1>
</div>
```

## 安全最佳實踐

### 1. 輸入驗證

使用 Zod 驗證所有用戶輸入：

```typescript
const input = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
}).parse(userInput);
```

### 2. SQL 注入防護

使用 Drizzle ORM，避免字符串拼接：

```typescript
// ✅ 安全
db.select().from(users).where(eq(users.id, userId));

// ❌ 不安全
db.select().from(users).where(sql`id = ${userId}`);
```

### 3. 認證檢查

使用 `protectedProcedure` 保護敏感操作：

```typescript
protectedProcedure
  .input(...)
  .mutation(({ ctx, input }) => {
    // ctx.user 已驗證
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
  })
```

### 4. 敏感數據加密

使用 AES-256 加密敏感數據：

```typescript
import { encryptString, decryptString } from "./crypto";

const encrypted = encryptString(apiKey);
const decrypted = decryptString(encrypted);
```

## 性能優化

### 1. 資料庫查詢

- 使用索引加速查詢
- 避免 N+1 查詢問題
- 使用分頁限制結果集

```typescript
// ✅ 好
const users = await db.select()
  .from(users)
  .limit(10)
  .offset((page - 1) * 10);

// ❌ 不好
const users = await db.select().from(users); // 可能返回數百萬行
```

### 2. 快取

- 使用 tRPC 的快取機制
- 實現 Redis 快取（可選）
- 快取幣價數據（5 分鐘）

```typescript
const { data } = trpc.assets.getLatest.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5 分鐘內不重新驗證
});
```

### 3. 代碼分割

- 使用動態導入分割代碼
- 延遲加載非關鍵元件

```typescript
const HeavyComponent = lazy(() => import("./HeavyComponent"));

<Suspense fallback={<Spinner />}>
  <HeavyComponent />
</Suspense>
```

## 測試

### 單元測試

```typescript
// __tests__/crypto.test.ts
import { encryptString, decryptString } from "../crypto";

describe("Crypto", () => {
  it("should encrypt and decrypt correctly", () => {
    const plaintext = "secret";
    const encrypted = encryptString(plaintext);
    const decrypted = decryptString(encrypted);
    expect(decrypted).toBe(plaintext);
  });
});
```

### 集成測試

```typescript
// __tests__/api.test.ts
import { createCallerFactory } from "../server/_core/trpc";

describe("API", () => {
  it("should add API key", async () => {
    const caller = createCallerFactory()(mockContext);
    const result = await caller.apiKeys.add({
      exchange: "binance",
      apiKey: "test",
      apiSecret: "test",
    });
    expect(result.success).toBe(true);
  });
});
```

## 部署

詳見 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 貢獻指南

### 提交 Pull Request

1. Fork 倉庫
2. 建立功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m "Add amazing feature"`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 開啟 Pull Request

### 代碼審查

所有 PR 都需要至少一個審查者的批准。

### 提交信息

使用清晰的提交信息：

```
feat: 新增 API Key 加密功能
fix: 修復資產同步錯誤
docs: 更新 README
refactor: 簡化資料庫查詢
test: 新增加密測試
```

## 常見問題

### Q: 如何調試後端代碼？

**A:** 使用 VS Code 的調試器：
```json
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/server/index.ts",
  "runtimeArgs": ["--loader", "tsx"],
}
```

### Q: 如何查看資料庫？

**A:** 執行 `pnpm db:studio` 打開 Drizzle Studio。

### Q: 如何新增環境變數？

**A:** 在 `.env.local` 中新增，然後在 `server/_core/env.ts` 中定義。

### Q: 如何處理 CORS 錯誤？

**A:** CORS 已在 `server/_core/index.ts` 中配置，確保前端 URL 正確。

## 聯繫

有問題或建議？請開啟 GitHub Issue 或聯繫開發團隊。

---

**最後更新**：2024-11-14
