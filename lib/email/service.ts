import { Resend } from 'resend';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY not configured. Email not sent.');
            return { success: false, error: 'Email service not configured' };
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = options.from || process.env.FROM_EMAIL || 'notifications@yourdomain.com';

        await resend.emails.send({
            from: fromEmail,
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            html: options.html,
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to send email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Send a notification email to a user
 */
export async function sendNotificationEmail(
    to: string,
    title: string,
    message: string,
    options?: {
        priority?: string;
        actionUrl?: string;
        actionText?: string;
    }
): Promise<{ success: boolean; error?: string }> {
    const html = generateNotificationEmailHTML(title, message, options);

    return sendEmail({
        to,
        subject: title,
        html,
    });
}

/**
 * Generate HTML for notification email
 */
function generateNotificationEmailHTML(
    title: string,
    message: string,
    options?: {
        priority?: string;
        actionUrl?: string;
        actionText?: string;
    }
): string {
    const priorityColors = {
        URGENT: '#dc2626',
        HIGH: '#ea580c',
        NORMAL: '#6366f1',
        LOW: '#64748b',
    };

    const color = priorityColors[options?.priority as keyof typeof priorityColors] || priorityColors.NORMAL;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                ${title}
                            </h1>
                            ${options?.priority ? `
                            <div style="margin-top: 12px;">
                                <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                    ${options.priority} Priority
                                </span>
                            </div>
                            ` : ''}
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <div style="color: #334155; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
                                ${message}
                            </div>
                            
                            ${options?.actionUrl && options?.actionText ? `
                            <div style="margin-top: 32px; text-align: center;">
                                <a href="${options.actionUrl}" style="display: inline-block; background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                    ${options.actionText}
                                </a>
                            </div>
                            ` : ''}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                                ✨ Sent from the Admin Team
                            </p>
                            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
                                You're receiving this because you're enrolled in the MSA Grad program.
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
                <!-- Unsubscribe link -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin-top: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 0 20px;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                Don't want to receive these emails? 
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'}/student/settings" style="color: #6366f1; text-decoration: none;">
                                    Update your preferences
                                </a>
                            </p>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
