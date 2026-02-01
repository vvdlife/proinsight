// Path: src/lib/services/scraper.ts
import * as cheerio from 'cheerio';

export interface ScrapedContent {
    success: boolean;
    url: string;
    title?: string;
    description?: string;
    content?: string;
    error?: string;
}

/**
 * Scrapes the given URL and extracts the main content text.
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
    try {
        const response = await fetch(url, {
            headers: {
                // Mimic a real browser to avoid some bot blocks
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Remove clutter (Nav, Footer, Scripts, Styles, Ads)
        $('script, style, nav, footer, iframe, noscript, .ad, .advertisement, .sidebar, .menu').remove();

        // 2. Extract Metadata
        const title = $('head title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
        const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

        // 3. Extract Main Content
        // Try to find the main article container
        let contentEl = $('article');
        if (contentEl.length === 0) contentEl = $('main');
        if (contentEl.length === 0) contentEl = $('.content');
        if (contentEl.length === 0) contentEl = $('#content');
        if (contentEl.length === 0) contentEl = $('body'); // Fallback

        // Sanitize and extract text
        // Add newlines between paragraphs for better readability suitable for LLM
        contentEl.find('br').replaceWith('\n');
        contentEl.find('p, h1, h2, h3, h4, h5, h6, li, div').after('\n');

        const content = contentEl.text().replace(/\s+/g, ' ').trim().substring(0, 15000); // Limit to 15k chars for token safety

        return {
            success: true,
            url,
            title,
            description,
            content
        };

    } catch (error) {
        console.error("Scraping Error:", error);
        return {
            success: false,
            url,
            error: error instanceof Error ? error.message : "Unknown error during scraping"
        };
    }
}
