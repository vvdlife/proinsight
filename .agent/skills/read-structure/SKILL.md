name: read-project-structure
description: 현재 프로젝트의 디렉토리 트리 구조를 스캔하여 파일 위치와 전반적인 아키텍처를 파악합니다.

instructions:
  - 프로젝트의 루트에서 디렉토리 구조를 출력합니다.
  - **제외 대상**: `node_modules`, `.git`, `.next`, `dist`, `build` 등 불필요한 시스템 폴더는 반드시 제외하여 노이즈를 줄입니다.
  - **깊이 제한**: 너무 깊은 구조는 한 번에 파악하기 어려우므로, 기본적으로 깊이(depth) 3~4 레벨까지만 탐색합니다.
  - 이 스킬을 사용하여, 사용자가 특정 파일을 찾지 못하거나 아키텍처에 대해 질문할 때 정확한 경로를 제시할 수 있습니다.

examples:
  - "현재 프로젝트의 폴더 구조를 보여줘."
  - "내가 만든 컴포넌트가 어디에 저장되어 있는지 확인해줘."
  - "src 폴더 내의 구조를 파악해서 아키텍처를 설명해줘."

command_suggestion: |
  # tree 명령어가 있다면 사용 (없다면 find 명령어 활용)
  tree -I "node_modules|.git|.next|dist" -L 4