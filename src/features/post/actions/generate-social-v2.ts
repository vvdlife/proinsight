"use server";

import { prisma } from "@/lib/db";
import { generateSocialContent } from "@/lib/services/ai";
import { revalidatePath } from "next/cache";

export type SocialPlatform = "instagram" | "twitter" | "linkedin";

export async function generateAndSaveSocialPosts(postId: string, postContent: string) {
    try {
        // 1. Check if posts already exist
        const existingPosts = await prisma.socialPost.findMany({
            where: { postId },
        });

        if (existingPosts.length > 0) {
            // If ANY exist, return them (or currently just return success so UI can fetch)
            // Implementation choice: We can support "Regenerate" by deleting old ones first?
            // For now, let's assume "Generate All" runs only if empty or explicitly requested.
            // But safety first: let's generate missing ones or overwrite if requested.
            // Simple v1: Generate all 3 in parallel and upsert.
        }

        // 2. Generate content for all 3 platforms in parallel
        const platforms: SocialPlatform[] = ["instagram", "twitter", "linkedin"];

        // Run AI generation in parallel
        const results = await Promise.all(
            platforms.map(async (platform) => {
                const result = await generateSocialContent(postContent, platform);
                return { platform, result };
            })
        );

        // 3. Save to DB (Transaction)
        await prisma.$transaction(
            results.map(({ platform, result }) => {
                if (!result.success || !result.data) {
                    throw new Error(`Failed to generate content for ${platform}`);
                }

                return prisma.socialPost.upsert({
                    where: {
                        postId_platform: {
                            postId,
                            platform,
                        },
                    },
                    update: {
                        content: result.data.content,
                        hashtags: result.data.hashtags,
                    },
                    create: {
                        postId,
                        platform,
                        content: result.data.content,
                        hashtags: result.data.hashtags,
                    },
                });
            })
        );

        revalidatePath(`/dashboard/post/${postId}`);
        return { success: true };

    } catch (error) {
        console.error("Failed to generate social posts:", error);
        return { success: false, message: "Soical content generation failed" };
    }
}
