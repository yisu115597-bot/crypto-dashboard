-- MySQL 初始化腳本
-- 此腳本在 MySQL 容器首次啟動時自動執行

-- 設定時區
SET GLOBAL time_zone = '+08:00';

-- 建立資料庫（如果不存在）
CREATE DATABASE IF NOT EXISTS crypto_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用資料庫
USE crypto_dashboard;

-- 建立用戶（如果不存在）
-- 注意：用戶已在 docker-compose.yml 中通過環境變數建立

-- 授予權限
GRANT ALL PRIVILEGES ON crypto_dashboard.* TO 'crypto_user'@'%';
FLUSH PRIVILEGES;

-- 建立基本表結構（由 Drizzle 遷移處理，此處僅作備份）
-- 實際表結構由應用的 pnpm db:push 命令建立
