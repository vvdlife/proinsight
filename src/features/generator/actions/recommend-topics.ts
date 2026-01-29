// Path: src/features/generator/actions/recommend-topics.ts
"use server";

import { recommendTopics, RecommendedTopic } from "@/lib/services/ai";
import { searchWeb } from "@/lib/services/search"; // Using searchWeb wrapper around Tavily

export interface RecommendTopicsResult {
    success: boolean;
    topics?: RecommendedTopic[];
    message?: string;
}

export async function recommendTopicsAction(category: string): Promise<RecommendTopicsResult> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const tavilyKey = process.env.TAVILY_API_KEY;

    if (!apiKey || !tavilyKey) {
        return {
            success: false,
            message: "API Keys are missing (Gemini or Tavily).",
        };
    }

    try {
        console.log(`🔍 Searching trends for category: ${category}...`);

        // 1. Search for trends (Deep Research)
        // We use a specific query designed to catch latest news and discussions
        const query = `${category} trends news 2025 hot topics issues`;
        const searchResponse = await searchWeb(query, "basic"); // Use basic search for speed

        // searchWeb returns { results: [...] }
        // We concatenate snippets for context
        const searchContext = searchResponse.results
            .map((r) => `Title: ${r.title}\nContent: ${r.content}`)
            .join("\n\n");

        console.log(`🧠 Generating topics with Gemini...`);
        // 2. Generate topics based on search context
        const topics = await recommendTopics(searchContext, category, apiKey);

        return {
            success: true,
            topics: topics,
        };
    } catch (error: any) {
        console.error("Recommend Topics Action Failed:", error);
        return {
            success: false,
            message: error.message || "Failed to recommend topics.",
        };
    }
}
