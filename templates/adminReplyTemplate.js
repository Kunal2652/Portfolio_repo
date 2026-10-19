
function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function adminReplyTemplate({ name, subject, message }) {
    const safeName = escapeHtml(name || "there");
    const safeSubject = escapeHtml(subject || "Response to your inquiry");

    // Preserve line breaks while escaping all user-provided HTML.
    const safeMessage = escapeHtml(message || "")
        .replace(/\r\n|\r|\n/g, "<br>");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:#090d0b;font-family:Arial,Helvetica,sans-serif;color:#e5e7eb;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background-color:#090d0b;padding:32px 12px;">
        <tr>
            <td align="center">

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                    style="max-width:640px;background-color:#111713;border:1px solid #26352b;border-radius:16px;overflow:hidden;">

                    <!-- Green accent -->
                    <tr>
                        <td style="height:4px;background-color:#4ade80;font-size:0;line-height:0;">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding:32px 30px 24px;">
                            <p style="margin:0 0 12px;color:#4ade80;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">
                                PORTFOLIO · COMMUNICATIONS
                            </p>

                            <h1 style="margin:0;color:#f9fafb;font-size:27px;line-height:1.35;font-weight:700;">
                                Thank you for reaching out.
                            </h1>

                            <p style="margin:12px 0 0;color:#9ca3af;font-size:14px;line-height:1.8;">
                                A personal response to your message.
                            </p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding:0 30px;">
                            <div style="height:1px;background-color:#29352d;"></div>
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td style="padding:28px 30px 32px;">
                            <p style="margin:0 0 18px;color:#f3f4f6;font-size:16px;line-height:1.7;">
                                Hello ${safeName},
                            </p>

                            <p style="margin:0 0 22px;color:#d1d5db;font-size:14px;line-height:1.9;">
                                Thank you for getting in touch. I've reviewed your inquiry and wanted to get back to you.
                            </p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                                style="background-color:#0c120e;border:1px solid #293b2e;border-radius:10px;">
                                <tr>
                                    <td style="padding:20px 22px;">
                                        <p style="margin:0 0 12px;color:#4ade80;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                                            MY RESPONSE
                                        </p>

                                        <p style="margin:0 0 16px;color:#f9fafb;font-size:15px;font-weight:bold;line-height:1.6;">
                                            ${safeSubject}
                                        </p>

                                        <div style="color:#d1d5db;font-size:14px;line-height:1.9;overflow-wrap:anywhere;">
                                            ${safeMessage}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:26px 0 0;color:#d1d5db;font-size:14px;line-height:1.9;">
                                If you have any further questions or would like to discuss this in more detail, feel free to reply to this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer / Signature -->
                    <tr>
                        <td style="padding:24px 30px;background-color:#0c110e;border-top:1px solid #26352b;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <!-- Signature on left -->
                                    <td valign="bottom" style="padding-right:14px;">
                                        <p style="margin:0 0 5px;color:#9ca3af;font-size:12px;">
                                            Best regards,
                                        </p>

                                        <p style="margin:0;color:#f9fafb;font-size:17px;font-weight:bold;line-height:1.5;">
                                            Kunal
                                        </p>

                                        <p style="margin:3px 0 0;color:#4ade80;font-size:12px;line-height:1.6;">
                                            Portfolio &amp; Development
                                        </p>

                                        <p style="margin:10px 0 0;color:#9ca3af;font-size:11px;line-height:1.7;">
                                            Thank you for your time and interest.
                                        </p>
                                    </td>

                                    <!-- Logo on right -->
                                    <td width="100" align="right" valign="bottom">
                                        <img
                                            src="cid:portfolio-logo"
                                            alt="Kunal Portfolio"
                                            width="82"
                                            style="display:block;width:82px;max-width:100%;height:auto;max-height:82px;object-fit:contain;border:0;"
                                        >
                                    </td>
                                </tr>
                            </table>

                            <div style="height:1px;background-color:#26352b;margin:22px 0 14px;"></div>

                            <p style="margin:0;color:#6b7280;font-size:11px;line-height:1.8;text-align:center;">
                                This email was sent in response to your portfolio inquiry.
                            </p>

                            <p style="margin:5px 0 0;color:#4b5563;font-size:10px;text-align:center;">
                                © ${new Date().getFullYear()} Kunal. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

                <p style="max-width:580px;margin:18px auto 0;color:#6b7280;font-size:11px;line-height:1.7;text-align:center;">
                    This is a personal communication from Kunal's portfolio.
                </p>

            </td>
        </tr>
    </table>
</body>
</html>`;
}
