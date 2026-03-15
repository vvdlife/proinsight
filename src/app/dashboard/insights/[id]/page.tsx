import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
    params: { id: string };
}

export default async function InsightDetailPage({ params }: Props) {
    const report = await prisma.insightReport.findUnique({
        where: { id: params.id },
        include: { subscription: true }
    });

    if (!report) {
        notFound();
    }

    // In a real implementation, we would use a proper markdown parser like react-markdown
    // For MVP, we'll use a basic approach to preserve formatting
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <Link 
                href="/dashboard/insights" 
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                인사이트 대시보드로 돌아가기
            </Link>

            <header className="space-y-4 border-b pb-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {report.subscription.topic}
                    </span>
                    <span className="text-muted-foreground text-sm flex items-center">
                        <CalendarClock className="h-4 w-4 mr-1" />
                        {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                    {report.title}
                </h1>
                
                {report.audioUrl && (
                    <div className="pt-4">
                        <Button className="rounded-full shadow-lg hover:shadow-xl transition-all">
                            <PlayCircle className="h-5 w-5 mr-2" />
                            AI 팟캐스트 브리핑 듣기
                        </Button>
                    </div>
                )}
            </header>

            {report.summary && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">✓</span>
                        핵심 요약 (Key Takeaways)
                    </h3>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                        {report.summary}
                    </p>
                </div>
            )}

            <article className="prose prose-slate max-w-none dark:prose-invert">
                {/* 
                  MVP: Simple white-space pre-wrap for the markdown.
                  In production, we should map standard markdown (Showdown/React-Markdown) and Mermaid rendering here.
                */}
                <div className="whitespace-pre-wrap leading-[1.8] font-medium text-zinc-800 dark:text-zinc-200">
                    {report.content}
                </div>
            </article>
        </div>
    );
}
