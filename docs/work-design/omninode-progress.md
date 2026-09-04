# 옴니노드 개발 현황

옴니노드의 설계와 구현이 어디까지 진행되었는지 공개적으로 기록한다. 설계 완료와 실제 기능 구현 완료를 구분하며, 구현 항목은 산출물과 검증 결과가 모두 확인된 경우에만 완료로 표시한다.

## 현재 요약

- 현재 단계: 최초 커밋 준비
- 현재 작업: 검증을 마친 초기 저장소의 최초 커밋 준비
- 다음 작업: 최초 커밋과 원격 저장소 푸시
- 제품 기능 구현: 시작 전

## 상태 기준

- `대기`: 선행 작업이 끝나지 않았거나 아직 시작하지 않은 상태
- `진행 중`: 산출물을 작성하거나 구현하고 있는 상태
- `검증 중`: 산출물은 있으나 완료 기준 검증이 남은 상태
- `완료`: 산출물과 필요한 검증을 모두 확인한 상태
- `보류`: 외부 조건이나 별도 결정이 필요해 의도적으로 멈춘 상태

## 진행 현황

| ID | 구분 | 작업 | 상태 | 완료 기준 또는 근거 |
| --- | --- | --- | --- | --- |
| PLAN-01 | 제품 설계 | 요구사항 결정과 사용자 스토리 | 완료 | [요구사항 결정](../project-design/2026-08-29-omninode-requirements-decisions.md), [사용자 스토리](../project-design/2026-08-29-omninode-user-stories.md) |
| PLAN-02 | 제품 설계 | 유스케이스와 데이터 플로우 | 완료 | [유스케이스](../project-design/2026-08-30-omninode-use-cases.md), [데이터 플로우](../project-design/2026-08-29-omninode-user-story-data-flow.md) |
| PLAN-03 | 제품 설계 | 데이터 스키마 구상과 교차 점검 | 완료 | [데이터 스키마 구상](../project-design/2026-08-29-omninode-data-schema.md), [교차 점검](./2026-08-30-data-schema-cross-check.md) |
| PLAN-04 | 제품 설계 | 도메인 책임, 권한, 검증, 실패, 상태 전이 | 완료 | [도메인 책임](../project-design/2026-08-30-omninode-domain-responsibilities.md), [권한](../project-design/2026-08-30-omninode-permission-matrix.md), [검증](../project-design/2026-08-30-omninode-validation-rules.md), [실패](../project-design/2026-08-30-omninode-failure-conditions.md), [상태 전이](../project-design/2026-08-30-omninode-state-transitions.md) |
| PLAN-05 | 제품 설계 | 33개 페이지 역할과 복수형 API 설계 | 완료 | [라우트·API 설계](../project-design/2026-09-03-omninode-route-api-design.md), [추적성 검증](./2026-09-03-route-api-design-documentation.md) |
| BASE-01 | 개발 기반 | 공통 API 응답·요청 및 데이터 질의 기반 | 완료 | [품질 기준선 복구 계획](../superpowers/plans/2026-09-03-quality-baseline-recovery.md)에 따른 구현과 검증 완료 |
| BASE-02 | 개발 기반 | 의존성과 아이콘 기반 정리 | 완료 | [의존성·아이콘 정리 계획](../superpowers/plans/2026-09-03-dependency-icon-baseline-cleanup.md)에 따른 구현과 검증 완료 |
| REPO-01 | 저장소 | 초기 이력 정리와 프로젝트 정체성 정비 | 완료 | [초기 이력·진행 현황 정리 계획](../superpowers/plans/2026-09-03-omninode-initial-history-progress.md)에 따른 정리와 검증 완료 |
| REPO-02 | 저장소 | 최초 커밋과 원격 저장소 푸시 | 대기 | 로컬 검증 후 `master` 최초 이력을 원격에 게시 |
| DATA-01 | 데이터 | 제품 데이터 스키마 구현 설계와 계획 | 대기 | 확정 스키마를 실제 구현 단위로 분해하고 승인 |
| DATA-02 | 데이터 | 제품 데이터 스키마와 마이그레이션 구현 | 대기 | 스키마 구현, 마이그레이션 작성과 검증 |
| AUTH-01 | 기능 | 인증, 세션, 비밀번호, 초대, 탈퇴 | 대기 | 관리 API와 사용자 흐름 구현 및 검증 |
| PERM-01 | 기능 | 역할·권한 검사와 접근 제어 | 대기 | 메뉴, 직접 주소, API 권한 결과의 일치 검증 |
| MGMT-01 | 기능 | 관리 API | 대기 | 전역·월드·프로젝트 관리 기능 구현 및 검증 |
| PUBLIC-01 | 기능 | 공개 API | 대기 | 공개 탐색·검색 구현과 비공개 정보 차단 검증 |
| PAGE-01 | 기능 | 공개·인증·관리 페이지 | 대기 | 설계한 33개 페이지 역할 구현 및 검증 |
| QA-01 | 품질 | 25개 유스케이스 인수 검증 | 대기 | 페이지와 API의 유스케이스 추적 및 전체 인수 검증 |

## 저장소 공개 상태

- 로컬 Git 저장소: 초기화 완료
- 원격 저장소: `nihilapp/omninode-engine` 연결 완료
- 최초 커밋과 푸시: 대기
- 운영 주소: `-`

## 업데이트 이력

### 2026-09-03

- 요구사항부터 라우트·API까지 제품 설계를 완료했다.
- 공통 API 응답·요청과 데이터 질의 품질 기준선을 정비했다.
- 불필요한 의존성과 아이콘 사용 기반을 정리했다.
- 옴니노드와 관계없는 템플릿 작업 이력을 제거했다.
- 프로젝트 정체성과 공개 개발 현황 추적 체계를 정비했다.
