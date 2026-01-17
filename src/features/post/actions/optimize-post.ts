// Path: src/features/post/actions/optimize-post.ts
"use server";

import { optimizeContent } from "@/lib/services/ai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export type OptimizePostResponse = {
    success: boolean;
    data?: string;
    message?: string;
};

export async function optimizePost(content: string, suggestions: string[]): Promise<OptimizePostResponse> {
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
        const optimizedContent = await optimizeContent(content, suggestions, settings.apiKey);
        return { success: true, data: optimizedContent };
    } catch (error) {
        console.error("Optimize Post Action Error:", error);
        return { success: false, message: "AI 최적화에 실패했습니다." };
    }
}
