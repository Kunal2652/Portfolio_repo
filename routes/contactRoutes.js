
import { Router } from "express";
import {
  submitContactMessage,
  getContactMessages,
} from "../controllers/contactController.js";

const router = Router();

// Public: portfolio visitors can submit messages.
router.post("/", submitContactMessage);

// Private: messages must never be publicly readable.
router.get("/messages", (req, res, next) => {
  const expectedKey = process.env.ADMIN_API_KEY;
  const suppliedKey = req.get("x-admin-api-key");

  if (
    !expectedKey ||
    !suppliedKey ||
    suppliedKey.length !== expectedKey.length ||
    !safeCompare(suppliedKey, expectedKey)
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }

  next();
}, getContactMessages);

function safeCompare(a, b) {
  // Timing-safe comparison for equal-length strings.
  return cryptoTimingSafeEqual(a, b);
}

import { timingSafeEqual } from "node:crypto";

function cryptoTimingSafeEqual(a, b) {
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export default router;
