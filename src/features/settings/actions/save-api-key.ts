// Path: src/features/settings/actions/save-api-key.ts
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type SaveApiKeyResult = {
    success: boolean;
    message?: string;
};

export async function saveApiKey(apiKey: string): Promise<SaveApiKeyResult> {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        await prisma.userSettings.upsert({
            where: { userId },
            update: { apiKey },
            create: { userId, apiKey },
        });

        revalidatePath("/dashboard/settings");
        return { success: true, message: "API Key가 안전하게 저장되었습니다." };
    } catch (error) {
        console.error("Save API Key Error:", error);
        return { success: false, message: "API Key 저장 중 오류가 발생했습니다." };
    }
}
