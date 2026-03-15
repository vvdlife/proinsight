# [Workflow] Prisma DB 마이그레이션 (Prisma Migration)

데이터베이스 스키마를 안전하게 변경하고 클라이언트를 동기화하는 절차입니다.
참조 규칙: `.agent/rules/04-layer-infrastructure.md`

## 1. 스키마 수정
- `prisma/schema.prisma` 파일을 수정합니다.
- 관계형 데이터(예: Post - SocialPost) 설정 시 삭제 무결성(`onDelete: Cascade`)이 잘 지정되었는지 점검합니다.

## 2. 마이그레이션 실행 및 클라이언트 생성
- 터미널에서 다음 명령을 순차적으로 실행하여 로컬 DB에 반영하고 TS 타입을 업데이트합니다.
  1. `npx prisma migrate dev --name <변경요약_kebab_case>`
  2. `npx prisma generate`

## 3. 검증
- 변경된 스키마 타입이 프로젝트 내(Server Actions 등)에서 에러를 발생시키지 않는지 `npm run lint` 등을 통해 확인합니다.