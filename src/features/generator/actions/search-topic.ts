"use server";

import { searchWeb } from "@/lib/services/search";

export const maxDuration = 60;

export interface SearchResultState {
    success: boolean;
    context?: string;
    message?: string;
}

export async function searchTopic(topic: string): Promise<SearchResultState> {
    if (!topic) {
        return { success: false, message: "Topic is required" };
    }

    try {
        const response = await searchWeb(topic);

        // Format context for AI
        const contextParts = [];
        if (response.answer) {
            contextParts.push(`**Quick Answer:** ${response.answer}`);
        }

        if (response.results && response.results.length > 0) {
            contextParts.push(`**Key Findings:**`);
            response.results.forEach((r, index) => {
                contextParts.push(`[${index + 1}] Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}\n`);
            });
        }

        const context = contextParts.join("\n\n");

        if (!context) {
            return { success: false, message: "검색 결과를 찾을 수 없습니다." };
        }

        return {
            success: true,
            context: context
        };
    } catch (error) {
        console.error("Search Topic Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "정보 검색 중 오류가 발생했습니다."
        };
    }
}
