# 多階段構建：第一階段編譯
FROM node:22-alpine AS builder

WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm

# 複製 package.json、lock 檔案和 patches 目錄
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 複製源代碼
COPY . .

# 構建應用
RUN pnpm build

# 多階段構建：第二階段運行
FROM node:22-alpine

WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm

# 安裝 dumb-init（用於正確的信號處理）
RUN apk add --no-cache dumb-init

# 複製 package.json 和 patches 目錄
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# 只安裝生產依賴
RUN pnpm install --prod --frozen-lockfile

# 從構建階段複製構建產物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# 建立非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# 暴露端口
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 使用 dumb-init 作為 PID 1
ENTRYPOINT ["dumb-init", "--"]

# 啟動應用
CMD ["node", "dist/index.js"]
