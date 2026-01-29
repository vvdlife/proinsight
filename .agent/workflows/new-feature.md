---
description: 새로운 기능을 개발할 때 필요한 폴더 구조와 파일을 자동으로 생성합니다.
---

# 기능 개발 스캐폴딩 (Feature Scaffolding)

새로운 기능(Feature)을 추가할 때 이 워크플로우를 사용하여 표준화된 폴더 구조를 생성하세요.

## 단계 (Steps)

1. **기능 이름 정의**
   - 개발할 기능의 이름을 영어 `kebab-case`로 정의합니다. (예: `blog-editor`, `payment-gateway`)

2. **디렉토리 생성**
   - 아래 명령어를 사용하여 `src/features/` 아래에 필요한 디렉토리를 생성합니다.
   - `SafeToAutoRun`을 `true`로 설정하여 자동 실행 되도록 구성합니다.

```bash
mkdir -p src/features/<기능명>/components
mkdir -p src/features/<기능명>/hooks
mkdir -p src/features/<기능명>/utils
```

3. **기본 파일 생성**
   - `src/features/<기능명>/index.ts` (Barrel file - 필요한 경우)
   - `src/features/<기능명>/actions.ts` (Server Actions용 빈 파일)

4. **[옵션] 페이지 라우트 생성**
   - 해당 기능이 별도의 페이지를 가진다면 `src/app/` 아래에 라우트 폴더를 생성합니다.
