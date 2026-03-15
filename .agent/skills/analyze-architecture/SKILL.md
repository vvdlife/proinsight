name: analyze-architecture
description: 프로젝트의 디렉토리 구조를 트리 형태로 스캔하여 파일 위치와 기능 중심 아키텍처(Feature-based Architecture)를 파악합니다.

instructions:
  - 프로젝트 루트에서 `tree` 명령어를 사용하여 구조를 시각화합니다.
  - **핵심 파악**: 단순히 파일을 나열하는 것을 넘어, `src/features/[기능명]` 폴더 내부의 캡슐화 상태와 `src/app`의 라우팅 관계를 분석해야 합니다.
  - **노이즈 제거**: `node_modules`, `.git`, `.next`, `dist`, `coverage` 등 불필요한 시스템 폴더는 반드시 제외합니다.
  - **깊이 제한**: 너무 깊은 탐색을 방지하기 위해 기본적으로 깊이(depth) 4단계(-L 4)까지만 탐색합니다.
  - 새로운 기능을 추가하거나 기존 파일의 위치를 찾지 못할 때 가장 먼저 이 스킬을 트리거하십시오.

examples:
  - "현재 프로젝트의 폴더 구조를 보여줘."
  - "게시물 생성 기능(post)과 관련된 컴포넌트들이 어디에 있는지 구조를 파악해줘."

command_suggestion: |
  tree src -I "node_modules|.git|.next|dist|coverage" -L 4 --dirsfirst