name: search-code-usage
description: 특정 컴포넌트, 커스텀 훅, Server Action, 또는 타입이 프로젝트 내에서 어떻게 참조되고 사용되는지 검색합니다.

instructions:
  - `grep` 또는 시스템에 설치된 텍스트 검색 명령어를 사용하여 전역 검색을 수행합니다.
  - 리팩토링이나 컴포넌트 수정 전, 해당 코드가 `src/features/`나 `src/app/`의 어느 위치에서 호출되고 있는지 영향도(Impact)를 파악할 때 사용합니다.
  - 테스트 코드나 빌드 산출물(`node_modules`, `.next`)에서의 검색은 제외하여 결과의 정확도를 높입니다.

examples:
  - "MarkdownEditor 컴포넌트가 사용된 모든 곳을 찾아줘."
  - "generate-post 액션 함수가 어느 UI에서 호출되는지 확인해줘."

command_suggestion: |
  grep -rnw "src" -e "<검색어>" --exclude-dir=node_modules --exclude-dir=.next