// Path: src/lib/services/image-gen.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { put } from "@vercel/blob";

export async function generateBlogImage(prompt: string, apiKey: string): Promise<string | null> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using "gemini-3-pro-preview" or specific image model if available.
        // Assuming user has access or using updated Imagen integration if applicable.
        // For standard Gemini API, image generation model might be "imagen-3.0-generate-001" or similar
        // BUT per previous code "gemini-3-pro-image-preview" was used. Sticking to that.
        const imageModel = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

        const result = await imageModel.generateContent(prompt);
        const response = await result.response;

        // Check for inlineData
        const images = response.candidates?.[0]?.content?.parts?.filter(part => part.inlineData);

        if (images && images.length > 0 && images[0].inlineData) {
            const image = images[0].inlineData;

            // Convert Base64 string to Buffer
            const imageBuffer = Buffer.from(image.data, 'base64');
            const filename = `blog-cover-${Date.now()}.png`;

            // Upload to Vercel Blob
            const blob = await put(filename, imageBuffer, {
                access: 'public',
                contentType: image.mimeType,
            });

            console.log(`✅ Image uploaded to Vercel Blob: ${blob.url}`);
            return blob.url; // Return the Public URL
        }

        return null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
}
