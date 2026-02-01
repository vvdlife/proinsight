// Path: src/lib/services/rival-analysis.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapedContent } from "./scraper";

export interface RivalAnalysisResult {
    strategy: string;      // How to beat this content (1-2 sentences)
    weaknesses: string[];  // What is missing or weak in the rival content
    keywords: string[];    // Extracted target keywords
    structure: string[];   // Suggested H2 structure to outperform
    tone: string;          // Detected tone
}

export async function analyzeRivalContent(
    scrapedData: ScrapedContent,
    myTopic: string,
    apiKey: string
): Promise<RivalAnalysisResult> {

    if (!scrapedData.success || !scrapedData.content) {
        throw new Error("Invalid scraped data provided for analysis.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-3-pro-preview",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are a Competitive Content Strategist.
    Your goal is to analyze a competitor's blog post and provide a strategy to OUTPERFORM it.

    Competitor URL: ${scrapedData.url}
    My Topic: ${myTopic}

    Competitor Content (Excerpt):
    """
    ${scrapedData.content.substring(0, 15000)} ...
    """

    INSTRUCTIONS:
    1. Analyze the competitor's content for depth, logic, and SEO structure.
    2. Identify WEAKNESSES: What is missing? Is it too shallow? Boring? Outdated?
    3. Extract KEYWORDS: What keywords are they targeting?
    4. Propose a SUPERIOR STRUCTURE: Suggest an H2 outline that covers their points BUT ADDS more value (the "Gap Analysis").
    5. Define Tone: What is their tone? (Professional, Casual, Clickbaity?)

    OUTPUT JSON:
    {
      "strategy": "A concise strartegy statement on how to beat this post (e.g., 'Focus on practical examples which they lack').",
      "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
      "keywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"],
      "structure": ["H2 Suggestion 1", "H2 Suggestion 2 (Gap Fill)", "H2 Suggestion 3"],
      "tone": "Detected tone"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text) as RivalAnalysisResult;

    } catch (error) {
        console.error("Rival Analysis Failed:", error);
        throw new Error("Failed to analyze rival content.");
    }
}
