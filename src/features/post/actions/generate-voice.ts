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
        select: { apiKey: true, openaiApiKey: true },
    });

    if (!settings?.apiKey) {
        return { success: false, message: "Gemini API Key가 설정되지 않았습니다. 설정 페이지에서 등록해주세요." };
    }

    // 2. Validate OpenAI Key (User Settings > Env)
    // Priority: DB Setting (User override) -> Env Variable (Server default)
    const openaiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;

    console.log("🎙️ [Debug] Checking OpenAI Key Resolution:", {
        envExists: !!process.env.OPENAI_API_KEY,
        dbExists: !!settings.openaiApiKey,
        finalKeyUsed: !!openaiKey
    });

    if (!openaiKey) {
        return { success: false, message: "OpenAI API Key가 없습니다. 설정 페이지에서 등록해주세요." };
    }

    // Temporarily inject key into process.env for tts.ts library (or refactor logic)
    // Better approach: Pass key to service functions.
    // However, existing tts.ts relies on process.env or new instance.
    // Let's refactor tts.ts slightly or handle logic here.

    // For now, let's update tts.ts to accept key as argument.

    try {
        console.log("🎙️ [Voice] Step 1: Generating Script...");
        const script = await generateVoiceScript(content, settings.apiKey);

        console.log("🎙️ [Voice] Step 2: Generating Audio (TTS)...");
        const audioBuffer = await generateSpeech(script, openaiKey);

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
