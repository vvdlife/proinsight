import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

async function testImageGen() {
    console.log("Testing Image Generation (No Params)...");

    const modelsToTry = ["gemini-2.0-flash-exp", "imagen-3.0-generate-001", "gemini-3-pro-image-preview"];
    // Added gemini-2.0-flash-exp just in case image gen is rolled into it (multimodal)

    for (const modelName of modelsToTry) {
        console.log(`\n-----------------------------------`);
        console.log(`Attempting model: ${modelName}`);

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "A futuristic city with flying cars, cyberpunk style, 8k resolution";

            console.log("Sending request...");

            // No generationConfig
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });

            const response = await result.response;
            console.log("Response received.");

            const images = response.candidates?.[0]?.content?.parts?.filter(part => part.inlineData);
            if (images && images.length > 0) {
                console.log(`✅ SUCCESS with ${modelName}!`);
                return; // Stop on first success
            } else {
                console.log(`❌ No image inlineData found for ${modelName}.`);
                // console.log(JSON.stringify(response, null, 2));
            }

        } catch (error) {
            console.error(`❌ Failed with ${modelName}:`);
            console.error(error.message);
        }
    }
}

testImageGen();
