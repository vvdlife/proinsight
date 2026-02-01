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
    model: z.enum(["gemini-1.5-flash", "gemini-3-pro-preview"]).default("gemini-1.5-flash"),
});


export type PostFormValues = z.infer<typeof postSchema>;
