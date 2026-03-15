# [Workflow] 서버 액션 생성 (Create Server Action)

Next.js 환경에서 데이터를 안전하게 처리하기 위한 Server Action 작성 절차입니다.
참조 규칙: `.agent/rules/01-layer-app.md` & `.agent/rules/02-layer-feature.md`

## 1. 위치 지정
- 생성할 액션의 도메인에 맞는 `src/features/[기능명]/actions.ts` 파일을 열거나 생성합니다. (파일 최상단에 `'use server'` 선언 필수)

## 2. Zod 스키마 정의
- 외부(클라이언트)에서 들어오는 모든 입력값(Payload)에 대해 Zod 스키마를 작성하여 런타임 유효성을 철저히 검증합니다.

## 3. 로직 구현 및 에러 핸들링
- 데이터베이스 접근(Prisma) 또는 외부 API(Gemini, OpenAI) 호출 로직을 작성합니다.
- 에러 발생 시 `try-catch`로 잡고, 절대로 조용히 넘기지(Silent fail) 않으며 클라이언트가 이해할 수 있는 형태의 에러 객체를 반환하거나 상위로 전파(throw)합니다.