// Path: src/lib/schemas/post-schema.ts
import { z } from "zod";

export const postSchema = z.object({
    topic: z
        .string()
        .min(5, { message: "주제는 최소 5자 이상이어야 합니다." }),
    keywords: z.string().optional(),
    tone: z.enum(["professional", "friendly", "witty"]),
    length: z.enum(["short", "medium", "long"]),
    includeImage: z.boolean(),
    rivalUrl: z.string().optional(), // Competitor analysis URL
    experience: z.string().optional(), // Personal experience/anecdote for E-E-A-T
    model: z.enum(["gemini-3.1-flash-lite-preview", "gemini-3.1-pro-preview"]).default("gemini-3.1-flash-lite-preview"),
});

export const sectionSchema = z.object({
    heading: z.string().min(1),
    key_points: z.array(z.string()),
}).passthrough(); // Allow extra properties just in case AI adds something

export const outlineSchema = z.object({
    title: z.string().min(1),
    sections: z.array(sectionSchema).min(1),
}).passthrough();

export type PostFormValues = z.infer<typeof postSchema>;
export type SectionValues = z.infer<typeof sectionSchema>;
export type OutlineValues = z.infer<typeof outlineSchema>;
