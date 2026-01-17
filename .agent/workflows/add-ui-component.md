name: UI 컴포넌트 추가 (Add UI Component)
description: Shadcn/UI 라이브러리를 활용하거나 커스텀 UI 컴포넌트를 생성하여 디자인 시스템의 일관성을 유지합니다.

steps:
  1. **요구사항 분석 (Analyze)**
     - 요청된 컴포넌트가 Shadcn/UI(Radix UI) 공식 문서에 이미 존재하는지 확인합니다.
     - 존재한다면 직접 구현하는 대신 `npx shadcn-ui@latest add [컴포넌트명]` 명령어를 우선적으로 제안합니다.
     - 커스텀 컴포넌트가 필요한 경우, 필요한 Props, 상태(State), 그리고 변형(Variants)을 정의합니다.

  2. **위치 선정 (Determine Location)**
     - 프로젝트 전체에서 재사용되는 범용 컴포넌트(아토믹 수준) -> `src/components/ui/`
     - 특정 기능(Feature)에만 종속되어 사용되는 컴포넌트 -> `src/features/[기능명]/components/`

  3. **구현 (Implementation)**
     - **타입 정의**: 반드시 `interface`를 사용하여 Props 타입을 명확히 정의합니다.
     - **스타일링**: Tailwind CSS를 사용합니다. 외부에서 주입되는 클래스와의 충돌을 방지하기 위해 반드시 `lib/utils.ts`의 `cn()` (clsx + tailwind-merge) 함수를 사용하여 `className`을 병합 처리합니다.
     - **접근성(A11y)**: `button`, `input` 등 대화형 요소에는 적절한 ARIA 속성과 탭 인덱스(tabIndex)를 고려합니다.
     - **애니메이션**: 동적인 요소가 필요한 경우 `framer-motion`을 사용하여 자연스러운 전환 효과를 적용합니다.

  4. **검증 및 예시 (Verification)**
     - 컴포넌트가 올바르게 작동하는지 보여주는 간단한 사용 예시(Usage Example) 코드를 작성합니다.