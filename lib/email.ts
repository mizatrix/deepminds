import nodemailer from 'nodemailer';

function getTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        return null;
    }
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
}

export async function sendWelcomeEmail(toEmail: string) {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            console.warn('SMTP not configured — skipping welcome email for', toEmail);
            return;
        }

        const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:40px 32px;text-align:center;">
                                <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px 0;font-weight:800;">🎓 CS Excellence Portal</h1>
                                <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">MSA University — Faculty of Computer Science</p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px 32px;">
                                <h2 style="color:#1e293b;font-size:22px;margin:0 0 16px 0;font-weight:700;">Welcome to our Newsletter! 🎉</h2>
                                <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px 0;">
                                    Thank you for subscribing! You're now part of the CS Excellence community. Here's what you can expect:
                                </p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                                    <tr>
                                        <td style="padding:12px 16px;background-color:#f1f5f9;border-radius:12px;margin-bottom:8px;">
                                            <p style="color:#334155;font-size:14px;margin:0;line-height:1.6;">
                                                ✨ <strong>Latest News</strong> — Stay updated with department announcements<br>
                                                🏆 <strong>Student Achievements</strong> — Celebrate outstanding accomplishments<br>
                                                📅 <strong>Upcoming Events</strong> — Workshops, competitions &amp; more<br>
                                                💡 <strong>Opportunities</strong> — Internships, research, and career openings
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px 0;">
                                    We're excited to have you on board. Our latest news and updates will reach your inbox soon!
                                </p>
                                <!-- CTA Button -->
                                <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                    <tr>
                                        <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:12px;padding:14px 32px;">
                                            <a href="https://csexcellence.msa.edu.eg" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                                                Visit CS Excellence Portal →
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;text-align:center;">
                                <p style="color:#94a3b8;font-size:12px;margin:0 0 4px 0;">
                                    CS Excellence Portal — MSA University
                                </p>
                                <p style="color:#cbd5e1;font-size:11px;margin:0;">
                                    You received this email because you subscribed to our newsletter.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
        `;

        await transporter.sendMail({
            from: '"CS Excellence Portal" <csexcellence@msa.edu.eg>',
            to: toEmail,
            subject: 'Welcome to CS Excellence Newsletter! 🎓',
            html,
        });

        console.log('Welcome email sent to', toEmail);
    } catch (error) {
        // Never let email failures crash the app
        console.error('Failed to send welcome email to', toEmail, '—', error);
    }
}

