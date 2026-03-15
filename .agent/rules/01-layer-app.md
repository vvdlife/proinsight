# [Layer: App] 라우팅 및 페이지 레이어 규칙

**적용 범위:** `src/app/` 디렉토리 내의 모든 파일

## 1. 서버 컴포넌트 강제 (Server Components Default)
- 모든 페이지(`page.tsx`)와 레이아웃(`layout.tsx`)은 기본적으로 Server Component로 작성해야 합니다.
- 데이터 패칭은 컴포넌트 내부에서 `async/await`를 사용하여 직접 수행하십시오.

## 2. 클라이언트 지시자 최소화 ('use client')
- `useState`, `useEffect`, 브라우저 이벤트 리스너가 반드시 필요한 리프(Leaf) 노드 컴포넌트가 아닌 이상, 파일 최상단에 `'use client'` 지시자 사용을 금지합니다.

## 3. 라우트 상태 및 예외 처리
- 사용자 경험(UX) 향상을 위해 각 주요 라우트 경로에는 `loading.tsx`와 `error.tsx`를 반드시 구현하여 로딩 상태와 에러 화면을 렌더링해야 합니다.