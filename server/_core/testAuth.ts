/**
 * 本地測試認證模式
 * 用於本地開發時跳過 OAuth，直接使用測試用戶
 */
import { Request, Response, NextFunction } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import * as jose from "jose";

// 測試用戶列表
export const TEST_USERS = {
  user1: {
    id: 1,
    openId: "test-user-1",
    name: "測試用戶 1",
    email: "test1@example.com",
    role: "user" as const,
  },
  admin: {
    id: 2,
    openId: "test-admin",
    name: "測試管理員",
    email: "admin@example.com",
    role: "admin" as const,
  },
};

/**
 * ✅ 使用 jose 庫創建正確的 JWT token
 */
async function createTestToken(
  user: (typeof TEST_USERS)[keyof typeof TEST_USERS]
): Promise<string> {
  const secret = new TextEncoder().encode(ENV.JWT_SECRET || "test-secret-key");

  const token = await jose.SignJWT(new Object({
    openId: user.openId,
    name: user.name,
    email: user.email,
    role: user.role,
  }))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

/**
 * 本地測試認證中間件
 * 如果 ENABLE_TEST_AUTH=true，則跳過 OAuth，使用測試用戶
 */
export function testAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 只在開發環境且啟用測試模式時使用
  if (process.env.NODE_ENV !== "development" || !process.env.ENABLE_TEST_AUTH) {
    return next();
  }

  // 手動解析 cookies（不需要 cookie-parser 中間件）
  const cookieHeader = req.headers.cookie;
  const cookies: Record<string, string> = {};

  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [name, value] = cookie.split("=");
      if (name && value) {
        cookies[name.trim()] = decodeURIComponent(value.trim());
      }
    });
  }

  // 如果已有有效的 session cookie，跳過
  const existingCookie = cookies[COOKIE_NAME];
  if (existingCookie) {
    return next();
  }

  // 檢查是否有 test_user 查詢參數
  const testUser = (req.query.test_user as string) || "user1";
  const user = TEST_USERS[testUser as keyof typeof TEST_USERS];
  if (!user) {
    return next();
  }

  // 異步操作需要用 setImmediate 包裝
  setImmediate(async () => {
    try {
      const token = await createTestToken(user);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, cookieOptions);
      console.log(`[Test Auth] Logged in as: ${user.name} (${user.openId})`);
    } catch (error) {
      console.error("[Test Auth] Failed to create token:", error);
    }
  });

  next();
}

/**
 * 測試認證路由
 * 提供切換測試用戶的端點
 */
export function setupTestAuthRoutes(app: any) {
  if (process.env.NODE_ENV !== "development" || !process.env.ENABLE_TEST_AUTH) {
    return;
  }

  // 登入測試用戶
  app.get("/api/test-auth/login/:user", async (req: Request, res: Response) => {
    const testUser = req.params.user;
    const user = TEST_USERS[testUser as keyof typeof TEST_USERS];
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        available: Object.keys(TEST_USERS),
      });
    }

    try {
      const token = await createTestToken(user);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, cookieOptions);
      res.json({
        success: true,
        message: `Logged in as ${user.name}`,
        user,
      });
    } catch (error) {
      console.error("[Test Auth] Failed to create token:", error);
      res.status(500).json({ error: "Failed to create token" });
    }
  });

  // 登出
  app.get("/api/test-auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true, message: "Logged out" });
  });

  // 列出可用的測試用戶
  app.get("/api/test-auth/users", (req: Request, res: Response) => {
    res.json({
      available: Object.entries(TEST_USERS).map(([key, user]) => ({
        key,
        name: user.name,
        role: user.role,
        email: user.email,
      })),
      loginUrl: (userKey: string) => `/api/test-auth/login/${userKey}`,
    });
  });

  console.log("[Test Auth] Test authentication routes enabled");
  console.log("[Test Auth] Available users:", Object.keys(TEST_USERS));
  console.log("[Test Auth] Login: /api/test-auth/login/{user}");
  console.log("[Test Auth] Logout: /api/test-auth/logout");
  console.log("[Test Auth] Users: /api/test-auth/users");
}
