import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateImagePrompt(
    topic: string, 
    apiKey: string, 
    customPrompt?: string,
    contentSummary?: string
): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image" });

    let prompt = `
You are an expert creative director and professional digital illustrator.
Your task is to create a detailed, highly descriptive English image prompt for a blog cover image.

[Blog Post Information]
- Topic: "${topic}"
${contentSummary ? `- Content Summary: "${contentSummary}"` : ""}

[Instructions for Prompt Design]
1. Analyze the core concept, mood, and subject of the blog post.
2. Design a single, cohesive visual scene that serves as a perfect metaphor or direct illustration of the topic. Avoid generic decorations; ensure every element in the image supports the core theme.
3. Do NOT default to "tech" style unless the topic is explicitly about technology. For finance, use metaphoric assets; for health, use clean and natural aesthetics, etc.
4. Describe:
   - The central subject or objects (shape, material, arrangement)
   - The background and environment
   - The color palette and lighting style (e.g. warm/cool tones, cinematic lighting, pastel, dark-mode)
   - The artistic style (e.g., modern 3D render, minimalist vector illustration, photorealistic, matte painting)
5. NEGATIVE CONSTRAINTS (Crucial):
   - Absolutely NO text, letters, logos, numbers, or dates.
   - No bovine/ox/buffalo/bull shapes.
    `;

    if (customPrompt) {
        prompt += `\n\n[User Custom Styling Instruction]\nApply the following style/direction to the design: "${customPrompt}". This instruction takes priority over other stylistic suggestions.`;
    }

    prompt += `\n\nReturn ONLY the generated image prompt text. Do not include introductory or concluding remarks.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Image Prompt Generation Error:", error);
        // Fallback prompt
        return `${topic} background, cinematic lighting, high quality, professional illustration`;
    }
}
