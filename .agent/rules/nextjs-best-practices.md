# Next.js 14+ (App Router) 베스트 프랙티스

## 1. 컴포넌트 아키텍처 (Server vs Client)
- **기본은 서버 컴포넌트**: 모든 컴포넌트는 기본적으로 **Server Component**로 작성합니다.
- **'use client' 사용 최소화**: `useState`, `useEffect`, 이벤트 리스너가 꼭 필요한 경우에만 파일 최상단에 `'use client'`를 선언합니다.
- **리프(Leaf) 패턴**: 클라이언트 컴포넌트는 가능한 한 트리의 끝부분(Leaf)으로 밀어내어, 서버 컴포넌트의 이점(번들 사이즈 감소, 초기 로딩 속도)을 유지합니다.

## 2. 데이터 패칭 (Data Fetching)
- **서버 사이드 패칭**: 가능한 한 서버 컴포넌트 내부에서 직접 데이터를 패칭합니다 (`async/await` 사용).
- **TanStack Query**: 클라이언트 사이드에서 폴링(polling)이나 무한 스크롤이 필요한 경우에만 TanStack Query를 사용합니다.
- **Server Actions**: 데이터 변형(Mutation - 생성, 수정, 삭제)은 API Route를 만들지 말고, **Server Actions**를 통해 직접 처리합니다.

## 3. 라우팅 및 레이아웃
- **로딩 및 에러 처리**: 각 페이지 디렉토리에 `loading.tsx`와 `error.tsx`를 구현하여 사용자 경험을 관리합니다.
- **레이아웃 중첩**: 공통 UI(헤더, 사이드바)는 `layout.tsx`를 활용하여 불필요한 리렌더링을 방지합니다.

## 4. 성능 최적화
- **이미지**: `next/image` 컴포넌트를 사용하여 자동으로 이미지를 최적화합니다. `width`와 `height`를 명시하여 Layout Shift를 방지합니다.
- **폰트**: `next/font`를 사용하여 폰트 로딩 시 깜빡임(FOIT/FOUT)을 방지합니다.