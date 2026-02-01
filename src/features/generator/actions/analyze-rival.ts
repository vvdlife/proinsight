// Path: src/features/generator/actions/analyze-rival.ts
"use server";

import { scrapeUrl } from "@/lib/services/scraper";
import { analyzeRivalContent, RivalAnalysisResult } from "@/lib/services/rival-analysis";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export type AnalyzeRivalResult = {
    success: boolean;
    message?: string;
    data?: RivalAnalysisResult;
};

export async function analyzeRival(url: string, myTopic: string): Promise<AnalyzeRivalResult> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    // BYOK Check
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    if (!settings?.apiKey) return { success: false, message: "API Key required" };

    try {
        // 1. Scrape
        const scraped = await scrapeUrl(url);
        if (!scraped.success || !scraped.content) {
            return { success: false, message: `Scraping failed: ${scraped.error}` };
        }

        // 2. Analyze
        const analysis = await analyzeRivalContent(scraped, myTopic, settings.apiKey);

        return {
            success: true,
            data: analysis
        };

    } catch (error) {
        console.error("Analyze Rival Action Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Analysis failed"
        };
    }
}
