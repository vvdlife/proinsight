# [Workflow] 새로운 기능 스캐폴딩 (New Feature Scaffolding)

새로운 비즈니스 기능(Feature)을 프로젝트에 추가할 때 사용하는 표준 절차입니다.
참조 규칙: `.agent/rules/02-layer-feature.md`

## 1. 디렉토리 구조 생성
개발할 기능의 이름을 영어 `kebab-case`로 정의하고, `src/features/[기능명]/` 아래에 다음 구조를 생성합니다.
- `/components`: 해당 기능 전용 UI 컴포넌트
- `/hooks`: 기능 전용 커스텀 훅
- `/utils`: 기능 전용 헬퍼 함수
- `actions.ts`: 데이터 변이(Mutation)를 위한 Server Actions 모음
- `types.ts`: Zod 스키마 및 타입스크립트 인터페이스

## 2. 라우트 연결 (필요시)
해당 기능이 독립적인 페이지를 가진다면, `src/app/` 아래에 디렉토리를 생성하고 `page.tsx` (Server Component)를 작성하여 기능 폴더의 컴포넌트를 Import 합니다.