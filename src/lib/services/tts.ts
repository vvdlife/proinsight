// Path: src/lib/services/tts.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

import { PodcastSegment } from "./voice-script";

/**
 * Helper function to concatenate multiple WAV buffers into a single valid, playable WAV buffer.
 * It parses the WAV files to locate the "data" subchunk, combines only the raw PCM bytes,
 * and updates the RIFF/data chunk sizes in the primary WAV header.
 */
function concatWavBuffers(buffers: Buffer[]): Buffer {
    if (buffers.length === 0) return Buffer.alloc(0);
    if (buffers.length === 1) return buffers[0];

    // Helper to locate the "data" subchunk offset and size in a WAV buffer
    const findDataChunk = (buf: Buffer) => {
        let offset = 12; // Start after "RIFF" + size + "WAVE"
        while (offset < buf.length - 8) {
            const chunkId = buf.toString("ascii", offset, offset + 4);
            const chunkSize = buf.readUInt32LE(offset + 4);
            if (chunkId === "data") {
                return { headerSize: offset + 8, dataSize: chunkSize };
            }
            offset += 8 + chunkSize; // 8 bytes for ID and size field
        }
        throw new Error("WAV 파일에서 data chunk를 찾을 수 없습니다.");
    };

    try {
        const firstWavInfo = findDataChunk(buffers[0]);
        const header = buffers[0].subarray(0, firstWavInfo.headerSize);

        const pcmDataParts: Buffer[] = [];
        let totalDataSize = 0;

        for (const buf of buffers) {
            const info = findDataChunk(buf);
            const pcm = buf.subarray(info.headerSize, info.headerSize + info.dataSize);
            pcmDataParts.push(pcm);
            totalDataSize += pcm.length;
        }

        const combinedPcm = Buffer.concat(pcmDataParts);

        // Allocate final buffer and assemble WAV file
        const finalBuffer = Buffer.alloc(firstWavInfo.headerSize + totalDataSize);
        header.copy(finalBuffer);
        combinedPcm.copy(finalBuffer, firstWavInfo.headerSize);

        // Update RIFF chunk size at offset 4: (total file size - 8)
        finalBuffer.writeUInt32LE(finalBuffer.length - 8, 4);

        // Update "data" subchunk size at offset (headerSize - 4)
        finalBuffer.writeUInt32LE(totalDataSize, firstWavInfo.headerSize - 4);

        return finalBuffer;
    } catch (error) {
        console.error("WAV Concatenation Error:", error);
        // Fallback to simple concat if parsing fails
        return Buffer.concat(buffers);
    }
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

        // Concatenate WAV buffers cleanly
        return concatWavBuffers(buffers);

    } catch (error) {
        console.error("TTS Generation Error Details:", error);
        throw new Error(error instanceof Error ? `TTS 변환 실패: ${error.message}` : "TTS 변환에 실패했습니다.");
    }
}

