import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export interface SEOResult {
    seoScore: number;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    suggestions: string[];
}

export async function analyzeSEO(content: string, topic: string): Promise<SEOResult> {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview", // Using Gemini 3 Pro for consistent high quality analysis
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
        You are a Google SEO Expert. Analyze the following blog post content based on the topic: "${topic}".
        
        Provide a JSON response with the following fields:
        1. seoScore: A number between 0 and 100 indicating the SEO quality.
        2. metaTitle: An optimized HTML title tag (max 60 chars).
        3. metaDescription: An optimized meta description (max 160 chars).
        4. keywords: An array of 5 important keywords extracted from the text.
        5. suggestions: An array of 3-5 specific, actionable improvements for SEO.

        Analyze strictly based on modern SEO best practices (E-E-A-T, Keyword density, Readability).
        
        Content:
        ${content.substring(0, 10000)} ... (truncated for analysis)
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const json = JSON.parse(text);
            return {
                seoScore: json.seoScore || 50,
                metaTitle: json.metaTitle || topic,
                metaDescription: json.metaDescription || "No description generated.",
                keywords: json.keywords || [],
                suggestions: json.suggestions || ["Content is too short to analyze."],
            };
        } catch (parseError) {
            console.error("SEO JSON Parse Error:", parseError, "Raw Text:", text);
            throw new Error("Failed to parse SEO analysis result.");
        }

    } catch (error) {
        console.error("SEO Analysis Error:", error);
        return {
            seoScore: 0,
            metaTitle: "Error",
            metaDescription: "Failed to analyze SEO.",
            keywords: [],
            suggestions: [`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`],
        };
    }
}
