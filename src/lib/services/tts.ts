// Path: src/lib/services/tts.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

import { PodcastSegment } from "./voice-script";

/**
 * Helper function to encode raw 16-bit PCM mono data into a valid WAV file buffer.
 * Gemini 3.1 Flash TTS outputs raw PCM at 24kHz.
 */
function encodeWav(pcmBuffer: Buffer, sampleRate: number = 24000): Buffer {
    const header = Buffer.alloc(44);

    // 1. "RIFF" chunk descriptor
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + pcmBuffer.length, 4); // File size - 8
    header.write("WAVE", 8);

    // 2. "fmt " subchunk (describes the format)
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);             // Subchunk1 size (16 for PCM)
    header.writeUInt16LE(1, 20);              // Audio format (1 = PCM)
    header.writeUInt16LE(1, 22);              // Number of channels (1 = Mono)
    header.writeUInt32LE(sampleRate, 24);      // Sample rate (24000)
    header.writeUInt32LE(sampleRate * 2, 28);    // Byte rate (SampleRate * 1 channel * 16 bits / 8 = SampleRate * 2)
    header.writeUInt16LE(2, 32);              // Block align (channels * bits/8 = 2)
    header.writeUInt16LE(16, 34);             // Bits per sample (16)

    // 3. "data" subchunk (contains the raw PCM data)
    header.write("data", 36);
    header.writeUInt32LE(pcmBuffer.length, 40); // Data size

    return Buffer.concat([header, pcmBuffer]);
}

/**
 * Converts a podcast script into speech using Gemini's 3.1 Flash TTS model.
 * @param segments The array of podcast segments with speaker 'A' or 'B'.
 * @param apiKey Google Gemini API Key.
 * @returns A Buffer containing the combined WAV audio data.
 */
export async function generateSpeech(segments: PodcastSegment[], apiKey?: string): Promise<Buffer> {
    const finalApiKey = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!finalApiKey) {
        throw new Error("Gemini API Key가 없습니다. 설정 페이지나 환경 변수를 확인해주세요.");
    }

    const genAI = new GoogleGenerativeAI(finalApiKey);
    // Use the dedicated TTS model
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-tts-preview" });

    try {
        const buffers: Buffer[] = [];

        // Generate audio for each segment sequentially
        for (const segment of segments) {
            const voiceId = segment.speaker === "A" ? "Puck" : "Kore"; // Puck = Energetic/Upbeat, Kore = Firm/Professional

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: segment.text }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: voiceId,
                            }
                        }
                    }
                } as any
            });

            const candidate = result.response.candidates?.[0];
            const part = candidate?.content?.parts?.[0];
            if (!part?.inlineData?.data) {
                throw new Error("Gemini API가 오디오 데이터를 반환하지 않았습니다.");
            }

            const base64Data = part.inlineData.data;
            const buffer = Buffer.from(base64Data, "base64");
            buffers.push(buffer);
        }

        // Concatenate PCM buffers and encode as a standard WAV file
        const combinedPcm = Buffer.concat(buffers);
        return encodeWav(combinedPcm, 24000);

    } catch (error) {
        console.error("TTS Generation Error Details:", error);
        throw new Error(error instanceof Error ? `TTS 변환 실패: ${error.message}` : "TTS 변환에 실패했습니다.");
    }
}

