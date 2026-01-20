// Path: src/app/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, ArrowRight, PenTool } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) return null;

    let recentPosts: any[] = [];
    let totalPosts = 0;
    let dbError = null;

    try {
        // Fetch only recent 5 posts
        recentPosts = await prisma.post.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        totalPosts = await prisma.post.count({
            where: { userId },
        });
    } catch (error) {
        console.error("🔥 Dashboard DB Error:", error);
        dbError = error instanceof Error ? error.message : "Unknown DB Error";
    }

    if (dbError) {
        return (
            <div className="p-8 text-red-500">
                <h1 className="text-xl font-bold">Database Connection Error</h1>
                <pre className="mt-4 p-4 bg-muted rounded text-sm overflow-auto">
                    {dbError}
                </pre>
                <p className="mt-4 text-sm text-gray-500">
                    Vercel Environment Variables (POSTGRES_PRISMA_URL)를 확인해주세요.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">안녕하세요! 👋</h1>
                    <p className="text-muted-foreground mt-2">오늘도 새로운 영감을 글로 남겨보세요.</p>
                </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-dashed border-2">
                    <Link href="/dashboard/new" className="flex flex-col items-center justify-center h-full py-6">
                        <PlusCircle className="h-8 w-8 text-primary mb-2" />
                        <span className="font-semibold">새 글 작성하기</span>
                        <span className="text-xs text-muted-foreground">AI 에이전트와 함께 시작</span>
                    </Link>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 작성 글</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPosts}</div>
                        <p className="text-xs text-muted-foreground">
                            지금까지 생성된 콘텐츠
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>최근 활동</CardTitle>
                            <CardDescription>최근 생성된 5개의 게시글입니다.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/posts" className="flex items-center">
                                전체 보기 <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentPosts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                아직 활동 내역이 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <PenTool className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium leading-none">{post.topic}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {post.createdAt.toLocaleDateString("ko-KR", {
                                                        year: "numeric", month: "long", day: "numeric"
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/post/${post.id}`}>열기</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
