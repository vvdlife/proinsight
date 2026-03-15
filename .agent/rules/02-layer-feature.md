# [Layer: Feature] 비즈니스 로직 및 도메인 레이어 규칙

**적용 범위:** `src/features/[기능명]/` 디렉토리 하위의 모든 파일

## 1. 도메인 응집도 (High Cohesion) 유지
- 특정 도메인(예: `generator`, `editor`, `post`)에 종속된 컴포넌트, 커스텀 훅, 유틸리티 함수는 절대 전역 폴더(`src/components` 등)로 파편화하지 마십시오.
- 해당 기능 폴더 내부(`src/features/[기능명]/components/` 등)에 안전하게 캡슐화해야 합니다.

## 2. API Route 제한 및 Server Actions 우선
- 데이터 생성, 수정, 삭제(Mutation) 로직을 위해 `src/app/api/` 경로에 새로운 API 엔드포인트를 생성하는 것을 지양하십시오.
- 대신, 해당 피처 폴더 내의 `actions.ts`에 정의된 **Server Actions**를 호출하여 직접 서버 사이드에서 데이터를 처리하십시오.

## 3. 폼(Form) 상태 관리 및 검증
- 클라이언트 컴포넌트에서 사용자 입력을 받는 Form을 구현할 때는 절대 `useState`로 개별 상태를 관리하지 마십시오.
- 반드시 `react-hook-form`을 사용하고, `@hookform/resolvers/zod`를 통해 Zod 스키마와 결합하여 유효성 검증을 처리하십시오.
- UI 렌더링은 `src/components/ui/form.tsx`에 정의된 Radix UI 기반의 Form 컴포넌트(`<Form>`, `<FormField>`, `<FormItem>`)를 활용하십시오.