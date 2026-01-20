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
        // 2. Parallel Execution: Text (Writer) + Image (Designer)
        console.log("🚀 Starting Parallel Generation Pipeline...");

        // 2-0. SEO Planning (Synchronous Step - Required for Content)
        console.log("🧠 Starting SEO Strategy Planning...");
        const seoStrategy = await planSEOStrategy(data.topic, apiKey);
        console.log("   ✅ Strategy Planned:", seoStrategy.targetKeywords[0]);

        // Optimizing Pipeline: Run Image Generation in PARALLEL with Text Pipeline
        // This saves ~5-10 seconds of execution time.

        // 1. Image Generation Task
        const imageTask = (async () => {
            if (!data.includeImage) return null;
            try {
                console.log("🎨 Starting Image Pipeline...");
                const imagePrompt = await generateImagePrompt(data.topic, apiKey);
                console.log(`   📝 Image Prompt: ${imagePrompt}`);
                const imageBase64 = await generateBlogImage(imagePrompt, apiKey);
                if (imageBase64) {
                    console.log("   ✅ Image Generated Successfully");
                    return imageBase64;
                }
            } catch (e) {
                console.error("   ❌ Image Generation Failed:", e);
            }
            return null;
        })();

        // 2. Text Generation Task (Draft -> Refine)
        const textTask = (async () => {
            // B. Draft Generation
            const draft = await generateBlogPost(data, searchContext, apiKey, seoStrategy);

            // C. Editor Refinement
            console.log("🧐 [Phase 3] Editor: Refining content...");
            return await refinePost(draft, data.topic, apiKey);
        })();

        // Wait for both to finish
        const [coverImageUrl, refinedContent] = await Promise.all([imageTask, textTask]);

        // 3. Schema Generation (Fast)
        const schemaMarkup = generateJSONLD(null, refinedContent);

        // Post-processing: Append image if it exists
        let finalContent = refinedContent;
        if (coverImageUrl) {
            finalContent = `![Cover Image](${coverImageUrl})\n\n${refinedContent}`;
            console.log("   🧩 Final Content Assembled. Preview: " + finalContent.substring(0, 50) + "...");
        }

        // 3. Save to Database
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

        // 4. Return success response
        return {
            success: true,
            message: "AI가 글을 성공적으로 작성했습니다!",
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
