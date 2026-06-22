import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const report = await prisma.insightReport.findUnique({
            where: { id },
        });

        if (!report) {
            return new NextResponse("Insight report not found", { status: 404 });
        }

        // Format Markdown content with title at the top
        const markdownContent = `# ${report.title}\n\n${report.content}`;
        
        // Clean filename (replace spaces/special chars)
        const cleanTitle = report.title.replace(/[^\w\s-가-힣]/g, "").trim().replace(/\s+/g, "_");
        const filename = `${cleanTitle || "insight-report"}.md`;

        // Set response headers to force download
        const headers = new Headers();
        headers.set("Content-Type", "text/markdown; charset=utf-8");
        // Encode filename for non-ASCII characters support in Content-Disposition
        headers.set(
            "Content-Disposition",
            `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
        );

        return new NextResponse(markdownContent, {
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error("Failed to download insight report:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
