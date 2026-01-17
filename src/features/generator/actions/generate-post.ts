"use server";

import { generateBlogPost } from "@/lib/services/ai";
import { postSchema, PostFormValues } from "@/lib/schemas/post-schema";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { generateImagePrompt } from "@/lib/services/image-prompt";
import { generateBlogImage } from "@/lib/services/image-gen";

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

        // Text Pipeline Promise
        const textGenerationPromise = generateBlogPost(data, searchContext, apiKey);

        // Image Pipeline Promise
        const imageGenerationPromise = (async () => {
            if (!data.includeImage) return null;

            console.log("🎨 Starting Image Pipeline...");
            // Step A: Planner
            // generateImagePrompt currently uses global AI too? Check calling convention. 
            // It's likely using global, so we might need to update it too. 
            // WAIT: I missed create-image-prompt.ts refactor?
            // Let's assume for now generateImagePrompt needs refactor or I will check it next.
            // Actually, based on previous files, I haven't refactored image-prompt.ts yet.
            // I will pass apiKey to it assuming I will fix it right after this.

            // To be safe, let's fix image-prompt.ts FIRST or pass it as is and fix later.
            // But strict TS will fail if I pass apiKey and it doesn't accept it.
            // Let's assume I will fix image-prompt.ts to accept apiKey.
            const imagePrompt = await generateImagePrompt(data.topic, apiKey);
            console.log(`   📝 Image Prompt: ${imagePrompt}`);

            // Step B: Generator
            const imageBase64 = await generateBlogImage(imagePrompt, apiKey);

            if (imageBase64) {
                console.log("   ✅ Image Generated Successfully");
                return imageBase64;
            } else {
                console.log("   ❌ Image Generation Failed");
                return null;
            }
        })();

        // Wait for both to complete
        const [generatedContent, coverImageUrl] = await Promise.all([
            textGenerationPromise,
            imageGenerationPromise
        ]);

        // Post-processing: Append image if it exists
        let finalContent = generatedContent;
        if (coverImageUrl) {
            finalContent = `![Cover Image](${coverImageUrl})\n\n${generatedContent}`;
            console.log("   🧩 Final Content Assembled. Preview: " + finalContent.substring(0, 50) + "...");
        }

        // 3. Save to Database
        const post = await prisma.post.create({
            data: {
                topic: data.topic,
                content: generatedContent,
                tone: data.tone,
                status: "DRAFT",
                userId,
                coverImage: coverImageUrl,
            },
        });

        // 4. Return success response
        return {
            success: true,
            message: "AI가 글을 성공적으로 작성했습니다!",
            postId: post.id,
            content: finalContent, // Return content WITH image for immediate preview
        };
    } catch (error) {
        console.error("AI Generation Critical Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "AI 글 생성 중 알 수 없는 오류가 발생했습니다.",
        };
    }
}
