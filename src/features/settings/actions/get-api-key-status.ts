// Path: src/features/settings/actions/get-api-key-status.ts
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getApiKeyStatus(): Promise<boolean> {
    const { userId } = await auth();
    if (!userId) return false;

    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    return !!settings?.apiKey;
}
