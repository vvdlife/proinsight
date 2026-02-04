import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardSidebar } from "@/features/dashboard/components/DashboardSidebar";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (userId) {
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
            select: { apiKey: true },
        });

        // If no API Key and no Env Key fallback, redirect to onboarding
        if (!settings?.apiKey && !process.env.GOOGLE_GEMINI_API_KEY) {
            redirect("/onboarding");
        }
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[16rem_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex-1">
                        <DashboardSidebar />
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 w-64">
                            <DashboardSidebar />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Mobile Header Title or Search could go here */}
                        <span className="font-semibold">ProInsight AI</span>
                    </div>
                </header>

                <div className="hidden md:block">
                    <DashboardHeader />
                </div>

                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
