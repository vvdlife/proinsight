import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateInsightContent } from "@/lib/services/insight-generator";
import { sendEmailNotification } from "@/lib/services/notifications/email";
import { sendTelegramMessage, escapeTelegramHtml } from "@/lib/services/notifications/telegram";
import { clerkClient } from "@clerk/nextjs/server";

// Allow execution for up to 5 minutes (Pro plan max)
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset);
        const currentHourKST = kstDate.getUTCHours();
        const currentDayOfWeekKST = kstDate.getUTCDay(); // 0: Sun, 1: Mon, ...
        const currentDayOfMonthKST = kstDate.getUTCDate();

        const DAYS_MAP = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const currentDayStrKST = DAYS_MAP[currentDayOfWeekKST];

        console.log(`[CronScheduler] Running scheduler at KST Time: ${kstDate.toUTCString().replace("GMT", "KST")}, Hour: ${currentHourKST}, DayOfWeek: ${currentDayStrKST}, DayOfMonth: ${currentDayOfMonthKST}`);

        // Find all active subscriptions
        const allActiveSubscriptions = await prisma.insightSubscription.findMany({
            where: { isActive: true },
        });

        const subscriptions = allActiveSubscriptions.filter(sub => {
            // 1. Check Hour
            if (sub.preferredTime !== currentHourKST) {
                return false;
            }

            // 2. Check duplicate generation (same day safeguard)
            if (sub.lastGeneratedAt) {
                const lastGenKST = new Date(sub.lastGeneratedAt.getTime() + kstOffset);
                // If last generated is today (same year, month, date) in KST, skip it!
                if (
                    lastGenKST.getUTCFullYear() === kstDate.getUTCFullYear() &&
                    lastGenKST.getUTCMonth() === kstDate.getUTCMonth() &&
                    lastGenKST.getUTCDate() === kstDate.getUTCDate()
                ) {
                    console.log(`[CronScheduler] Skipping sub ${sub.id} (already generated today: ${lastGenKST.toUTCString()})`);
                    return false;
                }
            }

            // 3. Check Frequency specific schedules
            if (sub.frequency === "DAILY") {
                return true;
            }

            if (sub.frequency === "WEEKLY") {
                if (!sub.preferredDays) return false;
                const preferredDaysList = sub.preferredDays.split(",");
                return preferredDaysList.includes(currentDayStrKST);
            }

            if (sub.frequency === "MONTHLY") {
                // If preferredDayOfMonth matches today
                if (sub.preferredDayOfMonth === currentDayOfMonthKST) {
                    return true;
                }
                // If today is the last day of the month and preferredDayOfMonth is greater than today (e.g. preferred 31st but it's Feb 28th/29th)
                const nextDayKST = new Date(kstDate.getTime() + 24 * 60 * 60 * 1000);
                const isLastDayOfMonth = nextDayKST.getUTCMonth() !== kstDate.getUTCMonth();
                if (isLastDayOfMonth && sub.preferredDayOfMonth && sub.preferredDayOfMonth > currentDayOfMonthKST) {
                    return true;
                }
                return false;
            }

            return false;
        });

        console.log(`[CronScheduler] Found ${subscriptions.length} subscriptions due for processing.`);

        const results = [];

        // For MVP: Process sequentially to avoid rate limits
        for (const sub of subscriptions) {
            try {
                // Generate content using Tavily + Gemini
                const reportContent = await generateInsightContent(sub.userId, sub.topic, sub.persona);
                
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

                // Update lastGeneratedAt
                await prisma.insightSubscription.update({
                    where: { id: sub.id },
                    data: { lastGeneratedAt: new Date() }
                });

                // 3. Dispatch Notifications
                const domain = process.env.NEXT_PUBLIC_APP_URL 
                    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
                const reportUrl = `${domain}/dashboard/insights/${report.id}`;
                const downloadUrl = `${domain}/api/insights/${report.id}/download`;

                // Telegram Notification
                if (sub.telegramChatId) {
                    const safeTitle = escapeTelegramHtml(report.title);
                    const safeSummary = escapeTelegramHtml(report.summary || "");
                    const tgMessage = `🔔 <b>[ProInsight] 새로운 투자 리포트 도착</b>\n\n<b>${safeTitle}</b>\n\n<i>${safeSummary}</i>\n\n🖥️ <a href="${reportUrl}">웹 대시보드에서 읽기</a>\n📥 <a href="${downloadUrl}">마크다운(.md) 파일 다운로드</a>`;
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
                                    <div style="margin-top: 30px; text-align: center;">
                                        <a href="${reportUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 15px; margin-right: 10px;">🖥️ 웹 대시보드에서 읽기</a>
                                        <a href="${downloadUrl}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 15px;">📥 마크다운 파일 다운로드</a>
                                    </div>
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
