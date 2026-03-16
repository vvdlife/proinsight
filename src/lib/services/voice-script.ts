// Path: src/lib/services/voice-script.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface PodcastSegment {
    speaker: "A" | "B";
    text: string;
}

/**
 * Generates a podcast-style conversational script from a blog post content using Gemini.
 * @param content The full markdown content of the blog post.
 * @param apiKey Google Gemini API Key.
 * @returns A JSON array of PodcastSegments
 */
export async function generateVoiceScript(content: string, apiKey: string): Promise<PodcastSegment[]> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" }); // Use Flash Lite for speed and cost-efficiency

    const prompt = `
You are the scriptwriter for an engaging tech/business podcast called "ProInsight Audio".
There are two hosts:
- Host A (Main host, energetic, leads the topic)
- Host B (Expert/Co-host, provides deep insights, calm)

Task:
Convert the following blog post into a conversational podcast script (approx 3-4 minutes).
Do NOT include any stage directions or sound effects.

Output Format:
You MUST output ONLY a valid JSON array. Each element should be an object with:
- "speaker": Either "A" or "B"
- "text": The Korean spoken text for that segment. (Keep each segment short, 1-3 sentences max, to simulate real back-and-forth conversation).

Input Blog Post:
${content}
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        // Extract JSON using regex in case of markdown blocks
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("JSON parsing failed");
        
        const segments: PodcastSegment[] = JSON.parse(jsonMatch[0]);
        return segments;
    } catch (error) {
        console.error("Voice Script Generation Error:", error);
        throw new Error("오디오 대본(팟캐스트) 생성에 실패했습니다.");
    }
}
