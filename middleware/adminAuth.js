
import jwt from "jsonwebtoken";

export const ADMIN_COOKIE = "portfolio_admin";

export function requireAdmin(req, res, next) {
  const token = req.cookies?.[ADMIN_COOKIE];

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to continue.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "portfolio-admin",
      audience: "portfolio-inbox",
    });

    if (payload.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    req.admin = { email: payload.email, role: payload.role };
    next();
  } catch {
    res.clearCookie(ADMIN_COOKIE, cookieOptions());
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please sign in again.",
    });
  }
}

export function cookieOptions() {
  const sameSite = process.env.COOKIE_SAME_SITE || "lax";

  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite,
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  };
}
