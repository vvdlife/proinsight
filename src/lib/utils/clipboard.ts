// Path: src/lib/utils/clipboard.ts
export async function copyToClipboardAsRichText(html: string, plainText: string): Promise<boolean> {
    try {
        if (typeof ClipboardItem === "undefined") {
            // Fallback for older browsers
            console.warn("ClipboardItem not supported");
            await navigator.clipboard.writeText(plainText);
            return true;
        }

        const textBlob = new Blob([plainText], { type: "text/plain" });
        const htmlBlob = new Blob([html], { type: "text/html" });

        const clipboardItem = new ClipboardItem({
            "text/plain": textBlob,
            "text/html": htmlBlob,
        });

        await navigator.clipboard.write([clipboardItem]);
        return true;
    } catch (error) {
        console.error("Failed to copy rich text:", error);
        return false;
    }
}
