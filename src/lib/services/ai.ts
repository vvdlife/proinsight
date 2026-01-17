// Path: src/lib/services/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PostFormValues } from "@/lib/schemas/post-schema";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateBlogPost(data: PostFormValues): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are a professional tech blogger. Write a blog post in Markdown format based on the following details:

- **Topic**: ${data.topic}
- **Tone**: ${data.tone}
- **Keywords**: ${data.keywords || "N/A"}
- **Length**: ${data.length}
- **Include Image**: ${data.includeImage ? "Please suggest a prompt for an AI image generator at the end." : "No image needed."}

Structure the post with a clear title, introduction, body paragraphs with headings, and a conclusion.
Ensure the content is engaging, informative, and SEO-optimized.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
