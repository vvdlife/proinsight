import nodemailer from "nodemailer";

export async function sendEmailNotification(to: string, subject: string, htmlContent: string) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials are not configured. Email will not be sent.");
        return { success: false, error: "SMTP not configured" };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true", // Use true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"ProInsight AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            html: htmlContent,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: unknown) {
        console.error("Email Sending Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
