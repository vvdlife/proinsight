# 프로젝트 구조 및 아키텍처 규칙 (Project Structure Rules)

## 1. 기능 중심 아키텍처 (Feature-based Architecture)
- **원칙**: 코드는 기술적 유형(type)이 아닌 **기능(feature)** 을 기준으로 응집도 있게 모아야 합니다.
- **`src/features/[기능명]/`**:
  - 특정 도메인(예: 인증, 블로그 에디터, 결제)과 관련된 모든 코드는 이 폴더 아래에 위치해야 합니다.
  - **하위 구조**:
    - `components/`: 해당 기능에서만 사용되는 UI 컴포넌트
    - `hooks/`: 커스텀 훅
    - `utils/` 또는 `lib/`: 헬퍼 함수
    - `actions.ts`: 해당 기능 관련 Server Actions
    - `types.ts`: 타입 정의
- **금지 사항**: 기능을 `src/components`, `src/hooks` 등의 루트 폴더로 파편화하지 마십시오.

## 2. 공용 컴포넌트 (Shared UI)
- **`src/components/ui/`**: 
  - Shadcn/UI 컴포넌트나, 프로젝트 전반에서 재사용되는 "비즈니스 로직이 없는" 순수 UI 컴포넌트만 위치합니다.
  - 예: `Button`, `Dialog`, `PageHeader`
- **`src/components/common/`**:
  - UI 라이브러리는 아니지만 여러 기능에서 공통으로 사용되는 복합 컴포넌트가 있다면 이곳에 둡니다.

## 3. Server Actions & API
- **Server Actions 우선**: 
  - 폼 제출, 데이터 변형(Mutation) 등은 API Route(`src/app/api/`) 대신 **Server Actions**를 사용합니다.
  - Server Actions 파일은 관련 Feature 폴더 내의 `actions.ts`에 정의하거나, 공용의 경우 `src/actions/`에 위치시킵니다.
- **DTO 및 유효성 검사**:
  - 모든 Server Action은 Zod를 사용하여 입력 데이터를 검증해야 합니다.

## 4. 파일 및 폴더 네이밍
- **폴더**: `kebab-case` (예: `user-profile`)
- **컴포넌트 파일**: `PascalCase.tsx` (예: `UserProfileCard.tsx`)
- **함수/유틸 파일**: `camelCase.ts` (예: `calculateTax.ts`)
