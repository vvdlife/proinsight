import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateBlogImage(prompt: string): Promise<string | null> {
    try {
        // User requested: gemini-3-pro-image-preview
        const imageModel = genAI.getGenerativeModel({
            model: "gemini-3-pro-image-preview",
            // Attempting to pass aspectRatio if SDK/Model supports it in generationConfig or similar
            // Note: Standard JS SDK might strictly type generationConfig. 
            // If unknown property, it might accept it or ignore it.
            // For now, will try to inject it if possible, otherwise rely on default.
            // "aspectRatio" is often a parameter for Imagen models.
        });

        // Some versions of the API/SDK pass params differently. 
        // We will stick to the standard generateContent for now.

        const result = await imageModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const response = await result.response;
        console.log("   📸 Image Gen Response Candidates:", response.candidates?.length);

        // Extract image
        // Checking candidates for inline data
        const images = response.candidates?.[0]?.content?.parts?.filter(part => part.inlineData);

        if (images && images.length > 0 && images[0].inlineData) {
            const image = images[0].inlineData;
            console.log(`   📸 Image InlineData Found. MimeType: ${image.mimeType}, Size: ${Math.round(image.data.length / 1024)}KB`);
            return `data:${image.mimeType};base64,${image.data}`;
        }

        console.log("   ⚠️ No inlineData found in image candidates.");
        return null;
    } catch (error) {
        console.error("Image Generation Service Error:", error);
        return null;
    }
}
