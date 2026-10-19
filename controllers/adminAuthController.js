
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  ADMIN_COOKIE,
  cookieOptions,
} from "../middleware/adminAuth.js";

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      password.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email and password.",
      });
    }

    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!configuredEmail || !passwordHash || !jwtSecret) {
      console.error("Admin authentication environment is incomplete.");

      return res.status(503).json({
        success: false,
        message: "Admin authentication is not configured.",
      });
    }

    const emailMatches =
      email.trim().toLowerCase() === configuredEmail;

    // Verify against a valid bcrypt hash even for a wrong email.
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        email: configuredEmail,
        role: "admin",
      },
      jwtSecret,
      {
        algorithm: "HS256",
        expiresIn: "8h",
        issuer: "portfolio-admin",
        audience: "portfolio-inbox",
      }
    );

    res.cookie(ADMIN_COOKIE, token, cookieOptions());

    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: { email: configuredEmail },
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to sign in right now.",
    });
  }
}

export function adminSession(req, res) {
  return res.status(200).json({
    success: true,
    data: { email: req.admin.email },
  });
}

export function adminLogout(req, res) {
  res.clearCookie(ADMIN_COOKIE, {
    ...cookieOptions(),
    maxAge: undefined,
  });

  return res.status(200).json({
    success: true,
    message: "Signed out successfully.",
  });
}
