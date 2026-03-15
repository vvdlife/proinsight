import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SubscriptionConfigurator } from "@/features/insights/components/SubscriptionConfigurator";
import { InsightWidget } from "@/features/insights/components/InsightWidget";

export const metadata = {
    title: "Insight Subscription | ProInsight",
};

export default async function InsightsPage() {
    const { userId } = await auth();
    if (!userId) {
        redirect("/sign-in");
    }

    // Get user's subscription
    const subscription = await prisma.insightSubscription.findUnique({
        where: { userId },
        include: {
            reports: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    const latestReport = subscription?.reports[0];

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">My Research Board</h1>
                <p className="text-muted-foreground">
                    나만의 투자 테마를 설정하고 정기적인 고품질 리포트를 받아보세요.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Settings */}
                <div className="col-span-1 lg:col-span-5 space-y-6">
                    <SubscriptionConfigurator subscription={subscription} />
                </div>

                {/* Right Column: Latest Insight & History */}
                <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">🔥 최신 발행 리포트</h2>
                        <InsightWidget report={latestReport} subscriptionTopic={subscription?.topic || "미구독"} />
                    </div>

                    {subscription?.reports && subscription.reports.length > 1 && (
                        <div className="space-y-4 mt-8">
                            <h2 className="text-xl font-semibold">📚 지난 리포트 모아보기</h2>
                            <div className="bg-card rounded-xl border shadow-sm divide-y">
                                {subscription.reports.slice(1).map((report: any) => (
                                    <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors flex justify-between items-center group cursor-pointer">
                                        <div>
                                            <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                {report.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            읽기 &rarr;
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
