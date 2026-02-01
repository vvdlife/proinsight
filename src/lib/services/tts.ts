// Path: src/lib/services/tts.ts
import OpenAI from "openai";
import { put } from "@vercel/blob";

export async function generateAudio(text: string, postId: string): Promise<string | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.warn("Skipping TTS: OPENAI_API_KEY is missing.");
        return null;
    }

    const openai = new OpenAI({ apiKey });

    try {
        console.log("🔊 Generating Audio (OpenAI TTS)...");
        const mp3 = await openai.audio.speech.create({
            model: "tts-1", // or "tts-1-hd" for better quality
            voice: "onyx",  // Deep, authoritative, news-like voice
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        // Upload to Vercel Blob
        const filename = `audio-briefing-${postId}-${Date.now()}.mp3`;
        const blob = await put(filename, buffer, {
            access: 'public',
        });

        console.log(`   ✅ Audio Uploaded: ${blob.url}`);
        return blob.url;

    } catch (error) {
        console.error("TTS Generation Error:", error);
        return null;
    }
}
