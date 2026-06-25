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
3. Keep the visual themes strictly aligned with the blog's core target domains: **Finance, Economics, and Technology**.
   - Technology: Focus on abstract digital networks, cybersecurity concepts, futuristic data hubs, clean software wireframes, AI representations, or microelectronics.
   - Finance & Economics: Focus on trend indicators, abstract global market visualizations, assets, currency elements, or growth vectors.
   - Always prioritize clean, premium, and professional business-grade aesthetics (e.g., modern 3D render, high-end isometric illustration, minimalist vector design, or cinematic conceptual illustration).
4. Describe:
   - The central subject or objects (shape, material, arrangement)
   - The background and environment
   - The color palette and lighting style (e.g., corporate blues, vibrant gradients, warm/cool accents, dark-mode)
   - The artistic style (aligned with the premium professional themes)
5. NEGATIVE CONSTRAINTS (Crucial):
   - Absolutely NO text, letters, logos, numbers, or dates.
   - No bovine/ox/buffalo/bull shapes (even when illustrating financial market trends).
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
