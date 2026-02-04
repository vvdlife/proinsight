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

    // 1. Get User API Key for Gemini
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    if (!settings?.apiKey) {
        return { success: false, message: "Gemini API Key가 설정되지 않았습니다." };
    }

    // 2. Validate OpenAI Key (Env check is done in tts.ts, but good to catch early)
    if (!process.env.OPENAI_API_KEY) {
        return { success: false, message: "서버에 OpenAI API Key가 설정되지 않았습니다. 관리자에게 문의하세요." };
    }

    try {
        console.log("🎙️ [Voice] Step 1: Generating Script...");
        const script = await generateVoiceScript(content, settings.apiKey);

        console.log("🎙️ [Voice] Step 2: Generating Audio (TTS)...");
        const audioBuffer = await generateSpeech(script);

        console.log("🎙️ [Voice] Step 3: Uploading to Blob...");
        // Use Vercel Blob for storage
        const filename = `voice-briefing-${postId}-${Date.now()}.mp3`;
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
