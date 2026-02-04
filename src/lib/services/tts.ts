// Path: src/lib/services/tts.ts
import OpenAI from "openai";

/**
 * Converts text to speech using OpenAI's Audio API.
 * @param text The text to convert to speech.
 * @returns A Buffer containing the MP3 audio data.
 */
export async function generateSpeech(text: string, apiKey?: string): Promise<Buffer> {
    const finalApiKey = apiKey || process.env.OPENAI_API_KEY;

    if (!finalApiKey) {
        throw new Error("OpenAI API Key is missing. Please check settings or environment variables.");
    }

    const openai = new OpenAI({
        apiKey: finalApiKey,
    });

    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1", // tts-1 is faster, tts-1-hd is higher quality. "tts-1" is good for speed.
            voice: "onyx", // "onyx" is deep and professional. "alloy" is neutral.
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        return buffer;
    } catch (error) {
        console.error("TTS Generation Error:", error);
        throw new Error("TTS 변환에 실패했습니다.");
    }
}
