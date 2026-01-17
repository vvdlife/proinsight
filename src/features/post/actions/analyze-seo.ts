"use server";

import { analyzeSEO, SEOResult } from "@/lib/services/seo-analyzer";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export type AnalyzeSEOResponse = {
    success: boolean;
    data?: SEOResult;
    message?: string;
};

export async function runSEOAnalysis(content: string, topic: string): Promise<AnalyzeSEOResponse> {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    // BYOK: Fetch API Key
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    if (!settings?.apiKey) {
        return { success: false, message: "API Key가 설정되지 않았습니다. 설정 페이지에서 키를 먼저 등록해주세요." };
    }

    try {
        const result = await analyzeSEO(content, topic, settings.apiKey);
        return { success: true, data: result };
    } catch (error) {
        console.error("SEO Action Error:", error);
        return { success: false, message: "Failed to analyze content." };
    }
}
