
import NewPostClient from "./NewPostClient";

// 5분 타임아웃 (Vercel Serverless Function Limit 대응)
export const maxDuration = 300;

export default function NewPostPage() {
    return <NewPostClient />;
}
