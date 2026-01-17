// Path: src/features/generator/actions/generate-post.ts
"use server";

import { generateBlogPost } from "@/lib/services/ai";
import { postSchema, PostFormValues } from "@/lib/schemas/post-schema";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export type GeneratePostResult = {
    success: boolean;
    message?: string;
    postId?: string;
    content?: string;
    errors?: Record<string, string[]>;
};

export async function generatePost(data: PostFormValues): Promise<GeneratePostResult> {
    const { userId } = await auth();
    if (!userId) {
        return {
            success: false,
            message: "로그인이 필요합니다.",
        };
    }
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
        // 2. Call AI Service
        const generatedContent = await generateBlogPost(data);

        // 3. Save to Database
        const post = await prisma.post.create({
            data: {
                topic: data.topic,
                content: generatedContent,
                tone: data.tone,
                status: "DRAFT",
                userId,
            },
        });

        // 4. Return success response
        return {
            success: true,
            message: "AI가 글을 성공적으로 작성했습니다!",
            postId: post.id,
            content: generatedContent,
        };
    } catch (error) {
        console.error("AI Generation Error:", error);
        return {
            success: false,
            message: "AI 글 생성 중 오류가 발생했습니다.",
        };
    }
}
