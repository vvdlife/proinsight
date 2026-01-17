// Path: src/app/dashboard/settings/[[...rest]]/page.tsx
import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 justify-center items-center w-full">
            <div className="w-full max-w-4xl flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">설정</h1>
                <p className="text-muted-foreground">계정 및 프로필 정보를 관리합니다.</p>
            </div>

            <UserProfile
                path="/dashboard/settings"
                routing="path"
                appearance={{
                    elements: {
                        rootBox: "w-full max-w-4xl shadow-none",
                        card: "w-full shadow-sm border",
                    }
                }}
            />
        </div>
    );
}
