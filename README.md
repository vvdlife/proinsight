# ProInsight 🚀

**ProInsight**는 전문가 수준의 블로그 게시글 작성을 자동화하는 AI 기반 웹 애플리케이션입니다.
기술, 경제, 보안 등 다양한 주제에 대해 심층적인 연구와 통찰력 있는 분석을 제공하며, SEO에 최적화된 콘텐츠를 생성합니다.

## ✨ 주요 기능

- **심층 연구 엔진 (Deep Research Engine)**: Tavily API를 활용하여 웹상의 최신 정보를 수집하고 팩트 체크를 수행합니다.
- **AI 기반 집필 파이프라인**:
  - **기획자 (Architect)**: 논리적인 목차 구성.
  - **작가 (Writer)**: 섹션별 상세 집필 (병렬 처리).
  - **디자이너 (Designer)**: 주제에 맞는 커버 이미지 자동 생성 (Gemini 3).
- **고급 콘텐츠 렌더링**:
  - Mermaid 다이어그램 (플로우차트, 프로세스) 지원.
  - 마크다운 테이블, 콜아웃, 코드 블록 하이라이팅.
- **강력한 에디터**: MDXEditor를 내장하여 생성된 글을 자유롭게 수정하고 포맷팅할 수 있습니다.
- **SEO 분석 및 내보내기**:
  - AI가 콘텐츠의 SEO 점수를 분석하고 개선 제안을 제공합니다.
  - 마크다운(.md) 및 PDF로 내보내기가 가능합니다.

## 🛠️ 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Clerk
- **AI Models**: Google Gemini 1.5 Pro / 3 Pro Preview

## 🚀 시작하기

### 1. 환경 변수 설정
`.env` 파일을 생성하고 다음 키를 설정하세요:
\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
TAVILY_API_KEY=...
POSTGRES_PRISMA_URL=...
\`\`\`

### 2. 설치 및 실행
\`\`\`bash
npm install
npx prisma generate
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 📚 배포
자세한 배포 방법은 [배포 가이드](./deployment_guide.md)를 참고하세요.
