
import { Attachment } from "../types/attachment";

export async function processFile(file: File): Promise<Attachment> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
            // Binary files -> Base64
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix (data:image/png;base64,)
                const base64Content = result.split(",")[1];
                resolve({
                    type: file.type as any,
                    content: base64Content,
                    name: file.name,
                    size: file.size
                });
            };
        } else {
            // Text files -> Plain Text
            reader.readAsText(file);
            reader.onload = () => {
                resolve({
                    type: "text/plain",
                    content: reader.result as string,
                    name: file.name,
                    size: file.size
                });
            };
        }

        reader.onerror = (error) => reject(error);
    });
}
