// Path: src/lib/utils/markdown-to-html.ts
import showdown from 'showdown';

export function convertMarkdownToHtml(markdown: string): string {
    const converter = new showdown.Converter({
        tables: true,
        strikethrough: true,
        tasklists: true,
        openLinksInNewWindow: true,
        emoji: true,
        simpleLineBreaks: true, // Handle newlines as <br>
    });

    // Custom refinements can be added here
    let html = converter.makeHtml(markdown);

    // Add inline styles for basic rich text copy-paste compatibility (e.g. Naver Blog)
    html = html.replace(/<h1>/g, '<h1 style="font-size: 2em; font-weight: bold; margin-bottom: 20px;">')
        .replace(/<h2>/g, '<h2 style="font-size: 1.5em; font-weight: bold; margin-top: 30px; margin-bottom: 15px; padding-left: 10px; border-left: 5px solid #3b82f6;">') // Styled Blue Bar H2
        .replace(/<h3>/g, '<h3 style="font-size: 1.25em; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">')
        .replace(/<p>/g, '<p style="line-height: 1.8; margin-bottom: 1.2em;">')
        .replace(/<blockquote>/g, '<blockquote style="background: #f1f5f9; padding: 15px; border-left: 4px solid #94a3b8; color: #475569; margin: 20px 0;">')
        .replace(/<img /g, '<img style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px auto; display: block;" ');

    return html;
}
