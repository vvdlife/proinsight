name: read-prisma-schema
description: 프로젝트의 Prisma 데이터베이스 스키마 정의를 읽어와 모델 구조와 관계(Relations)를 파악합니다.

instructions:
  - `prisma/schema.prisma` 파일의 내용을 출력하여 데이터베이스 모델(Post, UserSettings, SocialPost 등)을 확인합니다.
  - Server Action을 작성하거나 폼(Form) 데이터를 다룰 때, 참조해야 할 필수 필드나 자료형(Type), 기본값(@default)을 정확히 파악하기 위해 사용합니다.
  - 데이터 모델의 무결성(예: Cascade 삭제) 조건이 어떻게 설정되어 있는지 확인할 때 트리거하십시오.

examples:
  - "현재 DB 스키마 구조를 보여줘."
  - "Post 모델과 SocialPost 모델의 관계가 어떻게 되어 있는지 확인해줘."

command_suggestion: |
  cat prisma/schema.prisma