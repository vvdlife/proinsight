"use server";

import { generateSocialContent, SocialContentResult } from "@/lib/services/ai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export type GenerateSocialResponse = {
    success: boolean;
    data?: SocialContentResult;
    message?: string;
};

export async function runSocialContentGeneration(
    postContent: string,
    platform: 'instagram' | 'twitter' | 'linkedin'
): Promise<GenerateSocialResponse> {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    // Try to get key from DB first (BYOK)
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    // Fallback to Env Var if no DB key, OR use DB key if exists.
    // If neither, fail.
    const apiKey = settings?.apiKey || process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        return { success: false, message: "API Key가 설정되지 않았습니다. 설정 페이지에서 키를 등록하거나 관리자에게 문의하세요." };
    }

    try {
        const result = await generateSocialContent(postContent, platform, apiKey);
        return { success: true, data: result };
    } catch (error) {
        console.error("Social Generation Action Error:", error);
        return { success: false, message: "콘텐츠 생성에 실패했습니다. 잠시 후 다시 시도해주세요." };
    }
}
