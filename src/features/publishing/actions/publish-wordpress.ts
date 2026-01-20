// Path: src/features/publishing/actions/publish-wordpress.ts
"use server";

import { convertMarkdownToHtml } from "@/lib/utils/markdown-to-html";

interface PublishWordPressParams {
    wpUrl: string;
    username: string;
    appPassword: string;
    postId: string; // Internal Post ID
    title: string;
    contentMarkdown: string;
    coverImageUrl?: string;
}

export async function publishToWordPress(params: PublishWordPressParams) {
    const { wpUrl, username, appPassword, title, contentMarkdown, coverImageUrl } = params;

    // Basic Validation
    if (!wpUrl || !username || !appPassword) {
        return { success: false, message: "워드프레스 연결 정보가 부족합니다." };
    }

    try {
        const baseUrl = wpUrl.replace(/\/$/, ""); // Remove trailing slash
        const authHeader = "Basic " + Buffer.from(`${username}:${appPassword}`).toString("base64");

        let featuredMediaId = 0;

        // 1. Upload Image (if exists)
        if (coverImageUrl) {
            try {
                // Fetch image from Vercel Blob (or DB URL)
                const imageRes = await fetch(coverImageUrl);
                if (!imageRes.ok) throw new Error("Failed to fetch image");
                const imageBuffer = await imageRes.arrayBuffer();
                const imageType = imageRes.headers.get("content-type") || "image/png";

                const filename = `cover-${Date.now()}.png`;

                const uploadRes = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
                    method: "POST",
                    headers: {
                        "Authorization": authHeader,
                        "Content-Type": imageType,
                        "Content-Disposition": `attachment; filename="${filename}"`
                    },
                    body: Buffer.from(imageBuffer)
                });

                if (!uploadRes.ok) {
                    const errText = await uploadRes.text();
                    console.error("WP Media Upload Failed:", errText);
                    // Continue without image is better than failing entirely? 
                    // Or fail? Let's log and continue.
                } else {
                    const mediaData = await uploadRes.json();
                    featuredMediaId = mediaData.id;
                }
            } catch (imgError) {
                console.warn("Image upload skipped due to error:", imgError);
            }
        }

        // 2. Convert Content
        const contentHtml = convertMarkdownToHtml(contentMarkdown);

        // 3. Create Post
        const postRes = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: contentHtml,
                status: "draft", // Publish as draft first for safety
                featured_media: featuredMediaId > 0 ? featuredMediaId : undefined
            })
        });

        if (!postRes.ok) {
            const err = await postRes.json();
            throw new Error(err.message || "Post creation failed");
        }

        const postData = await postRes.json();

        return {
            success: true,
            message: `워드프레스에 초안으로 발행되었습니다! (ID: ${postData.id})`,
            wpPostLink: postData.link
        };

    } catch (error) {
        console.error("WordPress Publish Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "워드프레스 발행 중 오류가 발생했습니다."
        };
    }
}
