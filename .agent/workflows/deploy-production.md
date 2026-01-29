---
description: 프로덕션 배포 전 품질 점검 및 배포 명령을 실행하는 절차입니다.
---

# 프로덕션 배포 (Production Deployment)

배포 전에 반드시 아래의 품질 점검을 수행하여 에러를 사전에 방지합니다.

## 1. 사전 점검 (Pre-flight Check)

**Type Check**
타입스크립트 컴파일 오류가 없는지 확인합니다.
```bash
// turbo
npm run build
```
*(참고: Next.js의 `build` 명령은 타입 체크와 린트를 함께 수행합니다. 시간이 오래 걸린다면 `tsc --noEmit`만 별도로 수행할 수도 있습니다.)*

**Lint Check**
코드 스타일 및 잠재적 오류를 검사합니다.
```bash
// turbo
npm run lint
```

## 2. 환경 변수 확인
- 프로덕션 환경(Vercel 대시보드 등)에 새로운 환경 변수가 필요한 경우 미리 추가했는지 확인합니다.
- `.env` 파일의 변경 사항이 있다면 팀원 및 배포 환경과 동기화합니다.

## 3. 배포 실행 (Deployment)

Vercel을 사용하는 경우 CLI를 통해 배포하거나, GitHub Push를 통해 자동 배포를 트리거합니다.

**Vercel CLI 배포**
```bash
vercel deploy --prod
```
