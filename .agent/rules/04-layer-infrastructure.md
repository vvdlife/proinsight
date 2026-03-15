# [Layer: Infrastructure] 데이터베이스 스키마 및 연동 레이어 규칙

**적용 범위:** `src/lib/`, `prisma/` 디렉토리 하위 파일

## 1. 스키마 무결성 및 필드 일관성
- `Post` 스키마 갱신 시, 핵심 데이터(`topic`, `content`) 외에 Base64 이미지인 `coverImage`, `audioUrl`, SEO 분석을 위한 `schemaMarkup` 필드의 동기화를 잊지 마십시오.
- `UserSettings` 접근 시 Google Gemini(`apiKey`)와 OpenAI(`openaiApiKey`)의 API 키가 분리되어 관리됨을 인지하고 로직을 작성하십시오.

## 2. 관계형 데이터 종속성 관리 (Cascade)
- `SocialPost` 데이터는 항상 `Post` 스키마와 연결되어 있습니다.
- 상위 게시물(Post) 삭제 시 하위 소셜 포스트 레코드가 고아(Orphan) 데이터로 남지 않도록 `Cascade` 옵션이 정상적으로 유지되는지 확인하십시오.