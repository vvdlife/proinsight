// Path: src/lib/services/seo-planner.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchTavily } from "./tavily";

export interface FAQItem {
    question: string;
    answer: string;
}

export interface SEOStrategy {
    targetKeywords: string[];
    searchIntent: "Informational" | "Commercial" | "Transactional" | "Navigational";
    h2Suggestions: string[];
    faqSection: FAQItem[];
    jsonLdContext: Partial<any>; // Placeholder for schema data context
}

export async function planSEOStrategy(topic: string, apiKey: string): Promise<SEOStrategy> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview", generationConfig: { responseMimeType: "application/json" } });

    // 1. Gather Context via Tavily
    console.log(`🔎 SEO Planner: Researching topic "${topic}" via Tavily...`);
    const searchContext = await searchTavily(topic);

    const contextString = searchContext.results.map(r => `- ${r.title}: ${r.content}`).join("\n");

    // 2. AI Planning
    console.log("🧠 SEO Planner: Analyzing Search Intent & Keywords...");
    const prompt = `
    You are an elite SEO Strategist. Your goal is to plan a blog post that ranks #1 on Google for the topic: "${topic}".
    
    Analyze the following search context (top ranking content snippets):
    ${contextString.substring(0, 8000)}

    Based on this, generate a comprehensive SEO Strategy JSON:
    1. targetKeywords: 1 Main keyword + 3-4 LSI/Secondary keywords.
    2. searchIntent: The primary user intent.
    3. h2Suggestions: 4-6 compelling H2 headings that include keywords and cover the topic depth.
    4. faqSection: 3-5 "People Also Ask" questions with concise answers (to be used in schema).
    
    JSON Output Format:
    {
        "targetKeywords": ["string"],
        "searchIntent": "string",
        "h2Suggestions": ["string"],
        "faqSection": [ { "question": "string", "answer": "string" } ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const strategy = JSON.parse(text) as SEOStrategy;

        console.log(`✅ SEO Strategy Created: ${strategy.targetKeywords[0]} (${strategy.searchIntent})`);
        return strategy;
    } catch (error) {
        console.error("SEO Planning Failed:", error);
        // Fallback Strategy
        return {
            targetKeywords: [topic, `${topic} guide`, `${topic} tips`],
            searchIntent: "Informational",
            h2Suggestions: [`Introduction to ${topic}`, `Key Benefits`, `How to Master ${topic}`, `Conclusion`],
            faqSection: [
                { question: `What is ${topic}?`, answer: `${topic} is a key concept in...` }
            ],
            jsonLdContext: {}
        };
    }
}
