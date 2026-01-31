"use server";

import { prisma } from "@/lib/db";
import { generateSocialContent } from "@/lib/services/ai";
import { revalidatePath } from "next/cache";

export type SocialPlatform = "instagram" | "twitter" | "linkedin";

import { auth } from "@clerk/nextjs/server";

export async function generateAndSaveSocialPosts(postId: string, postContent: string) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, message: "Unauthorized" };
        }

        // Get API Key
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
            select: { apiKey: true },
        });
        const apiKey = settings?.apiKey || process.env.GOOGLE_GEMINI_API_KEY;

        if (!apiKey) {
            return { success: false, message: "API Key not found" };
        }

        // 1. Check if posts already exist
        const existingPosts = await prisma.socialPost.findMany({
            where: { postId },
        });

        if (existingPosts.length > 0) {
            // Logic to skip or regenerate could go here
        }

        // 2. Generate content for all 3 platforms in parallel
        const platforms: SocialPlatform[] = ["instagram", "twitter", "linkedin"];

        // Run AI generation in parallel
        const results = await Promise.all(
            platforms.map(async (platform) => {
                const result = await generateSocialContent(postContent, platform, apiKey);
                return { platform, result };
            })
        );

        // 3. Save to DB (Transaction)
        await prisma.$transaction(
            results.map(({ platform, result }) => {
                // If individual generation failed, we might want to log it but continue?
                // For now, adhere to strict success check or throw.
                // However, throwing breaks Promise.all if not caught.
                // But here result is the return value of generateSocialContent which throws on error.
                // Wait, generateSocialContent throws error. So Promise.all would have failed effectively if not handled.
                // Let's assume generateSocialContent ensures result or throws.

                // Oops, my generateSocialContent throws error on catch. 
                // So the entire generateAndSaveSocialPosts catch block will handle it.

                // But TypeScript doesn't know result shape might be error-like if I didn't return a "success: false" object from generateSocialContent?
                // generateSocialContent returns Promise<SocialContentResult>. It throws if failed.

                return prisma.socialPost.upsert({
                    where: {
                        postId_platform: {
                            postId,
                            platform,
                        },
                    },
                    update: {
                        content: result.content,
                        hashtags: result.hashtags,
                    },
                    create: {
                        postId,
                        platform,
                        content: result.content,
                        hashtags: result.hashtags,
                    },
                });
            })
        );

        revalidatePath(`/dashboard/post/${postId}`);
        return { success: true };

    } catch (error) {
        console.error("Failed to generate social posts:", error);
        return { success: false, message: "Social content generation failed" };
    }
}
