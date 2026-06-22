"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createSubscription, toggleSubscription, triggerInsightGeneration } from "@/features/insights/actions/manage-subscription";
import { Loader2, BellRing, BrainCircuit, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    subscription: any;
}

const WEEKDAYS = [
    { label: "월", value: "MON" },
    { label: "화", value: "TUE" },
    { label: "수", value: "WED" },
    { label: "목", value: "THU" },
    { label: "금", value: "FRI" },
    { label: "토", value: "SAT" },
    { label: "일", value: "SUN" },
];

export function SubscriptionConfigurator({ subscription }: Props) {
    const [isPending, startTransition] = useTransition();
    const [frequency, setFrequency] = useState(subscription?.frequency || "DAILY");
    const [selectedDays, setSelectedDays] = useState<string[]>(
        subscription?.preferredDays 
            ? subscription.preferredDays.split(",") 
            : ["MON"]
    );

    const toggleDay = (dayValue: string) => {
        setSelectedDays(prev => 
            prev.includes(dayValue) 
                ? prev.filter(d => d !== dayValue) 
                : [...prev, dayValue]
        );
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            try {
                const res = await createSubscription(formData);
                if (res.success) {
                    toast.success("구독 설정이 저장되었습니다.");
                } else {
                    toast.error(res.error || "구독 설정 저장에 실패했습니다.");
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
                } else {
                    toast.error(res.error || "상태 변경에 실패했습니다.");
                }
            } catch (error: any) {
                toast.error("상태 변경 실패: " + error.message);
            }
        });
    };

    const handleTestTrigger = () => {
        startTransition(async () => {
            try {
                toast.loading("테스트 리포트를 생성하고 발송 중입니다...", { id: "test-trigger" });
                const res = await triggerInsightGeneration();
                if (res.success) {
                    toast.success(res.message || "테스트 발송 성공!", { id: "test-trigger" });
                } else {
                    toast.error(res.error || "테스트 발송 중 오류가 발생했습니다.", { id: "test-trigger" });
                }
            } catch (error: any) {
                toast.error(error.message || "시스템 오류가 발생했습니다.", { id: "test-trigger" });
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="frequency">수신 주기</Label>
                            <Select 
                                name="frequency" 
                                value={frequency} 
                                onValueChange={setFrequency}
                            >
                                <SelectTrigger id="frequency">
                                    <SelectValue placeholder="주기 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAILY">매일 (Daily Briefing)</SelectItem>
                                    <SelectItem value="WEEKLY">매주 (Weekly Deep-dive)</SelectItem>
                                    <SelectItem value="MONTHLY">매월 (Monthly Strategy)</SelectItem>
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

                    {/* Dynamic Scheduler Options */}
                    <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 space-y-4 transition-all duration-300">
                        <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                            📅 발송 상세 스케줄 설정
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Time selector (all frequencies) */}
                            <div className="space-y-2">
                                <Label htmlFor="preferredTime">수신 시간 (한국 표준시 KST)</Label>
                                <Select 
                                    name="preferredTime" 
                                    defaultValue={String(subscription?.preferredTime ?? 8)}
                                >
                                    <SelectTrigger id="preferredTime" className="bg-background">
                                        <SelectValue placeholder="시간 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 }).map((_, i) => {
                                            let label = "";
                                            if (i === 0) label = "오전 12시 (00:00)";
                                            else if (i < 12) label = `오전 ${i}시 (${String(i).padStart(2, '0')}:00)`;
                                            else if (i === 12) label = "오후 12시 (12:00)";
                                            else label = `오후 ${i - 12}시 (${String(i).padStart(2, '0')}:00)`;
                                            
                                            return (
                                                <SelectItem key={i} value={String(i)}>
                                                    {label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Monthly day selector */}
                            {frequency === "MONTHLY" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Label htmlFor="preferredDayOfMonth">수신 일자</Label>
                                    <Select 
                                        name="preferredDayOfMonth" 
                                        defaultValue={String(subscription?.preferredDayOfMonth ?? 1)}
                                    >
                                        <SelectTrigger id="preferredDayOfMonth" className="bg-background">
                                            <SelectValue placeholder="일자 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 31 }).map((_, i) => (
                                                <SelectItem key={i + 1} value={String(i + 1)}>
                                                    매월 {i + 1}일
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Weekly days selector */}
                        {frequency === "WEEKLY" && (
                            <div className="space-y-3 pt-2 border-t border-primary/5 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Label>수신 요일 (다중 선택 가능)</Label>
                                <input type="hidden" name="preferredDays" value={selectedDays.join(",")} />
                                <div className="flex flex-wrap gap-2">
                                    {WEEKDAYS.map((day) => {
                                        const isSelected = selectedDays.includes(day.value);
                                        return (
                                            <Button
                                                key={day.value}
                                                type="button"
                                                variant={isSelected ? "default" : "outline"}
                                                onClick={() => toggleDay(day.value)}
                                                className={cn(
                                                    "w-11 h-11 p-0 rounded-lg font-semibold transition-all duration-200 text-sm",
                                                    isSelected 
                                                        ? "bg-primary text-primary-foreground shadow-sm scale-105 hover:bg-primary/95" 
                                                        : "bg-background hover:bg-accent hover:text-accent-foreground"
                                                )}
                                            >
                                                {day.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">선택하신 요일의 정해진 시간대에 리포트 분석이 수행됩니다.</p>
                            </div>
                        )}
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
                <CardFooter className="bg-muted/50 p-6 flex justify-between items-center rounded-b-xl border-t gap-4 flex-wrap">
                    <div className="flex items-center text-sm text-muted-foreground mr-auto">
                        <BellRing className="h-4 w-4 mr-2" />
                        결과는 대시보드 위젯에 전시됩니다.
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleTestTrigger}
                            disabled={isPending || !subscription} 
                            className="min-w-[140px]"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                            수동 생성 테스트
                        </Button>
                        <Button type="submit" disabled={isPending} className="min-w-[120px]">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {subscription ? "설정 업데이트" : "구독 시작하기"}
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
