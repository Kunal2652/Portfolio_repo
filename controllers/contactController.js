
import nodemailer from "nodemailer";
import { timingSafeEqual } from "node:crypto";
import ContactMessage from "../models/ContactMessage.js";
import { contactReplyTemplate } from "../templates/contactReplyTemplate.js";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 5000;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const user = process.env.EMAIL_USER?.trim();
const password = process.env.EMAIL_APP_PASSWORD?.trim();

if (!user || !password) {
  throw new Error(
    "Missing EMAIL_USER or EMAIL_APP_PASSWORD. Check your .env loading."
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user,
    pass: password,
  },
});


function isValidEmail(email) {
  return (
    email.length <= MAX_EMAIL_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function safeCompareKeys(providedKey, expectedKey) {
  if (
    typeof providedKey !== "string" ||
    typeof expectedKey !== "string"
  ) {
    return false;
  }

  const provided = Buffer.from(providedKey, "utf8");
  const expected = Buffer.from(expectedKey, "utf8");

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

// PUBLIC: Submit a contact message.
export async function submitContactMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (
      !cleanName ||
      cleanName.length > MAX_NAME_LENGTH ||
      !isValidEmail(cleanEmail) ||
      !cleanSubject ||
      cleanSubject.length > MAX_SUBJECT_LENGTH ||
      cleanMessage.length < 10 ||
      cleanMessage.length > MAX_MESSAGE_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: "Please check your submitted details.",
      });
    }

    // 1. Save the message first.
    const savedMessage = await ContactMessage.create({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      autoReplySent: false,
      read: false,
    });

    // 2. Send the automatic reply.
    try {
      if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_APP_PASSWORD
      ) {
        throw new Error("Email credentials are not configured.");
      }

      const emailTemplate = contactReplyTemplate({
        name: cleanName,
        subject: cleanSubject,
      });

      await transporter.sendMail({
        from: `"Kunal | Portfolio" <${process.env.EMAIL_USER}>`,
        to: cleanEmail,
        replyTo:
          process.env.CONTACT_RECEIVER || process.env.EMAIL_USER,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        ...(emailTemplate.html
          ? { html: emailTemplate.html }
          : {}),
        ...(emailTemplate.attachments
          ? { attachments: emailTemplate.attachments }
          : {}),
      });
console.log("SMTP auth check:", {
  userConfigured: Boolean(process.env.EMAIL_USER?.trim()),
  passwordConfigured: Boolean(
    process.env.EMAIL_APP_PASSWORD?.trim()
  ),
  transporterUserConfigured: Boolean(
    transporter.options.auth?.user
  ),
  transporterPasswordConfigured: Boolean(
    transporter.options.auth?.pass
  ),
});
      // 3. Update the database after the email is accepted.
      await ContactMessage.updateOne(
        { _id: savedMessage._id },
        { $set: { autoReplySent: true } }
      );

      savedMessage.autoReplySent = true;
    } catch (emailError) {
      // Preserve the saved message if email delivery fails.
      console.error(
        "Thank-you email failed:",
        emailError.message
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Thank you! Your message has been received. I'll get back to you soon.",
      data: {
        id: savedMessage._id,
        autoReplySent: savedMessage.autoReplySent,
      },
    });
  } catch (error) {
    console.error(
      "Contact submission failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit your message right now. Please try again.",
    });
  }
}

// PRIVATE: Fetch saved messages with pagination.
export async function getContactMessages(req, res) {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(
        1,
        Number.parseInt(req.query.limit, 10) ||
          DEFAULT_PAGE_SIZE
      )
    );

    const [messages, total] = await Promise.all([
      ContactMessage.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-__v")
        .lean(),

      ContactMessage.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Fetching contact messages failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch messages.",
    });
  }
}

// Middleware: Protect the private messages API.
export function requireAdminApiKey(req, res, next) {
  const expectedKey = process.env.ADMIN_API_KEY;
  const providedKey = req.get("x-admin-api-key");

  if (
    !expectedKey ||
    !providedKey ||
    !safeCompareKeys(providedKey, expectedKey)
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }

  next();
}
