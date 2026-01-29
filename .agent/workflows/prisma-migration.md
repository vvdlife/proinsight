---
description: Prisma 스키마 변경 및 데이터베이스 마이그레이션을 안전하게 수행하는 절차입니다.
---

# Prisma 데이터베이스 마이그레이션

데이터베이스 스키마를 변경해야 할 때 다음 절차를 따릅니다.

## 단계 (Steps)

1. **스키마 수정**
   - `prisma/schema.prisma` 파일을 열어 모델을 추가하거나 수정합니다.
   - 관계(Relation) 설정 시 인덱스와 외래 키 제약 조건을 확인합니다.

2. **클라이언트 생성 및 검증**
   - 스키마 변경 후 오류가 없는지 확인하기 위해 클라이언트를 재생성합니다.
   
```bash
npx prisma generate
```

3. **마이그레이션 파일 생성 및 적용 (Dev)**
   - 로컬 개발 환경 DB에 변경 사항을 적용하고 마이그레이션 기록을 생성합니다.
   - `<변경내용-요약>` 부분에는 변경 사항을 설명하는 영문 이름(kebab-case)을 입력합니다. (예: `add-user-profile`, `update-post-schema`)

```bash
npx prisma migrate dev --name <변경내용-요약>
```

4. **[프로덕션] 배포 시 마이그레이션**
   - **주의**: 이 단계는 로컬에서 직접 실행하지 않습니다.
   - 배포 파이프라인(Vercel 등)의 `Build Command` 또는 `Post Install Command`에 `prisma generate`가 포함되어 있는지 확인합니다.
   - 프로덕션 DB 마이그레이션은 보통 배포 과정의 일부로 `npx prisma migrate deploy`를 통해 수행됩니다.
