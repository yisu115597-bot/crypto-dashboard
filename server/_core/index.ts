import "dotenv/config";
import * as dotenv from "dotenv";
import path from "path";
// Load .env.local if it exists
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { testAuthMiddleware, setupTestAuthRoutes } from "./testAuth";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 🔍 調試：打印環境變量
  console.log("[DEBUG] NODE_ENV:", process.env.NODE_ENV);
  console.log("[DEBUG] ENABLE_TEST_AUTH:", process.env.ENABLE_TEST_AUTH);

  // ✅ 必須先設置 cookie 解析
  app.use(cookieParser());

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 本地測試認證中間件（開發模式）
  if (process.env.NODE_ENV === "development" && process.env.ENABLE_TEST_AUTH) {
    console.log("[✅ DEBUG] Test auth condition is TRUE - registering routes");
    app.use(testAuthMiddleware);
    console.log("[Test Auth] Test authentication mode enabled");
    console.log("[Test Auth] Visit http://localhost:3000/api/test-auth/login/user1 to login");
  } else {
    console.log("[❌ DEBUG] Test auth condition is FALSE");
    console.log("[DEBUG] NODE_ENV === 'development':", process.env.NODE_ENV === "development");
    console.log("[DEBUG] ENABLE_TEST_AUTH:", process.env.ENABLE_TEST_AUTH);
  }

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ✅ 修復：在 tRPC 之前註冊測試認證路由
  if (process.env.NODE_ENV === "development" && process.env.ENABLE_TEST_AUTH) {
    console.log("[✅ DEBUG] Registering test auth routes BEFORE Vite setup");
    setupTestAuthRoutes(app);
    console.log("[Test Auth] Test routes registered");
  }

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(
      `Port ${preferredPort} is busy, using port ${port} instead`
    );
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
