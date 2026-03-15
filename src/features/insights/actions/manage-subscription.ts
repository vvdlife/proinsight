"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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
