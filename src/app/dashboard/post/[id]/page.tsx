import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Pencil, Save, X } from "lucide-react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { CopyButton } from "@/components/copy-button";
import { auth } from "@clerk/nextjs/server";
import { PostDetailClient } from "./post-detail-client";

interface PostDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
        return <div>Access Denied</div>;
    }

    const post = await (prisma as any).post.findFirst({
        where: {
            id,
            userId,
        },
    });

    if (!post) {
        notFound();
    }

    return (
        <>
            {post.schemaMarkup && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: post.schemaMarkup }}
                />
            )}
            <PostDetailClient post={post} />
        </>
    );
}

