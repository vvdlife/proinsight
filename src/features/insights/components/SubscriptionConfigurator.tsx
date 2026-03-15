"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createSubscription, toggleSubscription } from "@/features/insights/actions/manage-subscription";
import { Loader2, BellRing, BrainCircuit } from "lucide-react";

interface Props {
    subscription: any;
}

export function SubscriptionConfigurator({ subscription }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            try {
                const res = await createSubscription(formData);
                if (res.success) {
                    toast.success("구독 설정이 저장되었습니다.");
                }
            } catch (error: any) {
                toast.error("저장 실패: " + error.message);
            }
        });
    };

    const handleToggle = (checked: boolean) => {
        startTransition(async () => {
            try {
                const res = await toggleSubscription(checked);
                if (res.success) {
                    toast.success(checked ? "구독이 활성화되었습니다." : "구독이 일시 정지되었습니다.");
                }
            } catch (error: any) {
                toast.error("상태 변경 실패: " + error.message);
            }
        });
    };

    return (
        <Card className="max-w-xl shadow-md border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                        <CardTitle>AI 애널리스트 구독 설정</CardTitle>
                    </div>
                    {subscription && (
                        <div className="flex items-center gap-2">
                            <Label htmlFor="active-status" className="text-sm text-muted-foreground hidden sm:inline">
                                {subscription.isActive ? "수신 중" : "수신 정지"}
                            </Label>
                            <Switch 
                                id="active-status" 
                                checked={subscription.isActive}
                                onCheckedChange={handleToggle}
                                disabled={isPending}
                            />
                        </div>
                    )}
                </div>
                <CardDescription>
                    나만의 관심 주제와 투자 성향을 알려주시면, AI가 글로벌 뉴스를 심층 분석하여 정기 리포트를 배달합니다.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="topic">관심 테마 (프롬프트 키워드)</Label>
                        <Input 
                            id="topic" 
                            name="topic" 
                            placeholder="예: 미국 테크주, 비트코인 및 크립토, 글로벌 거시경제" 
                            defaultValue={subscription?.topic || "미국-이란 전쟁 등 중동 지정학적 리스크"}
                            required
                        />
                        <p className="text-xs text-muted-foreground">이 테마를 중심으로 월스트리트 뉴스 및 매크로 지표를 스크래핑합니다.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="frequency">수신 주기</Label>
                            <Select name="frequency" defaultValue={subscription?.frequency || "DAILY"}>
                                <SelectTrigger id="frequency">
                                    <SelectValue placeholder="주기 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAILY">매일 아침 (Daily Briefing)</SelectItem>
                                    <SelectItem value="WEEKLY">주간 심층 (Weekly Deep-dive)</SelectItem>
                                    <SelectItem value="MONTHLY">월간 전략 (Monthly Strategy)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="persona">애널리스트 성향</Label>
                            <Select name="persona" defaultValue={subscription?.persona || "NEUTRAL"}>
                                <SelectTrigger id="persona">
                                    <SelectValue placeholder="성향 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AGGRESSIVE">공격적 투자자 (위험 선호)</SelectItem>
                                    <SelectItem value="NEUTRAL">중립적 애널리스트 (객관적 팩트 위주)</SelectItem>
                                    <SelectItem value="DEFENSIVE">방어적 투자자 (가치/배당 중심)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <div className="px-6 pb-6 space-y-4">
                    <h4 className="text-sm font-semibold flex items-center text-muted-foreground">
                        <BellRing className="h-4 w-4 mr-1" />
                        외부 알림 설정 (Push Notifications)
                    </h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-4 border">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="receiveEmail">이메일 뉴스레터 수신</Label>
                                <p className="text-xs text-muted-foreground">매일/매주 발행 시 가입된 이메일로 리포트를 쏴드립니다.</p>
                            </div>
                            <Switch 
                                id="receiveEmail" 
                                name="receiveEmail" 
                                defaultChecked={subscription?.receiveEmail ?? true} 
                            />
                        </div>
                        <div className="space-y-2 pt-2 border-t">
                            <Label htmlFor="telegramChatId">텔레그램 챗 ID (선택)</Label>
                            <Input 
                                id="telegramChatId" 
                                name="telegramChatId" 
                                placeholder="예: 123456789" 
                                defaultValue={subscription?.telegramChatId || ""}
                            />
                            <p className="text-xs text-muted-foreground">
                                Telegram Bot @userinfobot 등을 통해 확인한 Chat ID를 입력하면 생성 완료 알림이 전송됩니다.
                            </p>
                        </div>
                    </div>
                </div>
                <CardFooter className="bg-muted/50 p-6 flex justify-between items-center rounded-b-xl border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <BellRing className="h-4 w-4 mr-2" />
                        결과는 대시보드 위젯에 전시됩니다.
                    </div>
                    <Button type="submit" disabled={isPending} className="min-w-[120px]">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {subscription ? "설정 업데이트" : "구독 시작하기"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
