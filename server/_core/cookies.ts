import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // ✅ 在本地開發環境中使用更寬鬆的 cookie 設置
  const isLocalhost = LOCAL_HOSTS.has(req.hostname);
  const isDevelopment = process.env.NODE_ENV === "development";

  // 如果是本地開發，使用較寬鬆的設置
  if (isDevelopment && isLocalhost) {
    return {
      httpOnly: true,
      path: "/",
      sameSite: "lax",  // ✅ 改為 "lax" 而不是 "none"
      secure: false,     // ✅ 本地開發允許 insecure cookie
    };
  }

  // 生產環境使用更嚴格的設置
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),  // ✅ 必須是 HTTPS
  };
}
