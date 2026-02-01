// Path: src/app/newsletter/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NewsletterToolbar } from "@/features/osmu/components/NewsletterToolbar";
import { convertMarkdownToHtml } from "@/lib/utils/markdown-to-html";

interface NewsletterPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    const post = await (prisma as any).post.findFirst({
        where: { id, userId },
    });

    if (!post) {
        notFound();
    }

    // Convert Markdown to HTML for the body
    const bodyHtml = convertMarkdownToHtml(post.content);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
            <NewsletterToolbar />

            {/* Email Container (Width 600px standard) */}
            <div
                id="newsletter-content"
                className="bg-white shadow-lg mx-auto overflow-hidden my-8"
                style={{ width: '600px', maxWidth: '100%', fontFamily: 'Helvetica, Arial, sans-serif' }}
            >
                {/* Email Header */}
                <div style={{ backgroundColor: '#111827', padding: '32px 24px', textAlign: 'center' }}>
                    <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>
                        PRO INSIGHT
                    </h1>
                    <p style={{ color: '#9ca3af', margin: '8px 0 0', fontSize: '14px' }}>
                        {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Hero Image */}
                {post.coverImage && (
                    <div style={{ width: '100%', height: 'auto' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={post.coverImage}
                            alt={post.topic}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>
                )}

                {/* Body Content */}
                <div style={{ padding: '40px 32px', color: '#374151', lineHeight: '1.6' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
                        {post.topic}
                    </h2>

                    {/* Rendered HTML Body */}
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />

                    {/* CTA Button */}
                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        <a
                            href="#"
                            style={{
                                display: 'inline-block',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '16px'
                            }}
                        >
                            Read Full Article
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ backgroundColor: '#f3f4f6', padding: '24px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                    <p style={{ margin: '0 0 8px' }}>
                        © {new Date().getFullYear()} ProInsight. All rights reserved.
                    </p>
                    <p style={{ margin: 0 }}>
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Unsubscribe</a>
                        {' • '}
                        <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>View in Browser</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
