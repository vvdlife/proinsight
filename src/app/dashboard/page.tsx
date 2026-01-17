// Path: src/app/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, PlusCircle } from "lucide-react";
import { DeletePostButton } from "@/components/delete-post-button";

export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
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
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
                <Button asChild>
                    <Link href="/dashboard/new">
                        <PlusCircle className="mr-2 h-4 w-4" />새 글 작성
                    </Link>
                </Button>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>최근 생성 기록</CardTitle>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                            <div className="bg-muted rounded-full p-4">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">아직 생성된 글이 없습니다</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    AI 파트너와 함께 첫 번째 블로그 콘텐츠를 만들어보세요.
                                </p>
                            </div>
                            <Button asChild variant="default" className="mt-4">
                                <Link href="/dashboard/new">첫 번째 글 작성하기</Link>
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
                                {posts.map((post: any) => (
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
