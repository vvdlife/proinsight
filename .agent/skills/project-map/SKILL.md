name: project-map
description: 프로젝트의 전체적인 구조를 시각적인 트리 형태로 파악하여, 파일 간의 관계와 아키텍처를 이해합니다.

instructions:
  - `tree` 명령어를 사용하여 프로젝트 구조를 시각화합니다.
  - **핵심 파악**: 단순히 파일 목록만 나열하는 것이 아니라, `src/features`와 `src/app`의 관계를 분석하여 비즈니스 로직이 어디에 위치하는지 파악해야 합니다.
  - **노이즈 제거**: `node_modules`, `.next`, `.git`, `coverage` 등 개발 설정 폴더는 제외하고 출력합니다.
  - **맥락 유지**: 사용자가 "파일이 어디 있지?"라고 묻거나 새로운 기능을 추가하기 전에 이 스킬을 사용하여 적절한 위치를 먼저 탐색합니다.

command_suggestion: |
  tree src -I "node_modules|.git|.next|dist|coverage" --dirsfirst