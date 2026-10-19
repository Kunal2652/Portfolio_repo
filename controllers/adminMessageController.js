
import "dotenv/config";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import ContactMessage from "../models/ContactMessage.js";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { adminReplyTemplate } from "../templates/adminReplyTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.resolve(__dirname, "../images/logo.png");

const PAGE_SIZE_MAX = 100;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

function validId(id) {
    return mongoose.isValidObjectId(id);
}

// GET /api/admin/messages
export async function listAdminMessages(req, res) {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            PAGE_SIZE_MAX,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim().slice(0, 150)
                : "";

        const filter = ["all", "unread", "replied"].includes(req.query.filter)
            ? req.query.filter
            : "all";

        const query = {};

        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "i");

            query.$or = [
                { name: regex },
                { email: regex },
                { subject: regex },
                { message: regex },
            ];
        }

        if (filter === "unread") {
            query.read = { $ne: true };
        }

        if (filter === "replied") {
            query["replies.0"] = { $exists: true };
        }

        const [messages, total, unreadTotal, repliedTotal] = await Promise.all([
            ContactMessage.find(query)
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select("name email subject message read replies createdAt autoReplySent")
                .lean(),

            ContactMessage.countDocuments(query),
            ContactMessage.countDocuments({ read: { $ne: true } }),
            ContactMessage.countDocuments({ "replies.0": { $exists: true } }),
        ]);

        return res.status(200).json({
            success: true,
            data: messages,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.max(1, Math.ceil(total / limit)),
                unreadTotal,
                repliedTotal,
            },
        });
    } catch (error) {
        console.error("Admin message listing failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to load messages.",
        });
    }
}

// GET /api/admin/messages/:id
export async function getAdminMessage(req, res) {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID.",
            });
        }

        const message = await ContactMessage.findById(req.params.id).lean();

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found.",
            });
        }

        return res.status(200).json({ success: true, data: message });
    } catch (error) {
        console.error("Admin message detail failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to load this message.",
        });
    }
}

// PATCH /api/admin/messages/:id/read
export async function markAdminMessageRead(req, res) {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID.",
            });
        }

        const message = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { $set: { read: true } },
            { new: true }
        ).select("_id read");

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error("Mark message read failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update message status.",
        });
    }
}

// POST /api/admin/messages/:id/reply
export async function replyToAdminMessage(req, res) {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID.",
            });
        }

        const { subject, message: replyBody } = req.body ?? {};

        if (
            typeof subject !== "string" ||
            typeof replyBody !== "string" ||
            !subject.trim() ||
            !replyBody.trim() ||
            subject.trim().length > 180 ||
            replyBody.trim().length > 10000
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide a subject and a reply of up to 10,000 characters.",
            });
        }

        const emailUser = process.env.EMAIL_USER?.trim();
        const emailPassword = process.env.EMAIL_APP_PASSWORD?.trim();

        if (!emailUser || !emailPassword) {
            return res.status(503).json({
                success: false,
                message: "Email sending is not configured on the server.",
            });
        }

        const contact = await ContactMessage.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Message not found.",
            });
        }

        const recipient = contact.email?.trim();

        if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
            return res.status(422).json({
                success: false,
                message: "The saved sender email address is invalid.",
            });
        }

        // Send to the original sender saved in the database.

        await transporter.sendMail({
            from: `"Kunal | Portfolio" <${emailUser}>`,
            to: recipient,
            replyTo: process.env.CONTACT_RECEIVER || emailUser,
            subject: subject.trim(),

            // Plain-text fallback for email clients.
            text: `Hello ${contact.name || "there"},\n\n${replyBody.trim()}\n\nBest regards,\nKunal`,

            // Styled HTML email.
            html: adminReplyTemplate({
                name: contact.name,
                subject: subject.trim(),
                message: replyBody.trim(),
            }),

            // Embed the local logo directly in the email.
            attachments: [
                {
                    filename: "logo.png",
                    path: logoPath,
                    cid: "portfolio-logo",
                    contentDisposition: "inline",
                },
            ],
        });

        // Record the reply after Nodemailer accepts it.
        contact.replies.push({
            subject: subject.trim(),
            message: replyBody.trim(),
            status: "sent",
            sentAt: new Date(),
        });

        contact.read = true;
        await contact.save();

        return res.status(200).json({
            success: true,
            message: "Reply accepted by the email server.",
            data: {
                id: contact._id,
                replyCount: contact.replies.length,
            },
        });
    } catch (error) {
        console.error("Admin reply failed:", error.message);

        return res.status(502).json({
            success: false,
            message: "The reply could not be sent. Please try again.",
        });
    }
}
