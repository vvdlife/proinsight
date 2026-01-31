import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
    const { userId } = await auth();

    if (userId) {
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
            select: { apiKey: true },
        });

        // If API Key exists OR Env Key exists, no need for onboarding
        if (settings?.apiKey || process.env.GOOGLE_GEMINI_API_KEY) {
            redirect("/dashboard");
        }
    }

    return <OnboardingForm />;
}
