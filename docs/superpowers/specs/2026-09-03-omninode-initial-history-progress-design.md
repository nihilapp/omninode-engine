# 옴니노드 초기 이력 정리와 진행 추적 설계

> 작성일: 2026-09-03

> 상태: 마스터 승인

## 목적

새 `nihilapp/omninode-engine` 저장소의 최초 커밋 전에 원본 Nuxt 템플릿의 작업 이력을 제거하고, 옴니노드의 설계·구현·검증 완료 여부를 공개적으로 추적할 기준 문서를 만든다. 저장소의 이름과 공개 소개도 옴니노드 제품에 맞게 정리한다.

## 작업 이력 정리

2026-09-03 이전 `docs/superpowers/` 문서 21개는 옴니노드 제품의 기획·설계·구현 이력이 아니라 원본 Nuxt 템플릿의 구축, 범용 레이아웃, composable, ORM 전환 작업을 기록한다. 현재 옴니노드 제품·작업 설계 문서에서는 이 문서들을 참조하지 않으며, 필요한 지속 규칙은 `AGENTS.md`와 최신 품질 기준선 문서에 반영돼 있다.

다음 문서를 삭제한다.

### 계획 문서

- `docs/superpowers/plans/2026-06-30-nuxt-template-bootstrap.md`
- `docs/superpowers/plans/2026-07-27-agent-guidance-implementation.md`
- `docs/superpowers/plans/2026-08-04-default-layout-sidebar.md`
- `docs/superpowers/plans/2026-08-04-query-composable-pinia.md`
- `docs/superpowers/plans/2026-08-04-site-config-navigation.md`
- `docs/superpowers/plans/2026-08-04-site-footer.md`
- `docs/superpowers/plans/2026-08-21-prisma-postgresql-transition.md`
- `docs/superpowers/plans/2026-08-21-redundant-direct-dependency-cleanup.md`
- `docs/superpowers/plans/2026-08-21-vue-query-composable.md`
- `docs/superpowers/plans/2026-08-21-vue-query-public-generics.md`
- `docs/superpowers/plans/2026-08-23-default-layout-panels.md`

### 설계 문서

- `docs/superpowers/specs/2026-07-27-agent-guidance-design.md`
- `docs/superpowers/specs/2026-08-04-default-layout-sidebar-design.md`
- `docs/superpowers/specs/2026-08-04-query-composable-pinia-design.md`
- `docs/superpowers/specs/2026-08-04-site-config-navigation-design.md`
- `docs/superpowers/specs/2026-08-04-site-footer-design.md`
- `docs/superpowers/specs/2026-08-20-vue-query-composable-design.md`
- `docs/superpowers/specs/2026-08-21-prisma-postgresql-transition-design.md`
- `docs/superpowers/specs/2026-08-21-redundant-direct-dependency-cleanup-design.md`
- `docs/superpowers/specs/2026-08-21-vue-query-public-generics-design.md`
- `docs/superpowers/specs/2026-08-23-default-layout-panels-design.md`

2026-09-03에 작성한 옴니노드 품질 기준선과 의존성·아이콘 정리의 설계·계획은 현재 제품 구현의 직접 근거이므로 유지한다.

## 프로젝트 식별 정보

- 패키지 이름은 `omninode-engine`으로 바꾼다.
- 사이트 제목은 `옴니노드`로 바꾼다.
- 사이트 설명과 키워드는 세계관·설정 문서·위키·관계 관리 제품을 설명하도록 바꾼다.
- `AGENTS.md`에서 현재 저장소를 범용 앱 템플릿으로 규정하는 문장을 옴니노드 프로젝트 규칙으로 바꾼다.

## 개발 진행 추적

`docs/work-design/omninode-progress.md`를 개발 진행의 단일 추적 기준으로 사용한다.

문서는 다음 내용을 가진다.

1. 현재 단계와 바로 다음 작업
2. 기획·설계·기반·제품 구현·검증 단계별 상태
3. 완료 판단 근거 문서와 검증 결과
4. 공개 가능한 날짜별 업데이트 이력
5. 최초 커밋과 원격 반영 여부

상태는 `대기`, `진행 중`, `검증 중`, `완료`, `보류`로 제한한다. 설계 완료와 구현 완료를 같은 상태로 합치지 않는다. 산출물과 검증 근거가 확인된 작업만 `완료`로 표시한다.

현재 제품 기능 구현은 시작 전이다. 요구사항, 사용자 스토리, 유스케이스, 데이터 플로우, 데이터 스키마 설계, 도메인 경계, 권한, 검증, 실패, 상태 전이, 라우트·API 설계와 공통 API 품질 기준선은 완료로 기록한다. Prisma 제품 스키마, 인증·세션, 권한 검사, 관리·공개 API와 페이지는 대기로 기록한다.

`docs/work-design/README.md`와 `AGENTS.md`는 이 문서를 공식 추적 기준으로 연결한다.

## 공개 README

`README.md`는 제품 소개 문서로만 사용한다.

포함 내용은 다음과 같다.

- 옴니노드가 해결하는 문제와 제품 설명
- 월드·프로젝트, 카테고리·템플릿, 문서·리비전, 위키링크·태그, 관계·관계도, 역할·권한, 공개 열람 기능
- 아직 정해지지 않은 운영 주소 `-`

다음 내용은 넣지 않는다.

- 프레임워크, 라이브러리, 데이터베이스 등 기술 스택
- 설치, 개발 서버, 빌드, 배포, 환경변수 등 인프라 설명
- 사용 방법과 명령어
- API나 내부 구조 설명
- 개발 진행률과 변경 이력

개발 진행률과 업데이트 이력은 README가 아니라 `docs/work-design/omninode-progress.md`에서 공개한다.

## 검증 기준

- 삭제 대상 21개가 남아 있지 않는다.
- 유지할 2026-09-03 옴니노드 설계·계획 6개가 존재한다.
- 옴니노드 제품·작업 설계 문서의 참조가 끊어지지 않는다.
- `package.json`, `site.config.ts`, `AGENTS.md`, `README.md`에 범용 템플릿 정체성이 남지 않는다.
- README에 기술 스택, 설치, 실행, 빌드, 배포, 환경변수, 사용법이 없다.
- README의 운영 주소는 `-`다.
- 진행 추적 문서가 완료와 대기 단계를 구분하고 현재·다음 작업과 업데이트 이력을 포함한다.
- 테스트, 린트, 타입 검사, 빌드와 Markdown 형식 검사가 통과한다.
- 커밋과 푸시는 이번 정리를 모두 검증한 다음 별도 단계에서 수행한다.
