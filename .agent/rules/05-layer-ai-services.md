# [Layer: AI Services] AI 및 외부 API 연동 레이어 규칙

**적용 범위:** `src/lib/services/` 하위 파일 (ai.ts, image-gen.ts, tts.ts 등)

## 1. 프롬프트와 비즈니스 로직의 분리
- LLM(Gemini, OpenAI 등)에 전달되는 프롬프트 문자열은 컴포넌트나 Server Action 내부에 하드코딩하지 마십시오.
- 복잡한 프롬프트는 별도의 상수 파일이나 서비스 함수 내부에 템플릿 리터럴로 캡슐화하여 관리하십시오.

## 2. 스트리밍(Streaming) 및 타임아웃 고려
- 긴 텍스트 생성이나 보이스(TTS) 생성 시 응답 지연이 발생할 수 있으므로, Vercel 환경의 타임아웃 제한(기본 15초~60초)을 인지하고 로직을 작성하십시오.
- 가능한 경우 사용자 경험을 위해 Vercel AI SDK(`@ai-sdk/...`) 등을 활용한 스트리밍 응답을 우선적으로 고려하십시오.

## 3. 에러 격리 (Graceful Degradation)
- AI API 호출은 Rate Limit(속도 제한)이나 외부 서버 오류가 발생하기 매우 쉽습니다.
- API 호출 실패 시 애플리케이션 전체가 다운되지 않도록 철저한 `try-catch`와 Fallback(대체) 메시지를 구현하십시오.