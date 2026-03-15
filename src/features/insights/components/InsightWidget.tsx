import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Headphones, ArrowRight, CalendarClock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface InsightReportWidgetProps {
    report: any; // Using any for brevity, should be Prisma InsightReport
    subscriptionTopic: string;
}

export function InsightWidget({ report, subscriptionTopic }: InsightReportWidgetProps) {
    if (!report) {
        return (
            <Card className="shadow-sm border-dashed bg-muted/20">
                <CardHeader className="pb-3 text-center">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <CardTitle className="text-lg">오늘의 리서치가 준비 중입니다</CardTitle>
                    <CardDescription>
                        투자 인사이트가 예약된 시간에 발행됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/insights">구독 설정 변경하기</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md border-primary/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-24 w-24 text-primary" />
            </div>
            
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="secondary" className="mb-2">
                            {subscriptionTopic}
                        </Badge>
                        <CardTitle className="text-xl md:text-2xl font-bold leading-tight">
                            {report.title}
                        </CardTitle>
                    </div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <CalendarClock className="h-3.5 w-3.5 mr-1" />
                    {new Date(report.createdAt).toLocaleDateString()} 발행
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="bg-primary/5 rounded-lg p-4 mt-2">
                    <h4 className="font-semibold text-sm text-primary mb-2">💡 Key Takeaways</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {report.summary || "본문에서 상세 인사이트를 확인하세요."}
                    </p>
                </div>
            </CardContent>
            
            <CardFooter className="flex gap-2 p-6 pt-0">
                <Button asChild className="flex-1">
                    <Link href={`/dashboard/insights/${report.id}`}>
                        전문 읽기 <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
                {report.audioUrl && (
                    <Button variant="secondary" size="icon" title="오디오 브리핑 듣기">
                        <Headphones className="h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
