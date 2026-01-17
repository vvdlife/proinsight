// Path: src/features/post/actions/optimize-post.ts
"use server";

import { optimizeContent } from "@/lib/services/ai";
import { auth } from "@clerk/nextjs/server";

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

    try {
        const optimizedContent = await optimizeContent(content, suggestions);
        return { success: true, data: optimizedContent };
    } catch (error) {
        console.error("Optimize Post Action Error:", error);
        return { success: false, message: "이미지 최적화에 실패했습니다." };
    }
}
