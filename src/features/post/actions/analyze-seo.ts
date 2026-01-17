"use server";

import { analyzeSEO, SEOResult } from "@/lib/services/seo-analyzer";
import { auth } from "@clerk/nextjs/server";

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

    try {
        const result = await analyzeSEO(content, topic);
        return { success: true, data: result };
    } catch (error) {
        console.error("SEO Action Error:", error);
        return { success: false, message: "Failed to analyze content." };
    }
}
