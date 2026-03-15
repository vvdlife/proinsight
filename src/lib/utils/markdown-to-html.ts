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

    // Add inline styles for Tistory / Naver Blog rich text copy-paste compatibility
    html = html.replace(/<h1>/g, '<h1 style="font-size: 2em; font-weight: bold; margin-bottom: 24px; color: #111827; letter-spacing: -0.02em;">')
        .replace(/<h2>/g, '<h2 style="font-size: 1.5em; font-weight: bold; margin-top: 40px; margin-bottom: 20px; padding-left: 12px; border-left: 5px solid #2563eb; color: #1f2937; letter-spacing: -0.01em;">')
        .replace(/<h3>/g, '<h3 style="font-size: 1.25em; font-weight: bold; margin-top: 32px; margin-bottom: 16px; color: #374151;">')
        .replace(/<p>/g, '<p style="line-height: 1.8; margin-bottom: 1.5em; font-size: 16px; color: #333333; word-break: keep-all;">')
        .replace(/<blockquote>/g, '<blockquote style="background: #f8fafc; padding: 16px 20px; border-left: 4px solid #94a3b8; color: #475569; margin: 24px 0; font-style: normal; border-radius: 0 8px 8px 0;">')
        .replace(/<img /g, '<img style="max-width: 100%; height: auto; border-radius: 8px; margin: 32px auto; display: block;" ')
        .replace(/<ul>/g, '<ul style="padding-left: 24px; margin-bottom: 1.5em; list-style-type: disc; line-height: 1.8; color: #333333;">')
        .replace(/<ol>/g, '<ol style="padding-left: 24px; margin-bottom: 1.5em; list-style-type: decimal; line-height: 1.8; color: #333333;">')
        .replace(/<li>/g, '<li style="margin-bottom: 8px;">')
        .replace(/<strong>/g, '<strong style="color: #111827; font-weight: 700;">')
        .replace(/<table>/g, '<div style="overflow-x: auto; margin-bottom: 24px;"><table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 15px;">')
        .replace(/<\/table>/g, '</table></div>')
        .replace(/<th>/g, '<th style="background-color: #f1f5f9; padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">')
        .replace(/<td>/g, '<td style="padding: 12px 16px; border: 1px solid #e2e8f0; color: #334155;">');

    return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">${html}</div>`;
}
