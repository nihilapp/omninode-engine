# 옴니노드 프론트 라우트와 API 설계

> 분류: 프로젝트 설계
>
> 근거: 1차 기획, 사용자 스토리, 유스케이스, 데이터 플로우, 데이터 스키마, 도메인 책임, 권한 매트릭스, 검증 규칙, 실패 조건, 상태 정의 및 전이
>
> 범위: 프론트 페이지 역할과 경로, API 엔드포인트와 공통 계약을 정의한다. 화면 배치·컴포넌트 구현, API 핸들러 구현, ORM, 마이그레이션, 데이터베이스 변경은 포함하지 않는다.

## 설계 원칙

1. 프론트 라우트는 공개 열람, 인증, 전역 관리, 월드 관리, 프로젝트 작성 관리의 책임을 구분한다.
2. `/admin`, 월드, 프로젝트에는 각각 행동 중심 대시보드를 둔다. 대시보드는 할 일과 상태를 모으고 간단한 관리 행동을 직접 제공하며, 복잡한 편집은 전문 관리 페이지로 연결한다.
3. 계정·월드·프로젝트·초대·태그처럼 입력 구조가 단순한 대상은 대시보드나 목록의 대화상자·드로어에서 관리한다.
4. 템플릿·문서·관계의 편집과 문서 이동은 독립 페이지에서 처리한다.
5. API는 `/api/v1/auth`, `/api/v1/management`, `/api/v1/public` 네임스페이스로 구분한다. `auth`, `management`, `public`은 리소스가 아닌 영역명이다.
6. API 리소스 경로는 모두 복수형으로 작성한다. 단건 경로도 복수형 리소스 뒤에 식별자를 둔다.
7. 관리 API는 내부 UUID를 사용하고, 공개 API와 공개 프론트 경로는 월드·프로젝트 슬러그와 문서상 이름을 사용한다.
8. 목록 조회와 생성은 소유 범위 아래에 두고, 단건 조회·수정·삭제는 해당 리소스의 최상위 복수형 경로를 사용한다.
9. 복원·활성화·비활성화·이동·공개처럼 중요한 상태 전이는 복수형 사건 리소스로 분리한다.
10. 통합 휴지통, 일반 회원가입, 토론, 사용자용 백업·내보내기는 현재 범위에 포함하지 않는다.

## 프론트 라우트

### 공개 페이지

| 번호 | 경로 | 사용자 | 핵심 데이터 | 주요 행동 | 접근·권한 필터 | 주요 이동 경로 |
| --- | --- | --- | --- | --- | --- | --- |
| P-01 | `/` | 뷰어, 로그인 계정 | 공개 문서가 있는 월드, 전역 공개 문서 검색 결과, 공개 태그 후보 | 월드 탐색, 이름·태그·섹션 본문 검색 | 공개 리비전이 있는 문서와 그 범위만 노출 | 월드 페이지, 공개 문서 상세, 로그인 |
| P-02 | `/:worldSlug` | 뷰어, 로그인 계정 | 공개 월드 정보, 공개 문서가 있는 프로젝트 | 프로젝트 탐색 | 비공개·삭제 문서만 있는 프로젝트 제외 | 프로젝트 공개 페이지, 홈 |
| P-03 | `/:worldSlug/:projectSlug` | 뷰어, 로그인 계정 | 공개 프로젝트 정보, 공개 카테고리 트리, 공개 문서 목록 | 카테고리·태그·검색어로 문서 탐색 | 공개 문서가 있는 카테고리만 노출 | 공개 문서 상세, 월드 페이지 |
| P-04 | `/:worldSlug/:projectSlug/docs/[...documentName]` | 뷰어, 로그인 계정 | 선택 공개 리비전, 섹션 본문, 태그, 위키링크, 역링크, 관계, 관계도 | 공개 문서 읽기와 공개 연결 탐색 | 공개 리비전 한 건만 노출하며 비공개·삭제 연결은 상태 표기만 제공 | 연결된 공개 문서, 프로젝트 공개 페이지 |

공개 문서상 이름은 `docs` 뒤 최대 3개 경로 구간을 사용할 수 있다. 이 구간은 문서 이름 표현이며 폴더·카테고리·권한 계층이 아니다. 이름 변경 전 주소, 비공개·삭제 문서 주소, 존재하지 않는 주소는 리다이렉트 없이 404로 처리한다.

최상위 정적 라우트와 공개 월드 경로의 충돌을 막기 위해 `admin`, `signin`, `password`, `invitations`, `withdrawals`, `api`, `design`, `_nuxt`를 월드 슬러그 예약어로 관리한다. 예약어는 영문 대소문자를 구분하지 않고 검사하며, 이후 최상위 시스템 라우트가 추가되면 같은 중앙 목록에 추가한다.

### 인증·계정 페이지

| 번호 | 경로 | 사용자 | 핵심 데이터 | 주요 행동 | 접근·권한 필터 | 주요 이동 경로 |
| --- | --- | --- | --- | --- | --- | --- |
| P-05 | `/signin` | 미인증 관리자·부관리자·운영자 | 로그인 입력, 요청 출발 경로 | 로그인 | 탈퇴 진행·완료 계정은 일반 로그인 차단 | 원래 요청 경로, 비밀번호 변경, 관리 대시보드, 비밀번호 찾기 |
| P-06 | `/password/change` | 로그인 계정 | 임시 비밀번호 여부, 현재·새 비밀번호 입력 | 본인 비밀번호 변경 | 로그인 필수, 임시 비밀번호 계정은 다른 관리 기능보다 우선 | 원래 요청 경로, 관리 대시보드, 본인 계정 관리 |
| P-07 | `/password/forgot` | 미인증 계정 소유자 | 등록 이메일 입력 | 비밀번호 재설정 링크 요청 | 계정 존재 여부를 응답으로 구분하지 않음 | 로그인, 재설정 링크 안내 |
| P-08 | `/password/reset/[token]` | 재설정 링크 소유자 | 요청의 대기·완료·만료·무효 상태, 새 비밀번호 입력 | 유효한 대기 요청으로 비밀번호 재설정 | 유효 토큰만 변경 허용 | 로그인, 비밀번호 재설정 재요청 |
| P-09 | `/invitations/[token]` | 초대받은 기존·신규 계정 | 초대 월드, 프로젝트 범위, 세부 허가, 초대 상태 | 초대 확인·수락 | 기존 계정은 초대 이메일과 같은 계정 로그인 필수, 신규 계정은 유효 토큰으로 계정 생성 | 로그인, 임시 비밀번호 변경, 관리 대시보드 |
| P-10 | `/withdrawals/download/[token]` | 탈퇴 진행 계정의 링크 소유자 | 내려받기 링크 상태와 만료 시각 | Markdown·JSON ZIP 내려받기 | 일반 로그인 없이 유효한 전용 링크만 허용 | 링크 만료 안내, 링크 재발급 안내 |

### 전역 관리 페이지

| 번호 | 경로 | 사용자 | 핵심 데이터 | 주요 행동 | 접근·권한 필터 | 주요 이동 경로 |
| --- | --- | --- | --- | --- | --- | --- |
| P-11 | `/admin` | 운영자·관리자·부관리자 | 접근 가능한 월드·프로젝트, 대기 초대, 문서·관계 점검 대상 | 월드·프로젝트 진입, 허용된 간단한 생성·복구, 점검 작업 진입 | 현재 역할·범위·세부 허가에 따라 카드와 행동을 구성 | 월드·프로젝트 대시보드, 본인 계정, 운영자 계정 관리 |
| P-12 | `/admin/account` | 운영자·관리자·부관리자 | 본인 계정, 비밀번호 상태, 소유 월드별 승계 필요 여부 | 비밀번호 변경, 탈퇴 사전 확인과 확정 | 본인 계정만 관리 | 비밀번호 변경, 관리 대시보드 |
| P-13 | `/admin/accounts` | 운영자 | 관리자 계정 목록, 역할, 전역 월드 생성 허가 | 계정 생성, 역할·월드 생성 허가 변경 | 운영자 전용 | 전역 대시보드, 계정 관리 대화상자 |

### 월드 관리 페이지

| 번호 | 경로 | 사용자 | 핵심 데이터 | 주요 행동 | 접근·권한 필터 | 주요 이동 경로 |
| --- | --- | --- | --- | --- | --- | --- |
| P-14 | `/admin/worlds/[worldId]` | 운영자, 해당 월드 관리자 | 월드 정보, 프로젝트, 부관리자·초대, 태그, 관계 유형·관계 점검 현황 | 월드 수정·삭제·복구, 프로젝트 생성·삭제·복구, 관리 작업 진입 | 부관리자는 월드 관리 대시보드 접근 불가 | 전역 대시보드, 프로젝트 대시보드, 월드 전문 관리 페이지 |
| P-15 | `/admin/worlds/[worldId]/members` | 운영자, 해당 월드 관리자 | 부관리자 소속, 프로젝트 범위, 24개 허가, 초대, 권한 감사 이력 | 초대·재발송·취소, 권한 변경, 소속 해제, 이력 조회 | 부관리자 접근 불가 | 월드 대시보드, 초대·권한 대화상자 |
| P-16 | `/admin/worlds/[worldId]/tags` | 운영자, 해당 월드 관리자 | 정상·삭제 태그와 현재 사용 현황 | 태그 삭제·복구 | 부관리자는 문서 안 태그 입력만 가능하고 이 페이지 접근 불가 | 월드 대시보드, 관련 문서 목록 |
| P-17 | `/admin/worlds/[worldId]/relation-types` | 운영자, 해당 월드 관리자 | 936개 기본 관계 유형의 월드별 상태, 사용자 정의 관계 유형 | 검색·상태 필터, 활성화·비활성화·삭제·복구, 새 유형 진입 | 부관리자 접근 불가 | 월드 대시보드, 관계 유형 생성·상세 |
| P-18 | `/admin/worlds/[worldId]/relation-types/new` | 운영자, 해당 월드 관리자 | 관계 유형 이름, 역할, 허용 카테고리, 반복 규칙 | 사용자 정의 관계 유형 생성 | 관계 관리 권한 필수 | 관계 유형 목록·상세 |
| P-19 | `/admin/worlds/[worldId]/relation-types/[relationTypeId]` | 운영자, 해당 월드 관리자 | 관계 유형 구조, 사용 상태, 참조 관계 수 | 허용 범위 수정, 비활성화 영향 확인, 활성화·비활성화·삭제·복구 | 기본 유형 수정·삭제 불가, 사용된 사용자 정의 구조 변경 불가 | 관계 유형 목록, 관련 관계 목록 |
| P-20 | `/admin/worlds/[worldId]/relations` | 운영자, 해당 월드 관리자 | 정상·점검 필요·종료 관계, 유형과 참여 문서 | 검색·상태 필터, 새 관계 진입, 삭제 | 부관리자 접근 불가 | 월드 대시보드, 관계 생성·상세, 참여 문서 상세 |
| P-21 | `/admin/worlds/[worldId]/relations/new` | 운영자, 해당 월드 관리자 | 활성 관계 유형, 같은 월드의 문서 후보, 역할 규칙 | 2~4개 문서 관계 생성 | 활성 유형과 허용 카테고리·반복·중복 규칙 적용 | 관계 목록·상세 |
| P-22 | `/admin/worlds/[worldId]/relations/[relationId]` | 운영자, 해당 월드 관리자 | 참여자·역할, 시점, 설명, 관련 문서, 변경 이력 | 관계 수정·삭제, 카테고리 이동 영향 점검 완료 | 종료 관계는 조회만 가능하고 수정·복구 불가 | 관계 목록, 참여 문서 상세 |

### 프로젝트 작성 관리 페이지

| 번호 | 경로 | 사용자 | 핵심 데이터 | 주요 행동 | 접근·권한 필터 | 주요 이동 경로 |
| --- | --- | --- | --- | --- | --- | --- |
| P-23 | `/admin/projects/[projectId]` | 해당 프로젝트 범위의 운영자·관리자·부관리자 | 프로젝트 정보, 카테고리·템플릿·문서 현황, 공개 상태, 점검 대상 | 프로젝트 수정·삭제·복구, 허용된 간단한 생성, 전문 관리 진입 | 정보는 범위 안에서 읽고 행동은 대상별 세부 허가로 제한 | 전역·월드 대시보드, 카테고리·템플릿·문서 관리 |
| P-24 | `/admin/projects/[projectId]/categories` | 카테고리 허가가 있는 운영자·관리자·부관리자 | 최대 3단계 카테고리 트리, 순서, 사용·삭제·점검 상태, 템플릿 연결 | 생성·수정·삭제·복구·사용 전환, 순서·부모 이동, 템플릿 연결, 영향 점검 | 대상별 생성·수정·삭제 허가 적용 | 프로젝트 대시보드, 영향 문서·관계, 템플릿 상세 |
| P-25 | `/admin/projects/[projectId]/templates` | 템플릿 허가가 있는 운영자·관리자·부관리자 | 기본·사용자 정의 템플릿, 사용·삭제 상태, 현재 리비전 | 검색·상태 필터, 사용 전환·삭제·복구, 새 템플릿 진입 | 대상별 생성·수정·삭제 허가 적용 | 프로젝트 대시보드, 템플릿 생성·상세, 연결 카테고리 |
| P-26 | `/admin/projects/[projectId]/templates/new` | 템플릿 생성 허가가 있는 운영자·관리자·부관리자 | 첫 필수 섹션 `개요`, 선택 섹션 구조 | 템플릿과 최초 리비전 생성 | 섹션 코드 자동 생성, 필수 구조 검증 | 템플릿 목록·상세 |
| P-27 | `/admin/projects/[projectId]/templates/[templateId]` | 템플릿 범위의 운영자·관리자·부관리자 | 현재 구조, 섹션 코드, 리비전 목록, 연결 카테고리 | 새 리비전 저장, 과거 리비전 적용, 사용 전환·삭제·복구 | 시스템 기본 정의 수정 불가, 사용된 구조 제한 적용 | 템플릿 목록, 연결 카테고리, 영향 문서 |
| P-28 | `/admin/projects/[projectId]/documents` | 문서 범위의 운영자·관리자·부관리자 | 문서 목록과 공개·삭제·카테고리·태그·템플릿·이동 점검 상태 | 검색·필터, 새 문서 진입, 삭제·복구, 공개 작업 진입 | 대상별 생성·수정·삭제 허가 적용 | 프로젝트 대시보드, 문서 생성·상세·편집·이동 |
| P-29 | `/admin/projects/[projectId]/documents/new` | 문서 생성 허가가 있는 운영자·관리자·부관리자 | 활성 카테고리와 템플릿 구조, 문서 이름·시점·섹션·태그 입력 | 비공개 문서와 최초 리비전 생성, 명시적 저장 | 템플릿 없는 대분류·비활성 카테고리 선택 불가, 자동 임시 저장 없음 | 문서 목록·상세·편집 |
| P-30 | `/admin/projects/[projectId]/documents/[documentId]` | 문서 범위의 운영자·관리자·부관리자 | 현재 문서와 리비전 목록, 공개본, 태그, 위키링크·역링크, 관계·관계도 | 공개본 지정·교체·해제, 삭제·복구, 편집·이동·리비전 조회 진입 | 조회 범위와 문서 수정·삭제 허가를 분리 | 문서 목록·편집·이동·리비전·관계 상세 |
| P-31 | `/admin/projects/[projectId]/documents/[documentId]/edit` | 문서 수정 허가가 있는 운영자·관리자·부관리자 | 최신 템플릿 구조에 매핑한 현재 문서 상태, 섹션·시점·태그·위키링크 | 명시적 저장으로 새 리비전 생성, 이름 변경 | `baseRevisionId` 충돌 검사, 자동 임시 저장 없음 | 문서 상세·리비전 상세 |
| P-32 | `/admin/projects/[projectId]/documents/[documentId]/move` | 문서 수정 허가가 있는 운영자·관리자·부관리자 | 대상 카테고리·템플릿과 기존 섹션 비교 | 기존 섹션별 유지·삭제 결정 후 이동 리비전 생성 | 모든 섹션 결정을 마쳐야 저장 가능 | 문서 상세·편집 |
| P-33 | `/admin/projects/[projectId]/documents/[documentId]/revisions/[revisionId]` | 문서 범위의 운영자·관리자·부관리자 | 저장 당시 템플릿·이름·시점·섹션·태그·위키링크 | 과거 상태 조회, 현재 상태로 적용 | 문서 수정 허가가 있을 때만 적용 가능, 관계 현재 상태는 바꾸지 않음 | 문서 상세·편집 |

## 대시보드 책임

| 대시보드 | 공통 관리 정보 | 직접 제공하는 행동 | 전문 페이지로 넘기는 행동 |
| --- | --- | --- | --- |
| 전역 대시보드 | 접근 가능한 월드·프로젝트, 대기 초대, 문서·관계 점검 묶음 | 허용된 월드·프로젝트 생성, 삭제 항목 복구, 작업 범위 선택 | 계정 권한, 월드·프로젝트별 상세 관리 |
| 월드 대시보드 | 월드 상태, 프로젝트, 부관리자·초대, 태그, 관계 유형·관계 현황 | 월드 수정·삭제·복구, 프로젝트 생성·삭제·복구, 대기 초대 재발송·취소 | 세부 권한 편집, 태그 정리, 관계 유형·관계 편집 |
| 프로젝트 대시보드 | 프로젝트 상태, 카테고리·템플릿 구성, 공개·비공개·삭제 문서, 점검 대상 | 프로젝트 수정·삭제·복구, 권한이 있는 간단한 생성과 복구 | 카테고리 트리, 템플릿 구조, 문서 본문·이동·리비전 편집 |

대시보드는 별도 업무 상태를 저장하지 않는다. 기존 도메인 상태를 현재 계정의 권한으로 집계하고, 변경 행동은 각 도메인의 API를 그대로 사용한다.

## API 공통 계약

### 응답 구조

성공과 실패는 같은 키를 가지며 `details`도 항상 포함한다.

```ts
interface ApiResponse<TData, TDetails = unknown> {
  data: TData | null;
  error: boolean;
  code: string;
  message: string;
  details: TDetails | null;
}
```

1. 일반 성공에서 부가 정보가 없으면 `details`는 `null`이다.
2. 상태 전환 성공은 영향 수량과 경고를 `details`에 기록한다.
3. 실패 응답은 필드 오류, 충돌 리소스, 가능한 후속 행동을 `details`에 기록한다.
4. 목록 응답은 기존 `TListData` 구조를 `data`에 둔다. 페이지는 1부터 시작하고 기본 크기는 10, 최대 크기는 100이다.
5. 공통 목록 조건은 `page`, `pageSize`, `keyword`, `sort`다. 사용·삭제 상태는 물리 컬럼 대신 `usageStatus=enabled|disabled|all`, `deletionStatus=notDeleted|deleted|all`을 사용한다.
6. 생성·수정·삭제·상태 전환 성공은 변경된 리소스를 반환한다. JSON API에서는 본문 없는 204를 기본으로 사용하지 않는다.
7. 탈퇴 데이터 ZIP 내려받기만 JSON 공통 응답의 예외다.
8. 모든 API 성공·실패 응답은 HTTP 200으로 반환한다. 처리 결과는 HTTP 상태가 아니라 `error`, `code`, `message`, `details`로 구분한다.

### 오류와 충돌

| 오류 분류 | 적용 상황 | 대표 세부 코드·처리 |
| --- | --- | --- |
| 인증 실패 | 로그인하지 않았거나 인증이 유효하지 않음 | 로그인 페이지 이동에 사용할 인증 실패 코드 |
| 권한 실패 | 관리 범위 안의 대상이지만 해당 행동 허가가 없음 | 상태 변경 없이 권한 없음 처리 |
| 대상 없음 | 관리 범위 밖, 삭제된 상위 범위, 존재하지 않거나 공개할 수 없는 대상 | 대상 존재 여부를 추가로 노출하지 않음 |
| 충돌 | 활성 중복, 삭제 동명 항목, 상태·리비전 충돌 | `DELETED_DUPLICATE_EXISTS`, `REVISION_CONFLICT`와 가능한 후속 행동 제공 |
| 링크 상태 실패 | 초대·재설정·탈퇴 링크가 완료·만료·무효 상태 | 상태별 세부 코드를 제공하고 변경 금지 |
| 입력 검증 실패 | 입력 형식, 필수값, 참조 범위 검증 실패 | 필드별 오류를 `details.fieldErrors`로 제공 |

문서와 템플릿 저장 요청은 `baseRevisionId`를 포함한다. 현재 리비전이 달라졌으면 덮어쓰지 않고 `REVISION_CONFLICT`를 반환한다.

같은 이름의 삭제 항목이 있으면 최초 생성 요청은 `DELETED_DUPLICATE_EXISTS`와 삭제 항목 ID, `restore`·`createNew` 후속 행동을 반환한다. 새 생성을 선택하면 `conflictResolution: 'createNew'`를 포함해 다시 요청한다. 복구를 선택하면 해당 리소스의 `restorations` 엔드포인트를 사용한다.

클라이언트는 조회·변경·인증 요청을 자동 재시도하지 않는다. API 실패 응답이나 응답을 받지 못한 전송 실패 뒤의 재요청은 사용자의 명시적인 행동으로만 시작한다.

### 인증·접근 처리

1. 같은 Nuxt 서버에서 제공하는 웹앱 인증은 `HttpOnly` 세션 쿠키를 사용한다.
2. 서버는 관리 API 요청마다 현재 역할, 월드·프로젝트 범위, 세부 허가를 다시 검사한다. 로그인 시점의 권한을 고정하지 않는다.
3. 미인증 관리 페이지 접근은 `/signin?returnTo=...`로 이동한다.
4. 임시 비밀번호 계정은 `/password/change`와 필요한 인증 API 외의 관리 접근을 허용하지 않는다.
5. 권한 변경으로 현재 페이지 접근을 잃으면 다음 API 요청을 거부하고 `/admin`의 접근 가능한 범위로 안내한다.
6. 기존 계정의 초대 수락은 초대 이메일과 같은 계정으로 로그인한 상태에서만 허용한다.
7. 공개 페이지는 로그인 여부와 무관하게 같은 공개본을 보여 준다. 관리자에게 관리 중인 현재 리비전을 대신 노출하지 않는다.
8. 비밀번호 재설정과 탈퇴 링크 재발급 요청은 계정 존재 여부를 구분하지 않는 같은 성공 응답을 사용한다.
9. 토큰 원문은 API 응답과 로그에 다시 노출하지 않는다.

## API 엔드포인트

표에서 `GET·POST`처럼 묶은 표기는 같은 경로에 각 HTTP 메서드가 존재한다는 뜻이다.

### 인증·본인 계정

| 메서드 | 경로 | 책임 |
| --- | --- | --- |
| POST | `/api/v1/auth/sessions` | 로그인 세션 생성 |
| GET·DELETE | `/api/v1/auth/sessions/current` | 현재 세션 확인·종료 |
| POST | `/api/v1/auth/password-changes` | 본인 비밀번호 및 최초 임시 비밀번호 변경 |
| POST | `/api/v1/auth/password-reset-requests` | 24시간 재설정 링크 발급과 기존 대기 요청 무효화 |
| GET | `/api/v1/auth/password-reset-requests/{token}` | 재설정 링크 상태 확인 |
| POST | `/api/v1/auth/password-reset-requests/{token}/completions` | 새 비밀번호 반영과 요청 완료 처리 |
| GET | `/api/v1/auth/invitations/{token}` | 초대 내용과 상태 확인 |
| POST | `/api/v1/auth/invitations/{token}/acceptances` | 기존 계정 연결 또는 신규 계정 생성과 초대 수락 |
| POST | `/api/v1/auth/withdrawal-download-links` | 탈퇴 내려받기 링크 재발급과 이전 링크 무효화 |
| GET | `/api/v1/auth/withdrawal-downloads/{token}` | 내려받기 링크 상태와 만료 시각 확인 |
| GET | `/api/v1/auth/withdrawal-downloads/{token}/files` | Markdown·JSON ZIP 내려받기 |
| GET | `/api/v1/management/accounts/me` | 본인 계정과 탈퇴 상태 조회 |
| GET | `/api/v1/management/accounts/me/withdrawal-previews` | 소유 월드별 승계 필요 여부와 후보 조회 |
| POST | `/api/v1/management/accounts/me/withdrawals` | 승계, 일반 접근 차단, 7일 내려받기 스냅샷 생성 |

### 전역 대시보드·계정

| 메서드 | 경로 | 책임 |
| --- | --- | --- |
| GET | `/api/v1/management/dashboard-summaries` | 현재 계정의 접근 범위와 할 일 집계 |
| GET·POST | `/api/v1/management/accounts` | 운영자 계정 목록·생성 |
| GET·PATCH | `/api/v1/management/accounts/{accountId}` | 계정 역할과 전역 월드 생성 허가 조회·변경 |
| GET | `/api/v1/management/permission-definitions` | 24개 허가의 명칭과 적용 행동 조회 |

### 월드·프로젝트·소속·초대

| 메서드 | 경로 | 책임 |
| --- | --- | --- |
| GET·POST | `/api/v1/management/worlds` | 접근 가능 월드 목록·생성 |
| GET·PATCH·DELETE | `/api/v1/management/worlds/{worldId}` | 월드 조회·수정·소프트 삭제 |
| POST | `/api/v1/management/worlds/{worldId}/restorations` | 삭제 월드 복구 |
| GET | `/api/v1/management/worlds/{worldId}/dashboard-summaries` | 월드 상태와 할 일 집계 |
| GET·POST | `/api/v1/management/worlds/{worldId}/projects` | 월드 프로젝트 목록·생성 |
| GET·PATCH·DELETE | `/api/v1/management/projects/{projectId}` | 프로젝트 조회·수정·소프트 삭제 |
| POST | `/api/v1/management/projects/{projectId}/restorations` | 삭제 프로젝트 복구 |
| GET | `/api/v1/management/projects/{projectId}/dashboard-summaries` | 프로젝트 작성 기반과 할 일 집계 |
| GET | `/api/v1/management/worlds/{worldId}/memberships` | 월드 부관리자 소속 목록 |
| GET·PATCH·DELETE | `/api/v1/management/memberships/{membershipId}` | 프로젝트 범위·허가 조회·변경과 소속 해제 |
| GET·POST | `/api/v1/management/worlds/{worldId}/invitations` | 월드 초대 목록·생성 |
| GET | `/api/v1/management/invitations/{invitationId}` | 초대 상세와 권한 스냅샷 조회 |
| POST | `/api/v1/management/invitations/{invitationId}/deliveries` | 같은 초대 링크·범위·허가로 메일 재발송 |
| POST | `/api/v1/management/invitations/{invitationId}/cancellations` | 대기 초대 취소 |
| GET | `/api/v1/management/worlds/{worldId}/permission-audits` | 초대·권한·소속 변경 감사 이력 조회 |

### 카테고리·템플릿

| 메서드 | 경로 | 책임 |
| --- | --- | --- |
| GET·POST | `/api/v1/management/projects/{projectId}/categories` | 프로젝트 카테고리 트리 조회·사용자 정의 카테고리 생성 |
| GET·PATCH·DELETE | `/api/v1/management/categories/{categoryId}` | 카테고리 조회·수정·삭제 |
| POST | `/api/v1/management/categories/{categoryId}/activations` | 카테고리 사용 전환 |
| POST | `/api/v1/management/categories/{categoryId}/deactivations` | 카테고리 사용 중지 |
| POST | `/api/v1/management/categories/{categoryId}/restorations` | 삭제 카테고리 복구 |
| POST | `/api/v1/management/categories/{categoryId}/movement-previews` | 이동 전 문서·템플릿 연결·관계 영향 조회 |
| POST | `/api/v1/management/categories/{categoryId}/movements` | 부모 또는 같은 부모 안 순서 이동과 영향 상태 반영 |
| POST | `/api/v1/management/categories/{categoryId}/review-completions` | 카테고리 템플릿 연결 점검 완료 |
| PUT·DELETE | `/api/v1/management/categories/{categoryId}/template-bindings/current` | 대분류의 현재 템플릿 연결·해제 |
| GET·POST | `/api/v1/management/projects/{projectId}/templates` | 프로젝트 템플릿 목록·생성 |
| GET·PATCH·DELETE | `/api/v1/management/templates/{templateId}` | 현재 구조 조회, 새 리비전 저장, 템플릿 삭제 |
| POST | `/api/v1/management/templates/{templateId}/activations` | 템플릿 사용 전환 |
| POST | `/api/v1/management/templates/{templateId}/deactivations` | 템플릿 사용 중지 |
| POST | `/api/v1/management/templates/{templateId}/restorations` | 삭제 템플릿 복구 |
| GET | `/api/v1/management/templates/{templateId}/revisions` | 템플릿 리비전 목록 조회 |
| GET | `/api/v1/management/template-revisions/{revisionId}` | 저장 당시 템플릿 구조 조회 |
| POST | `/api/v1/management/templates/{templateId}/revision-restorations` | 새 리비전 없이 과거 리비전을 현재 적용본으로 전환 |

### 문서·리비전·태그

| 메서드 | 경로 | 책임 |
| --- | --- | --- |
| GET·POST | `/api/v1/management/projects/{projectId}/documents` | 문서 목록 조회와 새 비공개 문서·최초 리비전 생성 |
| GET·PATCH·DELETE | `/api/v1/management/documents/{documentId}` | 문서 상세 조회, 새 리비전 저장, 소프트 삭제 |
| POST | `/api/v1/management/documents/{documentId}/restorations` | 삭제 문서와 보존 연결 복구 |
| GET | `/api/v1/management/documents/{documentId}/revisions` | 문서 리비전 목록과 계보 조회 |
| GET | `/api/v1/management/document-revisions/{revisionId}` | 저장 당시 문서 상태 조회 |
| POST | `/api/v1/management/documents/{documentId}/revision-restorations` | 새 리비전 없이 과거 리비전을 현재 상태로 적용 |
| POST | `/api/v1/management/documents/{documentId}/movement-previews` | 대상 템플릿과 기존 섹션 비교 |
| POST | `/api/v1/management/documents/{documentId}/movements` | 섹션 유지·삭제 결정을 반영한 이동 리비전 생성 |
| POST | `/api/v1/management/documents/{documentId}/review-completions` | 카테고리 이동 영향 점검 완료 |
| POST | `/api/v1/management/documents/{documentId}/publications` | 선택 리비전을 공개본으로 지정·교체 |
| DELETE | `/api/v1/management/documents/{documentId}/publications/current` | 공개 리비전 선택을 보존하며 즉시 비공개 전환 |
| GET | `/api/v1/management/documents/{documentId}/backlinks` | 현재 문서를 가리키는 문서 목록 조회 |
| GET | `/api/v1/management/worlds/{worldId}/document-options` | 같은 월드의 위키링크·관계 대상 문서 검색 |
| GET | `/api/v1/management/worlds/{worldId}/tags` | 정상·삭제 태그와 사용 현황 조회 |
| GET·DELETE | `/api/v1/management/tags/{tagId}` | 태그 조회·삭제 |
| POST | `/api/v1/management/tags/{tagId}/restorations` | 삭제 태그 복구 |

위키링크 생성·변경과 새 태그 자동 생성은 문서 저장 요청에 포함한다. 공개 전환은 문서 리비전을 생성하지 않으므로 문서 저장과 분리한다. 템플릿 변경으로 계산되는 `템플릿 점검 필요`는 최신 템플릿 구조로 문서를 저장하면 자동 해제하며 별도 완료 API를 두지 않는다.

### 관계 유형·관계

| 메서드 | 경로 | 책임 |
| --- | --- | --- |
| GET·POST | `/api/v1/management/worlds/{worldId}/relation-types` | 월드 관계 유형 목록·사용자 정의 유형 생성 |
| GET·PATCH·DELETE | `/api/v1/management/relation-types/{relationTypeId}` | 관계 유형 조회·허용 범위 수정·삭제 |
| POST | `/api/v1/management/relation-types/{relationTypeId}/deactivation-previews` | 사용 중지로 종료될 활성 관계 확인 |
| POST | `/api/v1/management/relation-types/{relationTypeId}/activations` | 관계 유형 사용 전환 |
| POST | `/api/v1/management/relation-types/{relationTypeId}/deactivations` | 관계 유형 사용 중지와 활성 관계 종료 |
| POST | `/api/v1/management/relation-types/{relationTypeId}/restorations` | 삭제 사용자 정의 관계 유형 복구 |
| GET·POST | `/api/v1/management/worlds/{worldId}/relations` | 관계 목록 조회·생성 |
| GET·PATCH·DELETE | `/api/v1/management/relations/{relationId}` | 관계 조회·수정·종료와 이력 생성 |
| GET | `/api/v1/management/relations/{relationId}/histories` | 관계 변경 이력 조회 |
| POST | `/api/v1/management/relations/{relationId}/review-completions` | 카테고리 이동 영향 점검 완료 |
| GET | `/api/v1/management/documents/{documentId}/relations` | 문서 기준 정·역방향 관계 목록 조회 |
| GET | `/api/v1/management/documents/{documentId}/relation-graphs` | 문서 관계도 노드·간선 조회 |

관계 유형의 역할·허용 카테고리·반복 규칙은 하나의 집합으로 저장한다. 관계 설명의 위키링크와 관련 설정 문서도 관계 저장 요청에 포함한다. 직접 삭제하거나 관계 유형 비활성화로 종료된 관계 인스턴스는 복구할 수 없으므로 관계 `restorations` 엔드포인트를 두지 않는다.

### 공개 열람

| 메서드 | 경로 | 책임 |
| --- | --- | --- |
| GET | `/api/v1/public/worlds` | 공개 문서가 있는 월드 목록 |
| GET | `/api/v1/public/documents` | 모든 월드의 공개 문서 검색 |
| GET | `/api/v1/public/tags` | 현재 공개본에 노출되는 활성 태그 후보 |
| GET | `/api/v1/public/worlds/{worldSlug}` | 공개 월드 정보 |
| GET | `/api/v1/public/worlds/{worldSlug}/projects` | 공개 문서가 있는 프로젝트 목록 |
| GET | `/api/v1/public/worlds/{worldSlug}/projects/{projectSlug}` | 공개 프로젝트 정보 |
| GET | `/api/v1/public/worlds/{worldSlug}/projects/{projectSlug}/categories` | 공개 문서가 있는 카테고리 트리 |
| GET | `/api/v1/public/worlds/{worldSlug}/projects/{projectSlug}/documents` | 프로젝트 공개 문서 목록과 검색 |
| GET | `/api/v1/public/worlds/{worldSlug}/projects/{projectSlug}/documents/{...documentName}` | 선택 공개 리비전의 본문·태그·연결·관계·관계도 조회 |

공개 응답은 내부 UUID를 공개 경로나 연결 대상으로 노출하지 않는다. 비공개 문서 연결은 `비공개 문서`, 삭제 문서 연결은 `삭제됨` 상태만 반환한다. 공개 검색과 목록은 공개 문서가 하나도 없는 월드·프로젝트·카테고리를 제외한다.

## 유스케이스 추적성

| 유스케이스 | 대응 페이지 | 대응 API 영역 |
| --- | --- | --- |
| UC-01 월드 관리 권한 부여 | P-13 | 계정 조회·변경, 권한 정의 |
| UC-02 부관리자 초대 | P-09, P-15 | 월드 초대, 초대 확인·수락·재발송 |
| UC-03 부관리자 권한·소속 조정 | P-15 | 소속 조회·변경·해제, 권한 감사 |
| UC-04 비밀번호 재설정 | P-07, P-08 | 비밀번호 재설정 요청·확인·완료 |
| UC-05 계정 탈퇴·내려받기 | P-12, P-10 | 탈퇴 사전 확인·확정, 링크 재발급·ZIP 내려받기 |
| UC-06 월드 생성 | P-11, P-14 | 월드 목록·생성 |
| UC-07 프로젝트 생성 | P-14, P-23 | 월드 프로젝트 목록·생성 |
| UC-08 월드·프로젝트 삭제·복구 | P-11, P-14, P-23 | 월드·프로젝트 삭제·복구 |
| UC-09 프로젝트 카테고리 구조 관리 | P-24 | 카테고리 생성·수정·삭제·이동·상태 전환 |
| UC-10 대분류 템플릿 연결 | P-24 | 현재 템플릿 연결·해제 |
| UC-11 템플릿·섹션 구성 | P-25~P-27 | 템플릿 생성·리비전 저장·과거 적용 |
| UC-12 카테고리·템플릿 사용 중지 | P-24, P-25, P-27 | 활성화·비활성화 |
| UC-13 카테고리 이동·영향 점검 | P-24, P-28, P-30, P-32 | 이동 미리보기·확정, 문서·관계 점검 완료 |
| UC-14 새 문서 작성 | P-28, P-29 | 문서 목록·생성 |
| UC-15 문서 수정·리비전 | P-30, P-31 | 문서 저장, 리비전 목록·상세 |
| UC-16 과거 문서 리비전 적용 | P-30, P-33 | 문서 리비전 적용 |
| UC-17 최신 템플릿 구조 점검 | P-27, P-28, P-31 | 템플릿 리비전 조회, 문서 저장 |
| UC-18 다른 템플릿 카테고리 이동 | P-32 | 문서 이동 미리보기·확정 |
| UC-19 문서 이름·위키링크 유지 | P-30, P-31 | 문서 저장, 문서 선택 후보, 역링크 |
| UC-20 문서 삭제·복구 | P-28, P-30 | 문서 삭제·복구 |
| UC-21 문서 태그 관리 | P-16, P-29, P-31 | 문서 저장, 태그 목록·삭제·복구 |
| UC-22 관계 유형·관계 관리 | P-17~P-22, P-30 | 관계 유형·관계 CRUD, 영향 확인, 이력·관계도 |
| UC-23 문서 공개·비공개 전환 | P-28, P-30 | 공개본 지정·교체·해제 |
| UC-24 공개 문서 검색·열람 | P-01~P-04 | 공개 월드·프로젝트·카테고리·문서·태그 |
| UC-25 관리자 권한 변경 이력 | P-15 | 권한 감사 이력 |

## 구현 경계와 후속 검증

1. 이 문서는 라우트 파일, 페이지 컴포넌트, API 핸들러, 타입, 테스트, ORM, 마이그레이션, 데이터베이스 변경의 구현 승인이 아니다.
2. 구현 단계에서는 페이지별 사용자·데이터·행동·권한 필터·이동 경로를 수용 조건으로 사용한다.
3. 모든 API 리소스 경로가 복수형인지 정적 목록으로 검증한다.
4. 성공과 실패 응답이 모두 `data`, `error`, `code`, `message`, `details`를 가지는지 검증한다.
5. 역할별 메뉴·대시보드·직접 URL·API 권한 결과가 일치하는지 검증한다.
6. 임시 비밀번호, 기존·신규 계정 초대, 재설정 링크 상태, 탈퇴 승계·내려받기를 검증한다.
7. 카테고리 이동 영향, 템플릿·문서 리비전 충돌, 공개본 분리, 관계 종료를 검증한다.
8. 공개 검색과 열람에서 비공개 데이터와 내부 UUID가 노출되지 않는지 검증한다.

## 미결 사항

- 없음.
