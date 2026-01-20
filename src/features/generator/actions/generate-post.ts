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

export type GeneratePostResult = {
    success: boolean;
    message?: string;
    postId?: string;
    content?: string;
    errors?: Record<string, string[]>;
};

export async function generatePost(data: PostFormValues, searchContext?: string): Promise<GeneratePostResult> {
    const { userId } = await auth();
    if (!userId) {
        return {
            success: false,
            message: "로그인이 필요합니다.",
        };
    }

    // BYOK: Fetch API Key
    const settings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { apiKey: true },
    });

    if (!settings?.apiKey) {
        return {
            success: false,
            message: "API Key가 설정되지 않았습니다. 설정 페이지에서 키를 먼저 등록해주세요.",
        };
    }

    const apiKey = settings.apiKey;

    // 1. Server-side validation
    const result = postSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            message: "유효성 검사에 실패했습니다.",
            errors: result.error.flatten().fieldErrors,
        };
    }

    try {
        // 2. Serial Execution (High Quality / Stability Priority)
        console.log("🚀 Starting Generation Pipeline (Pro Mode enabled)...");

        // 2-1. SEO Planning
        console.log("🧠 [Phase 1] SEO Strategy Planning...");
        const seoStrategy = await planSEOStrategy(data.topic, apiKey);
        console.log("   ✅ Strategy Planned:", seoStrategy.targetKeywords[0]);

        // 2-2. Drafting (Writer)
        console.log("✍️ [Phase 2] Drafting content...");
        const draftContent = await generateBlogPost(data, searchContext, apiKey, seoStrategy);

        // 2-3. Refining (Editor-in-Chief)
        // With Vercel Pro, we can afford the time for the high-quality model to think deeply.
        console.log("🧐 [Phase 3] Editor-in-Chief: Refining content (High Quality)...");
        const refinedContent = await refinePost(draftContent, data.topic, apiKey);

        // 2-4. Image Generation (Designer)
        let coverImageUrl = null;
        if (data.includeImage) {
            console.log("🎨 [Phase 4] Designing cover image...");
            try {
                const imagePrompt = await generateImagePrompt(data.topic, apiKey);
                console.log(`   📝 Image Prompt: ${imagePrompt}`);
                const imageBase64 = await generateBlogImage(imagePrompt, apiKey);
                if (imageBase64) {
                    console.log("   ✅ Image Generated Successfully");
                    coverImageUrl = imageBase64;
                }
            } catch (e) {
                console.error("   ❌ Image Generation Failed (Skipping):", e);
            }
        }

        // 3. Schema Generation
        const schemaMarkup = generateJSONLD(seoStrategy, refinedContent);

        // Post-processing: Append image if it exists
        let finalContent = refinedContent;
        if (coverImageUrl) {
            finalContent = `![Cover Image](${coverImageUrl})\n\n${refinedContent}`;
        }

        // 4. Save to Database
        const post = await prisma.post.create({
            data: {
                topic: data.topic,
                content: refinedContent,
                tone: data.tone,
                status: "DRAFT",
                userId,
                coverImage: coverImageUrl,
                schemaMarkup: schemaMarkup,
            },
        });

        return {
            success: true,
            message: "고품질 콘텐츠 생성이 완료되었습니다!",
            postId: post.id,
            content: finalContent,
        };
    } catch (error) {
        console.error("AI Generation Critical Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "AI 글 생성 중 알 수 없는 오류가 발생했습니다.",
        };
    }
}
