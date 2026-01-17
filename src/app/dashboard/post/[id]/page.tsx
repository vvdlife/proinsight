// Path: src/app/dashboard/post/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { CopyButton } from "@/components/copy-button";

interface PostDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

import { auth } from "@clerk/nextjs/server";

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
        <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button asChild variant="ghost" className="w-fit pl-0 hover:bg-transparent">
                    <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        목록으로 돌아가기
                    </Link>
                </Button>

                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{post.topic}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="capitalize">
                                {post.tone}
                            </Badge>
                            <span>•</span>
                            <span>
                                {post.createdAt.toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                    <CopyButton content={post.content} />
                </div>
            </div>

            {/* Content */}
            <div className="bg-card rounded-lg border p-6 md:p-10 shadow-sm min-h-[500px]">
                <MarkdownViewer content={post.content} />
            </div>
        </div>
    );
}
