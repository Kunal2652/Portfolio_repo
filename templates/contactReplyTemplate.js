
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.resolve(__dirname, "../images/logo.png");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

export function contactReplyTemplate({ name, subject }) {
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);

  return {
    subject: "✨ Thank You for Reaching Out!",

    text: `👋 Hi ${name},

🙏 Thank you for reaching out through my portfolio!

📩 I've received your message regarding "${subject}" and appreciate you taking the time to connect.

⏳ I'll review your message and get back to you as soon as possible.

Thanks again for connecting!

Best regards,
💚 Kunal
🌐 Portfolio: https://kunal2652.github.io/portfolio/`,

    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Thank You for Reaching Out</title>
        </head>

        <body style="margin:0;padding:0;background-color:#0b0d0f;font-family:Arial,Helvetica,sans-serif;color:#f3f4f6;">
          <div style="padding:32px 12px;">
            <div style="max-width:600px;margin:0 auto;background-color:#111416;border:1px solid #252b28;border-radius:18px;overflow:hidden;">

              <!-- Header with logo at top-right -->
              <div style="padding:22px 26px;border-bottom:1px solid #252b28;text-align:right;">
                <img
                  src="cid:portfolioLogo"
                  alt="Kunal Logo"
                  width="58"
                  height="58"
                  style="display:inline-block;width:58px;height:58px;object-fit:contain;border-radius:50%;"
                />
              </div>

              <!-- Email content -->
              <div style="padding:32px 26px;">
                <p style="margin:0 0 12px;color:#86efac;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                  ✨ Thanks for connecting
                </p>

                <h1 style="margin:0 0 24px;font-size:28px;line-height:1.3;color:#ffffff;">
                  Thank you for reaching out! 💚
                </h1>

                <p style="font-size:16px;line-height:1.8;color:#e5e7eb;">
                  👋 Hi ${safeName},
                </p>

                <p style="font-size:15px;line-height:1.8;color:#d1d5db;">
                  🙏 Thank you for contacting me through my portfolio. I appreciate you taking the time to connect!
                </p>

                <div style="margin:24px 0;padding:18px;background-color:#0b0d0f;border-left:3px solid #86efac;border-radius:8px;">
                  <p style="margin:0 0 8px;font-size:12px;color:#86efac;text-transform:uppercase;letter-spacing:1px;">
                    📩 Your message topic
                  </p>
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#ffffff;font-weight:bold;">
                    ${safeSubject}
                  </p>
                </div>

                <p style="font-size:15px;line-height:1.8;color:#d1d5db;">
                  ⏳ I've received your message and will review it carefully. I'll get back to you as soon as possible.
                </p>

                <p style="font-size:15px;line-height:1.8;color:#d1d5db;">
                  Thanks again for reaching out. Looking forward to connecting with you! 🤝
                </p>

                <div style="margin-top:30px;padding-top:22px;border-top:1px solid #252b28;">
                  <p style="margin:0;font-size:15px;line-height:1.8;color:#d1d5db;">
                    Best regards,<br />
                    <strong style="font-size:19px;color:#86efac;">Kunal 💚</strong><br />
                    <span style="font-size:13px;color:#9ca3af;">Full-Stack Developer | Researcher</span>
                  </p>

                  <p style="margin:18px 0 0;">
                    <a
                      href="https://kunal2652.github.io/portfolio/"
                      style="display:inline-block;padding:12px 18px;background-color:#86efac;color:#0b0d0f;text-decoration:none;font-size:13px;font-weight:bold;border-radius:8px;"
                    >
                      🌐 Visit My Portfolio
                    </a>
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="padding:18px 26px;background-color:#0b0d0f;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;">
                  This is an automatic acknowledgement of your message.<br />
                  © ${new Date().getFullYear()} Kunal. Thank you for connecting! ✨
                </p>
              </div>

            </div>
          </div>
        </body>
      </html>
    `,

    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "portfolioLogo",
        contentDisposition: "inline",
      },
    ],
  };
}
