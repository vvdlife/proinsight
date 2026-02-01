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

export type GeneratePostResult = {
    success: boolean;
    message?: string;
    postId?: string;
    content?: string;
    errors?: Record<string, string[]>;
};

// Simplified: No Refine, No Experience Injection
export async function generatePost(data: PostFormValues, searchContext?: string): Promise<GeneratePostResult> {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, message: "로그인이 필요합니다." };
    }

    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    if (!settings?.apiKey) {
        return { success: false, message: "API Key가 설정되지 않았습니다." };
    }
    const apiKey = settings.apiKey;

    const validation = postSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, message: "유효성 검사 실패", errors: validation.error.flatten().fieldErrors };
    }

    try {
        console.log("🚀 Starting Generation Pipeline (Unified Mode)...");

        // 1. SEO Planning
        console.log("🧠 [Phase 1] SEO Strategy Planning...");
        const seoStrategy = await planSEOStrategy(data.topic, apiKey);

        // 2. Writing (Drafting is now the final content)
        console.log("✍️ [Phase 2] Writing content...");
        const content = await generateBlogPost(data, searchContext, apiKey, seoStrategy);

        // 3. Schema Generation
        const schemaMarkup = generateJSONLD(seoStrategy, content);

        // 4. Save to Database
        const post = await prisma.post.create({
            data: {
                topic: data.topic,
                content: content,
                tone: data.tone,
                status: "DRAFT",
                userId,
                coverImage: null,
                audioUrl: null, // Always null as audio feature is removed
                schemaMarkup: schemaMarkup,
            },
        });

        return {
            success: true,
            message: "글 생성이 완료되었습니다.",
            postId: post.id,
            content: content,
        };
    } catch (error) {
        console.error("AI Generation Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "글 생성 중 오류 발생",
        };
    }
}

// Separate Action for Image (Kept for performance)
export async function generatePostImage(postId: string, topic: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const settings = await prisma.userSettings.findUnique({ where: { userId }, select: { apiKey: true } });
    const apiKey = settings?.apiKey;
    if (!apiKey) return { success: false, message: "API Key not found" };

    try {
        console.log("🎨 [Separate Action] Designing cover image...");
        const imagePrompt = await generateImagePrompt(topic, apiKey);
        const imageBase64 = await generateBlogImage(imagePrompt, apiKey);

        if (imageBase64) {
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
