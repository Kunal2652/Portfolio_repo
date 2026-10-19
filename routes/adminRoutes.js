
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  adminLogout,
  adminSession,
} from "../controllers/adminAuthController.js";
import {
  getAdminMessage,
  listAdminMessages,
  markAdminMessageRead,
  replyToAdminMessage,
} from "../controllers/adminMessageController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});

// Public only for signing in; the controller still validates credentials.
router.post("/login", loginLimiter, adminLogin);

// Session and logout require a valid admin cookie.
router.get("/session", requireAdmin, adminSession);
router.post("/logout", requireAdmin, adminLogout);

// All inbox routes require admin authentication.
router.get("/messages", requireAdmin, listAdminMessages);
router.get("/messages/:id", requireAdmin, getAdminMessage);
router.patch("/messages/:id/read", requireAdmin, markAdminMessageRead);
router.post("/messages/:id/reply", requireAdmin, replyToAdminMessage);

export default router;
