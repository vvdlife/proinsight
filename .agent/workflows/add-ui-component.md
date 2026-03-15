# [Workflow] UI 컴포넌트 추가 (Add UI Component)

UI 라이브러리(Shadcn/UI)를 활용하거나 커스텀 UI를 생성하는 절차입니다.
참조 규칙: `.agent/rules/03-layer-shared-ui.md`

## 1. 컴포넌트 위치 판별
- **공용/재사용 UI**: `src/components/ui/` 또는 `src/components/common/`에 배치합니다.
- **기능 종속 UI**: `src/features/[기능명]/components/`에 배치합니다.

## 2. Shadcn/UI 우선 적용
- 요청된 요소가 Shadcn에 존재한다면, 직접 만들지 말고 터미널 명령(`npx shadcn-ui@latest add [이름]`)을 실행하여 설치합니다.

## 3. 커스텀 컴포넌트 구현 원칙
- **스타일 병합**: Tailwind 클래스 충돌을 막기 위해 반드시 `lib/utils.ts`의 `cn()` 함수를 사용해 `className`을 처리합니다.
- **애니메이션**: 동적 요소는 `framer-motion`을 활용합니다.
- **순수성 유지**: 공용 UI 컴포넌트 내부에서는 데이터 패칭이나 Server Action을 직접 호출하지 않습니다.