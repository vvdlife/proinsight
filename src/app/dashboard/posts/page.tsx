// Path: src/app/dashboard/posts/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import { DeletePostButton } from "@/components/delete-post-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const posts = await prisma.post.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">작성 기록</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>전체 게시글 ({posts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                            <div className="bg-muted rounded-full p-4">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">아직 작성된 글이 없습니다</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    새로운 통찰력을 세상에 공유해보세요.
                                </p>
                            </div>
                            <Button asChild variant="default" className="mt-4">
                                <Link href="/dashboard/new">첫 글 작성하기</Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">주제 (Topic)</TableHead>
                                    <TableHead>어조 (Tone)</TableHead>
                                    <TableHead>상태 (Status)</TableHead>
                                    <TableHead>생성일</TableHead>
                                    <TableHead className="text-right">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.topic}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {post.tone}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{post.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {post.createdAt.toLocaleDateString("ko-KR", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/dashboard/post/${post.id}`}>
                                                    <FileText className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeletePostButton id={post.id} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
