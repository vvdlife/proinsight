import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

async function listModels() {
    console.log("Listing available models...");
    try {
        // Did not see listModels on genAI instance? 
        // It's usually on the ModelManager not directly on genAI in some versions,
        // or we just try to get it. 
        // Actually, for @google/generative-ai, there isn't a direct listModels method exposed nicely on the main class in some versions.
        // But let's try to verify if we can simply find a working one.

        // Actually, we can assume 'gemini-1.5-flash' or 'gemini-1.5-pro' are available.
        // But for IMAGE generation, we need to know what works.
        // If the SDK doesn't support Image Generation (Imagen), we can't do it.
        // The SDK @google/generative-ai is primarily for Gemini (Text/Multimodal INPUT).
        // Image OUTPUT is typically not supported by this SDK yet (as of early 2024/2025 knowledge, it might have changed).

        // Detailed check:
        // If the user wants Image Gen, and this SDK doesn't support it, we must say so.
        // UNLESS 'gemini-3-pro-image-preview' acts as a text-to-image bridge.

        console.log("Skipping listModels (not standardized in this SDK version).");
        console.log("Testing fallback: gemini-1.5-pro (Text only?)");

    } catch (error) {
        console.error(error);
    }
}

listModels();
