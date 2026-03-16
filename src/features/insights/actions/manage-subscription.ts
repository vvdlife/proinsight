"use server";

import { prisma } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Import services for manual trigger
import { generateInsightContent } from "@/lib/services/insight-generator";
import { sendEmailNotification } from "@/lib/services/notifications/email";
import { sendTelegramMessage } from "@/lib/services/notifications/telegram";

export async function createSubscription(formData: FormData) {

    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const topic = formData.get("topic") as string;
    const frequency = formData.get("frequency") as string;
    const persona = formData.get("persona") as string;
    const receiveEmail = formData.get("receiveEmail") === "on";
    const telegramChatId = formData.get("telegramChatId") as string | null;

    if (!topic || !frequency || !persona) {
        throw new Error("Missing required fields");
    }

    // Upsert to ensure only one subscription per user for MVP
    // For multiple subscriptions, we'd use create
    await prisma.insightSubscription.upsert({
        where: { userId },
        update: {
            topic,
            frequency,
            persona,
            receiveEmail,
            telegramChatId,
            isActive: true,
        },
        create: {
            userId,
            topic,
            frequency,
            persona,
            receiveEmail,
            telegramChatId,
            isActive: true, // Will start generating immediately at next cron cycle
        },
    });

    revalidatePath("/dashboard/insights");
    return { success: true };
}

export async function toggleSubscription(isActive: boolean) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    await prisma.insightSubscription.update({
        where: { userId },
        data: { isActive },
    });

    revalidatePath("/dashboard/insights");
    return { success: true };
}

export async function triggerInsightGeneration() {
    "use server";
    
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const sub = await prisma.insightSubscription.findUnique({
        where: { userId }
    });

    if (!sub || !sub.isActive) {
        throw new Error("활성화된 구독이 없습니다.");
    }

    try {
        // 1. Generate Content
        const reportContent = await generateInsightContent(sub.userId, sub.topic, sub.persona);
        
        // 2. Save
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

        if (sub.telegramChatId) {
            const tgMessage = `🔔 <b>[ProInsight] 수동 테스트 리포트 도착</b>\n\n<b>${report.title}</b>\n\n<i>${report.summary}</i>\n\n<a href="${reportUrl}">👉 전체 리포트 읽기</a>`;
            await sendTelegramMessage(sub.telegramChatId, tgMessage);
        }

        if (sub.receiveEmail) {
            try {
                const client = await clerkClient();
                const user = await client.users.getUser(sub.userId);
                const userEmail = user.emailAddresses[0]?.emailAddress;
                
                if (userEmail) {
                    const htmlTemplate = `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                            <h2 style="color: #333;">ProInsight AI Manual Test Briefing</h2>
                            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                            <h3 style="color: #1a1a1a;">${report.title}</h3>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <h4 style="margin-top: 0; color: #555;">Key Takeaways (3줄 요약)</h4>
                                <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #444;">${report.summary}</p>
                            </div>
                            <a href="${reportUrl}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">전체 리포트 읽기 & AI 라디오 듣기</a>
                        </div>
                    `;
                    await sendEmailNotification(userEmail, `[ProInsight TEST] ${report.title}`, htmlTemplate);
                }
            } catch (clerkErr) {
                console.error("Failed to fetch user email for notification:", clerkErr);
            }
        }

        revalidatePath("/dashboard/insights");
        return { success: true, message: "리포트 생성 및 알림 발송 완료!" };

    } catch (error: any) {
        console.error("Manual Trigger Error:", error);
        return { success: false, error: error.message || "리포트 생성 중 오류가 발생했습니다." };
    }
}
