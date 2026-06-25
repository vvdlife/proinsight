// Path: src/features/generator/actions/generate-post.ts
"use server";

import { generateBlogPost } from "@/lib/services/ai";
import { postSchema, PostFormValues, sectionSchema, outlineSchema } from "@/lib/schemas/post-schema";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { generateImagePrompt } from "@/lib/services/image-prompt";
import { generateBlogImage } from "@/lib/services/image-gen";
import { planSEOStrategy } from "@/lib/services/seo-planner";
import { generateJSONLD } from "@/lib/services/ai";
import { Attachment } from "@/lib/types/attachment";



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
        console.log(`✍️ [Phase 2] Writing content using ${data.model || "default"}...`);
        const content = await generateBlogPost(data, searchContext, apiKey, seoStrategy, data.model);

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

// Separate Action for Image (Kept for performance & Independent generation)
export async function generatePostImage(postId: string, topic?: string, customPrompt?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const settings = await prisma.userSettings.findUnique({ where: { userId }, select: { apiKey: true } });
    const apiKey = settings?.apiKey;
    if (!apiKey) return { success: false, message: "API Key not found" };

    try {
        console.log("🎨 [Separate Action] Designing cover image with enhanced context...");
        
        // Retrieve topic and content to build a context-rich prompt
        const post = await prisma.post.findUnique({
            where: { id: postId, userId },
            select: { topic: true, content: true }
        });
        if (!post) return { success: false, message: "Post not found" };

        const resolvedTopic = topic || post.topic;
        const contentSummary = post.content ? post.content.substring(0, 600) : "";

        const imagePrompt = await generateImagePrompt(resolvedTopic, apiKey, customPrompt, contentSummary);
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

// --- Zero-Timeout Architecture Actions ---

import { generateOutline, generateSection, Outline } from "@/lib/services/ai";

export async function generatePostStep1Outline(data: PostFormValues, searchContext?: string, attachments: Attachment[] = []): Promise<{ success: boolean; outline?: Outline; seoStrategy?: any; postId?: string; message?: string }> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const settings = await prisma.userSettings.findUnique({ where: { userId }, select: { apiKey: true } });
    if (!settings?.apiKey) return { success: false, message: "API Key not found" };

    try {
        // Early Post Creation (PREPARING) - Allows parallel image generation
        console.log("🆕 [Step 1] Creating Placeholder Post...");
        const post = await prisma.post.create({
            data: {
                topic: data.topic,
                content: "", // Placeholder
                tone: data.tone,
                status: "PREPARING", // New temporary status? Or keep DRAFT. DRAFT is fine.
                userId,
                coverImage: null,
            },
        });
        const postId = post.id;

        console.log("🧠 [Step 1] SEO Strategy & Outline...");
        const seoStrategy = await planSEOStrategy(data.topic, settings.apiKey);

        // Use selected model for outline
        // Note: generateOutline is now exported from ai.ts
        const outline = await generateOutline(data, searchContext, settings.apiKey, data.model, seoStrategy, attachments);

        return { success: true, outline, seoStrategy, postId };
    } catch (e: any) {
        console.error("Step 1 Failed:", e);
        return { success: false, message: e.message || "Outline generation failed" };
    }
}

export async function generatePostStep2Section(
    data: PostFormValues,
    section: any,
    searchContext: string | undefined,
    model: string,
    attachments: Attachment[] = []
): Promise<{ success: boolean; content?: string; message?: string }> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    const settings = await prisma.userSettings.findUnique({ where: { userId }, select: { apiKey: true } });
    if (!settings?.apiKey) return { success: false, message: "API Key not found" };

    try {
        console.log(`✍️ [Step 2] Writing Section: ${section.heading}`);
        const content = await generateSection(data, section, searchContext, settings.apiKey, model, attachments);
        return { success: true, content };
    } catch (e: any) {
        console.error(`Step 2 Failed (${section.heading}):`, e);
        return { success: false, message: e.message || "Section generation failed" };
    }
}

export async function generatePostStep3Finalize(
    data: PostFormValues,
    outline: Outline,
    sectionContents: string[],
    seoStrategy: any,
    postId: string, // Requires postId now
    searchContext?: string,
    attachments: Attachment[] = []
): Promise<GeneratePostResult> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    // 🛡️ Security: Validate input payloads
    const formValidation = postSchema.safeParse(data);
    if (!formValidation.success) return { success: false, message: "Invalid form data provided." };

    const outlineValidation = outlineSchema.safeParse(outline);
    if (!outlineValidation.success) return { success: false, message: "Invalid outline strictly provided." };

    // Validate inputs lengths match
    if (sectionContents.length !== outline.sections.length) {
        return { success: false, message: "Mismatch between outline sections and generated contents." };
    }

    try {
        console.log("🧩 [Step 3] Assembling & Saving...");

        // Assemble content locally (Replicating generateBlogPost logic)
        const referenceMatch = searchContext?.matchAll(/\[(\d+)\] Title: (.*?)\nURL: (.*?)\n/g);
        let referencesSection = "\n\n## References\n";
        if (referenceMatch) {
            for (const match of referenceMatch) {
                referencesSection += `[${match[1]}] ${match[2]}: ${match[3]}\n\n`;
            }
        } else {
            referencesSection += "No references detected from search context.\n";
        }

        const disclaimer = `
> ⚖️ **Investment Disclaimer (투자 면책 고지)**
> 
> 본 콘텐츠는 제공자가 주식 시장의 공개된 지표와 매크로 데이터를 바탕으로 분석한 정보성 분석 글이며, 특정 종목에 대한 매수 또는 매도 추천을 목적으로 하지 않습니다. 
> 
> 본 글에 포함된 수치, 전망 및 분석 결과는 미래의 수익을 보장하지 않으며, 거시경제 환경 및 정부 정책(관세, 통화정책 등)의 변동에 따라 언제든지 달라질 수 있습니다. 모든 투자 결정의 최종 책임은 투자자 본인에게 있으며, 본 콘텐츠는 어떠한 경우에도 투자 결과에 대한 법적 책임 소지의 증빙자료로 사용될 수 없습니다. 보수적인 분할 매수 관점과 철저한 리스크 관리를 권장합니다.
`.trim();

        const finalContent = `
# ${outline.title}

${sectionContents.join("\n\n")}

${referencesSection}

---

${disclaimer}
`;

        const schemaMarkup = generateJSONLD(seoStrategy, finalContent);

        // Update existing Post instead of creating new one
        await prisma.post.update({
            where: { id: postId, userId },
            data: {
                content: finalContent,
                status: "DRAFT", // Ready for review
                schemaMarkup: schemaMarkup,
            },
        });

        return { success: true, postId: postId, content: finalContent, message: "글 생성이 완료되었습니다." };

    } catch (e: any) {
        console.error("Step 3 Failed:", e);
        return { success: false, message: e.message || "Finalization failed" };
    }
}
