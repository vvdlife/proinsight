// Path: src/features/generator/actions/generate-post.ts
"use server";

import { generateBlogPost } from "@/lib/services/ai";
import { postSchema, PostFormValues } from "@/lib/schemas/post-schema";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { generateImagePrompt } from "@/lib/services/image-prompt";
import { generateBlogImage } from "@/lib/services/image-gen";
import { planSEOStrategy } from "@/lib/services/seo-planner";
import { generateJSONLD } from "@/lib/services/ai";
import { refinePost } from "@/lib/services/editor";
import { generateVoiceScript } from "@/lib/services/voice-script";
import { generateAudio } from "@/lib/services/tts";

export type GeneratePostResult = {
    success: boolean;
    message?: string;
    postId?: string;
    content?: string;
    errors?: Record<string, string[]>;
};

// Renamed logic internally, but kept function name for compatibility (Phase 1: Draft Only)
export async function generatePost(data: PostFormValues, searchContext?: string): Promise<GeneratePostResult> {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, message: "로그인이 필요합니다." };
    }

    // BYOK: Fetch API Key
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    if (!settings?.apiKey) {
        return { success: false, message: "API Key가 설정되지 않았습니다." };
    }
    const apiKey = settings.apiKey;

    // 1. Server-side validation
    const validation = postSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: "유효성 검사 실패", errors: validation.error.flatten().fieldErrors };
    }

    try {
        console.log("🚀 Starting Generation Pipeline (Phase 1: Draft Mode)...");

        // 2-1. SEO Planning
        console.log("🧠 [Phase 1] SEO Strategy Planning...");
        const seoStrategy = await planSEOStrategy(data.topic, apiKey);

        // 2-2. Drafting (Writer) - FAST STEP
        console.log("✍️ [Phase 2] Drafting content (Gemini Flash)...");
        const draftContent = await generateBlogPost(data, searchContext, apiKey, seoStrategy);

        // 2-3. SKIPPING Refine (Moved to Client-side Phase 2)
        // We save the DRAFT content directly to keep this request under 10-20s.

        // 3. Schema Generation (Based on Draft)
        const schemaMarkup = generateJSONLD(seoStrategy, draftContent);

        // 4. Save to Database (Status: DRAFT)
        const post = await prisma.post.create({
            data: {
                topic: data.topic,
                content: draftContent, // Saving DRAFT content first
                tone: data.tone,
                status: "DRAFT", // Explicitly DRAFT
                userId,
                coverImage: null,
                audioUrl: null,
                schemaMarkup: schemaMarkup,
            },
        });

        return {
            success: true,
            message: "초안이 작성되었습니다. 윤문(Refining) 단계를 시작합니다...",
            postId: post.id,
            content: draftContent,
        };
    } catch (error) {
        console.error("AI Draft Generation Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "초안 생성 중 오류 발생",
        };
    }
}

// Step 2: Refine Action (Called from Client)
export async function refinePostAction(postId: string, draftContent: string, topic: string, experience?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const settings = await prisma.userSettings.findUnique({ where: { userId }, select: { apiKey: true } });
    const apiKey = settings?.apiKey;
    if (!apiKey) return { success: false, message: "API Key not found" };

    try {
        console.log("🧐 [Phase 3] Editor-in-Chief: Refining content (Gemini 3 Pro)...");
        // This is the heavy lifting step (20-30s)
        const refinedContent = await refinePost(draftContent, topic, apiKey, experience);

        // Update Post
        await prisma.post.update({
            where: { id: postId, userId },
            data: {
                content: refinedContent,
                status: "COMPLETED" // Mark as refined
            }
        });

        console.log("   ✅ Content Refined & Saved");
        return { success: true, content: refinedContent };
    } catch (e) {
        console.error("   ❌ Refine Failed:", e);
        return { success: false, message: "Refine failed" };
    }
}

export async function generatePostImage(postId: string, topic: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const settings = await prisma.userSettings.findUnique({ where: { userId }, select: { apiKey: true } });
    const apiKey = settings?.apiKey;
    if (!apiKey) return { success: false, message: "API Key not found" };

    try {
        console.log("🎨 [Separate Action] Designing cover image...");
        const imagePrompt = await generateImagePrompt(topic, apiKey);
        console.log(`   📝 Image Prompt: ${imagePrompt}`);
        const imageBase64 = await generateBlogImage(imagePrompt, apiKey);

        if (imageBase64) {
            console.log("   ✅ Image Generated Successfully");
            await prisma.post.update({
                where: { id: postId, userId },
                data: { coverImage: imageBase64 }
            });
            return { success: true, imageUrl: imageBase64 };
        }
        return { success: false, message: "Image generation returned null" };
    } catch (e) {
        console.error("   ❌ Image Generation Failed:", e);
        return { success: false, message: "Image generation failed" };
    }
}

export async function generatePostAudio(postId: string, content: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const settings = await prisma.userSettings.findUnique({ where: { userId }, select: { apiKey: true } });
    const apiKey = settings?.apiKey;
    if (!apiKey) return { success: false, message: "API Key not found" };

    try {
        console.log("🎙️ [Separate Action] Recording Audio Briefing...");
        const script = await generateVoiceScript(content, apiKey);
        console.log("   📜 Script Written (approx. words):", script.length);

        const audioLink = await generateAudio(script, Date.now().toString());
        if (audioLink) {
            console.log("   ✅ Audio Briefing Recorded:", audioLink);
            await prisma.post.update({
                where: { id: postId, userId },
                data: { audioUrl: audioLink }
            });
            return { success: true, audioUrl: audioLink };
        }
        return { success: false, message: "Audio generation returned null" };
    } catch (e) {
        console.error("   ❌ Voice Generation Failed:", e);
        return { success: false, message: "Voice generation failed" };
    }
}
