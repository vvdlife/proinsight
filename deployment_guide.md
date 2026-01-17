# ProInsight 배포 가이드 (Vercel + Postgres)

이 가이드는 ProInsight 애플리케이션을 Vercel에 배포하고 Postgres 데이터베이스를 연결하는 방법을 안내합니다.

## 1. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 접속합니다.
2. **Add New...** > **Project**를 클릭합니다.
3. GitHub 레포지토리를 연결하고 `Import`를 클릭합니다.

## 2. 데이터베이스 생성 (Vercel Postgres)

1. 프로젝트 대시보드에서 **Storage** 탭으로 이동합니다.
2. **Connect Store** > **Create New** > **Postgres**를 선택합니다.
3. 데이터베이스 이름(예: `pro-insight-db`)과 지역(Region)을 선택하고 **Create**를 클릭합니다.
4. 생성이 완료되면 **.env.local** 탭을 클릭하여 환경 변수들을 확인합니다.
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

   Vercel이 이 변수들을 프로젝트 환경 변수에 자동으로 추가했을 것입니다. **Settings** > **Environment Variables**에서 확인할 수 있습니다.

## 3. 환경 변수 등록 (Environment Variables)

**Settings** > **Environment Variables**로 이동하여 다음 변수들을 추가로 등록해야 합니다.

| 키 | 설명 | 예시 |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk 비밀 키 | `sk_test_...` |
| `GEMINI_API_KEY` | Google Gemini API 키 | `AIza...` |
| `NEXT_PUBLIC_APP_URL` | 배포된 앱의 도메인 | `https://your-project.vercel.app` |

> **주의**: `DATABASE_URL` 등 Postgres 관련 변수들은 Vercel Postgres 생성 시 자동으로 추가되므로 별도로 추가할 필요가 없습니다.

## 4. 로컬 환경에서 Vercel DB 연결 (선택 사항)

로컬 개발 환경(`npm run dev`)에서도 Vercel의 Postgres를 사용하고 싶다면:

1. Vercel 대시보드에서 `.env.local` 탭의 내용을 복사합니다.
2. 로컬 프로젝트의 `.env` 파일 내용을 교체합니다.
3. 다음 명령어로 스키마를 DB에 반영합니다:
   ```bash
   npx prisma db push
   ```
   (이제 로컬의 `dev.db`는 사용되지 않습니다.)

## 5. 배포 확인

1. 모든 설정이 완료되면 Vercel이 자동으로 빌드 및 배포를 진행합니다.
2. 빌드 로그에서 `postinstall` 스크립트(`prisma generate`)가 실행되는지 확인하세요.
3. 배포된 URL로 접속하여 로그인, 글 생성, 저장, 삭제 기능이 정상 동작하는지 테스트합니다.
