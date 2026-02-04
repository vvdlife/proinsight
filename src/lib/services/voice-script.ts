// Path: src/lib/services/voice-script.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates a radio-style script from a blog post content using Gemini.
 * @param content The full markdown content of the blog post.
 * @param apiKey Google Gemini API Key.
 * @returns A script string optimized for TTS (2-3 minutes length).
 */
export async function generateVoiceScript(content: string, apiKey: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Use efficient model for summarization

    const prompt = `
You are a charismatic Radio Host for "ProInsight AI".
Your listener is a busy professional who wants to get the key insights from this blog post while driving or commuting.

Task:
Convert the following blog post into a 2-3 minute radio script (approx. 400-500 words).
Do NOT include any stage directions like [Sound Effect], [Intro Music], or (Laughs).
ONLY write the spoken text that the TTS engine should read.
The tone should be professional yet conversational, engaging, and clear.

Structure:
1.  **Intro**: "안녕하세요, ProInsight AI 브리핑입니다. 오늘의 주제는..." (Briefly introduce the topic).
2.  **Body**: Summarize the 3-4 most important key takeaways from the content. Use transition words like "첫 번째로," "또한," "마지막으로," to make it easy to follow aurally.
3.  **Conclusion**: A brief wrap-up and a call to action (e.g., "더 자세한 내용은 본문을 참고해주세요.").

Input Blog Post:
${content}

Output Script (Korean):
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Voice Script Generation Error:", error);
        throw new Error("오디오 대본 생성에 실패했습니다.");
    }
}
