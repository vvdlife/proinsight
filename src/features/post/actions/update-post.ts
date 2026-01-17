"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type UpdatePostResult = {
    success: boolean;
    message?: string;
};

export async function updatePost(postId: string, content: string): Promise<UpdatePostResult> {
    const { userId } = await auth();

    if (!userId) {
        return {
            success: false,
            message: "로그인이 필요합니다.",
        };
    }

    try {
        // Verify ownership
        const existingPost = await prisma.post.findFirst({
            where: {
                id: postId,
                userId: userId,
            },
        });

        if (!existingPost) {
            return {
                success: false,
                message: "게시글을 찾을 수 없거나 권한이 없습니다.",
            };
        }

        // Update content
        await prisma.post.update({
            where: {
                id: postId,
            },
            data: {
                content: content,
            },
        });

        revalidatePath(`/dashboard/post/${postId}`);
        return {
            success: true,
            message: "게시글이 성공적으로 수정되었습니다.",
        };
    } catch (error) {
        console.error("Update Post Error:", error);
        return {
            success: false,
            message: "게시글 수정 중 오류가 발생했습니다.",
        };
    }
}
