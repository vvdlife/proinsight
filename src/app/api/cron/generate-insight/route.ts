import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateInsightContent } from "@/lib/services/insight-generator";

// Allow execution for up to 5 minutes (Pro plan max)
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Find all active subscriptions
        const subscriptions = await prisma.insightSubscription.findMany({
            where: { isActive: true },
            // In a real app we'd filter by due date based on Frequency
            // e.g. only run DAILY ones today if not run today
        });

        const results = [];

        // For MVP: Process sequentially to avoid rate limits
        for (const sub of subscriptions) {
            try {
                // Generate content using Tavily + Gemini
                const reportContent = await generateInsightContent(sub.topic, sub.persona);
                
                // Save to database
                const report = await prisma.insightReport.create({
                    data: {
                        subscriptionId: sub.id,
                        userId: sub.userId,
                        title: reportContent.title,
                        content: reportContent.content,
                        summary: reportContent.summary,
                    }
                });

                results.push({ subscriptionId: sub.id, status: "success", reportId: report.id });
            } catch (err: any) {
                console.error(`Error generating insight for sub ${sub.id}:`, err);
                results.push({ subscriptionId: sub.id, status: "failed", error: err.message });
            }
        }

        return NextResponse.json({
            message: "Insight generation completed",
            processed: subscriptions.length,
            results
        });

    } catch (error: any) {
        console.error("Cron Generate Insight Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
