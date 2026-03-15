import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateInsightContent } from "@/lib/services/insight-generator";
import { sendEmailNotification } from "@/lib/services/notifications/email";
import { sendTelegramMessage } from "@/lib/services/notifications/telegram";
import { clerkClient } from "@clerk/nextjs/server";

// Allow execution for up to 5 minutes (Pro plan max)
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Find all active subscriptions
        const subscriptions = await prisma.insightSubscription.findMany({
            where: { isActive: true },
            // In a real app we'd filter by due date based on Frequency
            // e.g. only run DAILY ones today if not run today
        });

        const results = [];

        // For MVP: Process sequentially to avoid rate limits
        for (const sub of subscriptions) {
            try {
                // Generate content using Tavily + Gemini
                const reportContent = await generateInsightContent(sub.topic, sub.persona);
                
                // Save to database
                const report = await prisma.insightReport.create({
                    data: {
                        subscriptionId: sub.id,
                        userId: sub.userId,
                        title: reportContent.title,
                        content: reportContent.content,
                        summary: reportContent.summary,
                    }
                });

                // 3. Dispatch Notifications
                const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                const reportUrl = `${domain}/dashboard/insights/${report.id}`;

                // Telegram Notification
                if (sub.telegramChatId) {
                    const tgMessage = `🔔 <b>[ProInsight] 새로운 투자 리포트 도착</b>\n\n<b>${report.title}</b>\n\n<i>${report.summary}</i>\n\n<a href="${reportUrl}">👉 전체 리포트 읽기</a>`;
                    await sendTelegramMessage(sub.telegramChatId, tgMessage);
                }

                // Email Notification
                if (sub.receiveEmail) {
                    try {
                        const client = await clerkClient();
                        const user = await client.users.getUser(sub.userId);
                        const userEmail = user.emailAddresses[0]?.emailAddress;
                        
                        if (userEmail) {
                            // Simple HTML Template for MVP
                            const htmlTemplate = `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                                    <h2 style="color: #333;">ProInsight AI Daily Briefing</h2>
                                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                                    <h3 style="color: #1a1a1a;">${report.title}</h3>
                                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                        <h4 style="margin-top: 0; color: #555;">Key Takeaways (3줄 요약)</h4>
                                        <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #444;">${report.summary}</p>
                                    </div>
                                    <a href="${reportUrl}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">전체 리포트 읽기 & AI 라디오 듣기</a>
                                    <p style="font-size: 12px; color: #999; margin-top: 30px;">본 메일은 구독 설정에 의해 자동 발송되었습니다. 대시보드에서 수신 설정을 변경할 수 있습니다.</p>
                                </div>
                            `;
                            await sendEmailNotification(userEmail, `[ProInsight] ${report.title}`, htmlTemplate);
                        }
                    } catch (clerkErr) {
                        console.error("Failed to fetch user email for notification:", clerkErr);
                    }
                }

                results.push({ subscriptionId: sub.id, status: "success", reportId: report.id });
            } catch (err: any) {
                console.error(`Error generating insight for sub ${sub.id}:`, err);
                results.push({ subscriptionId: sub.id, status: "failed", error: err.message });
            }
        }

        return NextResponse.json({
            message: "Insight generation completed",
            processed: subscriptions.length,
            results
        });

    } catch (error: any) {
        console.error("Cron Generate Insight Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
