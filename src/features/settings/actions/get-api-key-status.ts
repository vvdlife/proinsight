// Path: src/features/settings/actions/get-api-key-status.ts
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getApiKeyStatus() {
    const { userId } = await auth();
    if (!userId) return { gemini: false, openai: false };

    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true, openaiApiKey: true },
    });

    return {
        gemini: !!settings?.apiKey,
        openai: !!settings?.openaiApiKey,
    };
}
