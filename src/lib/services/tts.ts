// Path: src/lib/services/tts.ts
import OpenAI from "openai";

import { PodcastSegment } from "./voice-script";

/**
 * Converts a podcast script into speech using OpenAI's Audio API.
 * @param segments The array of podcast segments with speaker 'A' or 'B'.
 * @param apiKey OpenAI API Key.
 * @returns A Buffer containing the combined MP3 audio data.
 */
export async function generateSpeech(segments: PodcastSegment[], apiKey?: string): Promise<Buffer> {
    const finalApiKey = apiKey || process.env.OPENAI_API_KEY;

    if (!finalApiKey) {
        throw new Error("OpenAI API Key is missing. Please check settings or environment variables.");
    }

    const openai = new OpenAI({
        apiKey: finalApiKey,
    });

    try {
        const buffers: Buffer[] = [];

        // Generate audio for each segment sequentially
        // For production, we could optimize this, but OpenAI has rate limits on concurrent TTS requests.
        for (const segment of segments) {
            const voiceId = segment.speaker === "A" ? "onyx" : "nova"; // Onyx = Deep male, Nova = Energetic female

            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: voiceId,
                input: segment.text,
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            buffers.push(buffer);
        }

        // Concatenate all MP3 buffers together
        // Since OpenAI TTS outputs standard MP3 format with same bitrate, simple buffer concat works cleanly.
        return Buffer.concat(buffers);

    } catch (error) {
        console.error("TTS Generation Error Details:", error);
        if (error instanceof OpenAI.APIError) {
            throw new Error(`TTS 변환 실패: ${error.message} (Code: ${error.code})`);
        }
        throw new Error("TTS 변환에 실패했습니다. (Unknown Error)");
    }
}
