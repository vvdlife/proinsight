# [Layer: Shared UI] 공용 UI 컴포넌트 레이어 규칙

**적용 범위:** `src/components/ui/` 및 `src/components/common/` 디렉토리 하위 파일

## 1. 순수 UI 원칙 (Pure Presentation)
- 이 계층에 속하는 컴포넌트(예: Button, Dialog, Card)는 비즈니스 로직, 데이터 패칭, 전역 상태 변이 로직을 절대 포함해서는 안 됩니다.
- 오직 전달받은 `props`에 의해서만 렌더링을 결정하는 순수 컴포넌트(Pure Component)로 작성하십시오.

## 2. Next.js 최적화 컴포넌트 강제 활용
- 이미지 렌더링 시에는 브라우저의 Layout Shift(CLS) 현상을 방지하기 위해 반드시 `next/image` 컴포넌트를 사용하십시오.
- 폰트 적용 시에는 깜빡임(FOIT) 방지를 위해 `next/font` 모듈을 의무적으로 활용하십시오.