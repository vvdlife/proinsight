"use server";

import { cookies } from "next/headers";

export type VerifyGateResult = {
    success: boolean;
    message?: string;
};

export async function verifyGate(password: string): Promise<VerifyGateResult> {
    const correctPassword = process.env.SITE_PASSWORD;

    if (!correctPassword) {
        console.error("SITE_PASSWORD is not set in environment variables.");
        return {
            success: false,
            message: "서버 설정 오류: 관리자 비밀번호가 설정되지 않았습니다.",
        };
    }

    if (password === correctPassword) {
        // Set access cookie
        // Valid for 1 year (365 days)
        const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        (await cookies()).set("site-access", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: expires,
            path: "/",
        });

        return { success: true };
    } else {
        return {
            success: false,
            message: "비밀번호가 일치하지 않습니다.",
        };
    }
}
