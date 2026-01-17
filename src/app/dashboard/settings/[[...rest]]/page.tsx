// Path: src/app/dashboard/settings/[[...rest]]/page.tsx
import { UserProfile } from "@clerk/nextjs";
import { ApiKeyForm } from "@/features/settings/components/api-key-form";
import { getApiKeyStatus } from "@/features/settings/actions/get-api-key-status";

export default async function SettingsPage() {
    const hasKey = await getApiKeyStatus();

    return (
        <div className="flex flex-col gap-8 justify-center items-center w-full py-8">
            <div className="w-full max-w-4xl flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">설정 (Settings)</h1>
                <p className="text-muted-foreground">AI 서비스 사용을 위한 API Key와 계정 정보를 관리합니다.</p>
            </div>

            {/* Custom AI Settings Section */}
            <div className="w-full max-w-4xl space-y-4">
                <ApiKeyForm hasKey={hasKey} />
            </div>

            {/* Clerk User Profile */}
            <UserProfile
                path="/dashboard/settings"
                routing="path"
                appearance={{
                    elements: {
                        rootBox: "w-full max-w-4xl shadow-none",
                        card: "w-full shadow-sm border",
                        navbar: "hidden", // Simplify UI by hiding extra Clerk navbar if needed
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        scrollBox: "p-0"
                    }
                }}
            />
        </div>
    );
}
