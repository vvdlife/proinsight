export async function sendTelegramMessage(chatId: string, message: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
        console.warn("TELEGRAM_BOT_TOKEN is not configured.");
        return { success: false, error: "Token not configured" };
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML', // Allows bolding and basic formatting
            }),
        });

        if (!response.ok) {
            const errList = await response.text();
            throw new Error(`Telegram API Error: ${errList}`);
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to send Telegram message", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
