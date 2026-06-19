// Path: src/features/post/actions/generate-voice.ts
"use server";

import { prisma } from "@/lib/db";
import { generateVoiceScript } from "@/lib/services/voice-script";
import { generateSpeech } from "@/lib/services/tts";
import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";

export async function generateVoiceBriefing(postId: string, content: string) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, message: "로그인이 필요합니다." };
    }

    // 1. Get User API Keys
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    if (!settings?.apiKey) {
        return { success: false, message: "Gemini API Key가 설정되지 않았습니다. 설정 페이지에서 등록해주세요." };
    }

    try {
        console.log("🎙️ [Voice] Step 1: Generating Script (Gemini 3.5 Flash)...");
        const script = await generateVoiceScript(content, settings.apiKey);

        console.log("🎙️ [Voice] Step 2: Generating Audio (Gemini 3.1 Flash TTS)...");
        const audioBuffer = await generateSpeech(script, settings.apiKey);

        console.log("🎙️ [Voice] Step 3: Uploading to Blob...");
        // Use Vercel Blob for storage - use .wav for Gemini TTS output
        const filename = `voice-briefing-${postId}-${Date.now()}.wav`;
        const blob = await put(filename, audioBuffer, {
            access: 'public',
        });

        console.log("🎙️ [Voice] Step 4: Saving URL to DB...");
        await prisma.post.update({
            where: { id: postId, userId },
            data: {
                audioUrl: blob.url,
            },
        });

        return { success: true, audioUrl: blob.url };

    } catch (error) {
        console.error("Voice Generation Failed:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "오디오 생성 중 오류 발생",
        };
    }
}
