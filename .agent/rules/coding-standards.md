# TypeScript 및 코딩 표준 (Coding Standards)

## 1. 타입 안정성 (Type Safety)
- **No Any**: `any` 타입 사용을 엄격히 금지합니다. 알 수 없는 타입에는 `unknown`을 사용하고 적절한 타입 가드(Type Guard)를 거치십시오.
- **Interface 우선**: 객체 정의 시 `type` 별칭보다는 확장이 용이한 `interface`를 우선 사용합니다.
- **Strict Null Checks**: 모든 변수는 `null` 또는 `undefined`일 수 있음을 가정하고, 옵셔널 체이닝(`?.`)이나 Null 병합 연산자(`??`)를 적극 활용합니다.

## 2. 코드 가독성 및 스타일
- **조기 리턴 (Early Return)**: 깊은 중첩(Deep Nesting)을 피하기 위해, 조건이 맞지 않으면 함수 초입에서 즉시 반환합니다.
- **명명 규칙 (Naming)**:
  - 변수/함수: `camelCase` (동사로 시작, 예: `fetchUserData`)
  - 컴포넌트: `PascalCase`
  - 상수: `UPPER_SNAKE_CASE`
- **불변성 (Immutability)**: 데이터 변형을 피하고, `const`를 기본으로 사용합니다. 배열이나 객체 업데이트 시 전개 연산자(`...`)를 활용합니다.

## 3. 에러 처리 (Error Handling)
- **Silent Fail 금지**: `try-catch` 블록에서 에러를 단순히 `console.log`로 찍고 넘어가면 안 됩니다. 사용자에게 알리거나 상위로 전파(throw)해야 합니다.
- **Zod 활용**: 외부 데이터(API 응답, 폼 입력)는 반드시 Zod 스키마를 통해 런타임 유효성을 검증합니다.