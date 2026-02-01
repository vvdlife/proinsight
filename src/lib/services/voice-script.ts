// Path: src/lib/services/voice-script.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateVoiceScript(content: string, apiKey: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
    You are a Professional Radio Host for a Tech/Knowledge podcast called "ProInsight Audio".
    Your task is to convert the following blog post content into a natural, engaging AUDIO SCRIPT.

    GUIDELINES:
    1. Tone: Friendly, intelligent, and conversational. Like a tech columnist talking to a friend.
    2. Structure:
       - Intro: "안녕하세요, ProInsight 오디오 브리핑입니다. 오늘은 [Topic]에 대해 이야기해보겠습니다."
       - Body: Summarize the key 3-4 points. Use transition phrases like "첫 번째로," "재미있는 점은," "결론적으로."
       - Outro: "오늘의 인사이트가 도움이 되셨나요? 지금까지 ProInsight였습니다. 감사합니다."
    3. Length: Approximately 2-3 minutes spoken (about 400-500 words).
    4. Language: Korean (Natural Spoken Korean).
    5. No Markdown formatting (bold, etc.) - just plain text for TTS.

    BLOG CONTENT:
    ${content.substring(0, 20000)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Voice Script Generation Error:", error);
        throw new Error("Failed to generate voice script.");
    }
}
