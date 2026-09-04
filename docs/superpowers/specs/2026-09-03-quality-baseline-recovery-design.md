# 옴니노드 구현 품질 기준선 복구 설계

> 작성일: 2026-09-03

> 상태: 마스터 승인

> 관련 제품 설계: `docs/project-design/2026-09-03-omninode-route-api-design.md`

## 목적

제품 라우트와 API를 구현하기 전에 현재 템플릿에 남아 있는 미완성 API composable 이전, 중복된 요청 계층, 응답 타입 분산, 실패 테스트를 정리한다. 이번 작업은 테스트를 임시로 통과시키는 데 그치지 않고, 이후 인증·세션과 관리·공개 API가 공통으로 사용할 클라이언트 요청 기반을 확정한다.

완료된 기준선은 다음 조건을 만족해야 한다.

1. API 요청·응답 계약과 Vue Query 전용 타입의 소유 위치가 분명하다.
2. 직접 요청과 캐시 요청이 하나의 공통 HTTP 요청 규칙을 사용한다.
3. 모든 API 성공·실패 응답을 HTTP 200과 공통 응답 본문으로 판별한다.
4. 조회·변경·인증 요청을 자동 재시도하지 않는다.
5. 기존 테스트·린트·타입 검사·빌드가 모두 통과한다.

## 현재 문제

현재 저장소는 다음과 같은 불일치를 가진다.

- 테스트가 참조하는 `app/composables/api/`와 일부 공통 파일이 존재하지 않는다.
- Vue Query composable은 `app/utils/api/`의 요청 객체를 사용하지만, 기존 설계와 테스트는 별도 query fetcher를 전제로 한다.
- API 요청 타입은 `api.types.ts`, 응답 타입은 `response.types.ts`에 나뉘어 있다.
- `server/utils/baseResponse.ts`가 확정 응답의 `details`를 반환하지 않는다.
- 기본 레이아웃은 Nuxt 자동 import에 의존해 일반 Vue 단위 테스트에서 `storeToRefs`를 찾지 못한다.
- `UiPanel`은 확정 UI 기준인 `rounded-1`을 사용하지만 기존 테스트는 `rounded-2`를 기대한다.
- 존재하지 않는 `example.query-keys`를 참조하는 테스트와 승인된 API 네임스페이스 밖의 예제 `users` 도메인·라우트가 남아 있다.

## 범위

### 포함

- API 요청·응답 타입 통합
- 공통 HTTP 요청과 응답 판별
- 직접 요청 composable 복구
- Vue Query 조회·mutation composable 정리
- 도메인 query key와 도메인 composable 연결 정리
- 서버 공통 응답 생성기와 목록 페이지 정보 정리
- 현재 실패 테스트의 원인 수정
- 전체 테스트·린트·타입 검사·빌드 검증
- 의존성 취약점의 원인과 별도 조치 필요 여부 확인

### 제외

- 33개 제품 페이지 구현
- 인증·세션과 권한 검사 구현
- 실제 관리·공개 API 엔드포인트 구현
- Prisma 스키마·마이그레이션·데이터베이스 변경
- 제품 UI 추가
- 의존성 취약점 수정을 위한 패키지 업데이트

## 계층 구조

```text
화면·렌더링 컴포넌트
        ↓
도메인 composable과 query key
        ↓
Vue Query 계층 또는 직접 요청 composable
        ↓
공통 HTTP 요청기와 응답 판별
        ↓
서버 API
```

### API 계약 타입

`app/types/api.types.ts`는 다음 타입을 소유한다.

- HTTP 메서드와 요청 option
- query 매개변수와 body
- 공통 API 성공·실패 응답
- 목록 페이지 데이터
- API 업무 실패와 클라이언트 전송 실패를 표현하는 타입

공통 응답은 다음 구조를 사용한다.

```ts
interface ApiResponse<TData, TDetails = unknown> {
  data: TData | null;
  error: boolean;
  code: string;
  message: string;
  details: TDetails | null;
}
```

기존 `app/types/response.types.ts`의 응답 타입과 목록 타입은 `api.types.ts`로 옮기고, 소비처를 모두 변경한 뒤 `response.types.ts`를 제거한다.

### Vue Query 타입

`app/types/query.types.ts`는 TanStack Vue Query에 직접 결합된 다음 타입만 소유한다.

- query key와 mutation key
- query·mutation option override
- mutation 변수
- QueryClient와 Vue 반응형 입력에 필요한 타입

API 응답, 요청 body, query 매개변수 같은 전송 계약을 다시 선언하지 않고 `api.types.ts`의 타입을 참조한다.

### 공통 HTTP 요청기

공통 HTTP 요청기는 URL, 메서드, query, body, 헤더, fetch option을 입력받는 상태 없는 함수다. 직접 요청 composable과 Vue Query 계층은 이 요청기를 공유한다.

현재 `app/utils/api/`의 클래스 기반 요청 객체는 소비처를 공통 요청기로 이전한 뒤 제거한다. 요청 구현을 두 위치에 중복해서 유지하지 않는다.

공통 요청기는 다음 책임만 가진다.

1. 기본 입력과 실행 시 입력을 정규화한다.
2. query와 body를 분리해 `$fetch`에 전달한다.
3. JSON 응답이 공통 응답 구조를 만족하는지 검사한다.
4. `error: false`이면 `data`를 반환한다.
5. `error: true`이면 공통 `ApiError`로 변환한다.
6. 응답을 받지 못하면 전송 실패로 변환한다.

화면 이동, 알림 문구, query key 무효화는 결정하지 않는다.

요청 URL이 `/`로 시작하고 `baseURL`이 없거나 `/`로 시작하는 내부 경로일 때만 Nuxt의 요청 범위 fetch를 사용해 SSR에서 HttpOnly 세션 쿠키를 전달한다. URL 또는 `baseURL`이 절대 외부·protocol-relative 경로이면 전역 fetch를 사용해 들어온 요청의 인증 정보를 승계하지 않는다. 클라이언트·단위 테스트와 같이 Nuxt 요청 컨텍스트가 없으면 전역 `$fetch`로 돌아간다. `AbortSignal`은 요청 option에서 fetch까지 보존하고, `HeadersInit`은 H3의 spread 병합에서도 유지되는 plain header record로 직렬화한다. 오류에는 인증 헤더·쿠키·전체 응답 본문을 싣지 않는다.

### 직접 요청 composable

`app/composables/api/`는 캐시가 필요 없는 직접 요청을 제공한다.

- `useGet`
- `usePost`
- `usePut`
- `usePatch`
- `useDelete`

각 composable은 `data`, `error`, `pending`, `status`, `execute`, `reset`을 제공한다. 생성 시점에는 요청하지 않고 `execute()`로만 실행한다.

동시에 둘 이상의 요청이 실행되면 모든 요청이 끝날 때까지 `pending`을 유지한다. 늦게 끝난 과거 요청이 더 최근의 성공 결과를 덮어쓰지 않게 완료 순서를 관리한다. `reset()`은 현재 표시 상태를 초기화하지만 실행 중인 요청을 완료 처리하지 않는다.

`execute()` 헤더는 대소문자를 구분하지 않고 기본 헤더와 병합한다. 실행 헤더에 같은 키가 있으면 그 키만 덮어쓰고, 기본 인증·CSRF 헤더는 유지한다. 병합 결과는 공통 요청 경계에서 plain record로 변환해 H3가 inbound 헤더와 object spread로 합칠 때도 각 헤더 키가 유지되게 한다.

### Vue Query 계층

`app/composables/query/`는 캐시와 mutation 수명 주기를 관리한다.

- `useGetQuery`
- `usePostMutation`
- `usePutMutation`
- `usePatchMutation`
- `useDeleteMutation`

범용 composable은 제품 도메인 URL과 무효화 범위를 추측하지 않는다. 도메인 composable이 query key, URL, 매개변수, 성공 후 무효화 범위를 결정한다.

조회는 기본적으로 Vue Query의 자동 실행 동작을 따르며, 검색 조건이 준비되지 않은 경우처럼 도메인상 필요한 때에만 `enabled: false`를 지정한다. 조회와 mutation 모두 자동 재시도 횟수는 0이며, 실패 query는 캐시 데이터 유무와 관계없이 재마운트·윈도우 포커스·네트워크 재연결로 자동 재요청하지 않는다. 성공한 stale 데이터의 일반 재마운트·포커스·재연결 재조회는 유지한다.

### 도메인 계층

`app/composables/domain/`은 화면이 사용할 목적 단위의 조회와 변경을 구성한다. `app/keys/`는 `all → lists → list(params) → detail(id)` 범위의 안정적인 query key를 제공한다.

화면은 범용 query composable에 URL과 key를 직접 조합하기보다 도메인 composable을 우선 사용한다. mutation 성공 뒤에는 도메인 계층이 영향받은 최소 query key만 무효화한다.

### 서버 공통 응답

`server/utils/baseResponse.ts`와 `server/utils/pageData.ts`는 `api.types.ts`의 계약을 사용한다.

- 성공과 실패 모두 `data`, `error`, `code`, `message`, `details`를 반환한다.
- 모든 API 성공·실패 응답은 HTTP 200이다.
- 상태 전환 성공은 영향 수량과 경고를 `details`에 담을 수 있다.
- 입력 오류와 충돌은 필드 오류, 충돌 대상, 가능한 후속 행동을 `details`에 담을 수 있다.
- 목록은 1부터 시작하며 기본 10건, 최대 100건이다.

탈퇴 데이터 ZIP 내려받기는 JSON 공통 응답 판별의 예외다. 이 예외는 이번 기준선에서 실제 API로 구현하지 않는다.

## 데이터 흐름

### 조회

```text
화면
→ 도메인 조회 composable
→ query key·URL·매개변수 결정
→ useGetQuery
→ 공통 HTTP 요청기
→ HTTP 200 공통 응답 판별
→ 성공 데이터 캐시 또는 오류 상태
```

`error: true` 응답은 HTTP 200이어도 성공 캐시에 들어가지 않는다. 요청기가 이를 `ApiError`로 전환해 Vue Query의 오류 상태로 전달한다.

### 변경

```text
화면 입력
→ 도메인 mutation composable
→ mutateAsync 변수
→ 공통 HTTP 요청기
→ HTTP 200 공통 응답 판별
→ 성공 시 지정 query key 무효화
→ 실패 시 기존 캐시 유지
```

POST, PUT, PATCH, DELETE는 같은 흐름을 사용한다. DELETE도 일괄 처리를 위한 body를 받을 수 있다. 자동 재시도는 하지 않는다.

### 직접 요청

```text
사용자 실행
→ execute 입력과 기본 입력 병합
→ 공통 HTTP 요청기
→ 성공 데이터 또는 정규화된 오류
→ 직접 요청 상태 갱신
```

직접 요청은 사용자의 명시적 `execute()` 호출로만 시작한다. 실패 뒤의 재요청도 다시 실행하는 사용자 행동으로만 시작한다.

## 오류 처리

### API 업무 실패

HTTP 200 응답의 `error`가 `true`이면 요청기는 응답의 `code`, `message`, `details`를 보존한 `ApiError`를 만든다. Vue Query와 직접 요청 composable은 이를 오류 상태로 처리한다.

도메인 composable은 오류 코드를 해석해 화면이 선택할 수 있는 후속 행동을 제공한다. 범용 요청 계층은 알림 표시나 라우트 이동을 직접 수행하지 않는다.

### 전송 실패

네트워크 단절, 요청 중단, 서버 미도달처럼 API 응답을 받지 못한 경우는 업무 실패와 구분한다.

- 일반 전송 실패는 클라이언트 코드 `NETWORK_ERROR`로 정규화한다.
- 사용자 이동 등으로 요청이 취소된 경우는 일반 오류 안내 대상에서 제외할 수 있게 구분한다.
- `ofetch` 오류의 `cause` 연결 안쪽에 `AbortError`가 있어도 취소로 분류하며, 순환 참조는 안전하게 종료한다.
- 기존 캐시와 성공 데이터를 임의로 지우지 않는다.
- 자동 재시도하지 않는다.

### 응답 계약 위반

HTTP 200 응답에 공통 필드가 빠졌거나 필드 형식이 잘못됐으면 `INVALID_API_RESPONSE`로 정규화한다.

- 잘못된 응답은 성공 데이터나 캐시에 저장하지 않는다.
- 자동 재시도하지 않는다.
- 개발 환경 진단에는 계약 위반 정보를 남길 수 있다.
- 토큰, 비밀번호, 개인정보, 전체 요청 본문은 기록하지 않는다.

### 화면 전달

- `details.fieldErrors`는 해당 입력 필드에 연결한다.
- `REVISION_CONFLICT`는 기존 저장본을 덮어쓰지 않고 충돌 해결 흐름으로 전달한다.
- 인증 실패는 현재 경로를 `returnTo`로 보존한 로그인 이동에 사용한다.
- 요청 계층과 화면이 같은 오류를 중복 안내하지 않는다.

## 테스트 설계

### 공통 응답과 요청

- 성공·실패 응답의 다섯 필드 검사
- HTTP 200의 `error: true`를 `ApiError`로 변환
- query·body·헤더·fetch option 정규화
- URL·`baseURL` 조합에 따른 내부 요청 범위 fetch와 외부 전역 fetch 분기
- native `Headers`·tuple·plain object를 H3 병합에 안전한 plain header record로 직렬화
- `AbortSignal` 전달과 중첩·순환 `cause` 취소 판별
- 기본·실행 헤더의 대소문자 무관 병합
- API 업무 실패, 전송 실패, 응답 계약 위반 구분
- 모든 요청의 자동 재시도 0 검증
- DELETE body 전달 검증

### 직접 요청 composable

- 실행 전 무요청
- 성공·실패 상태 전이
- 동시 요청의 `pending` 유지와 최신 결과 보존
- 실행 중 `reset()` 처리
- 실패 뒤 사용자 재실행

### Vue Query

- query key별 캐시 분리
- `error: true` 응답의 성공 캐시 유입 금지
- mutation 성공 시 지정 범위 무효화
- mutation 실패 시 기존 캐시 유지
- 조회·mutation 자동 재시도 금지
- 캐시 데이터가 있는 실패 query를 포함한 재마운트·포커스·재연결 자동 재요청 금지와 성공 stale query 재조회 유지

### 서버 유틸리티

- 성공·실패 응답의 동형성
- `details: null` 기본값과 상세 정보 보존
- 목록의 1 기반 페이지
- 기본 10건과 최대 100건
- 빈 목록 페이지 정보

### 기존 기준선 문제

- 누락된 API composable과 공통 요청기를 목표 구조로 구현한다.
- 존재하지 않는 예제 query key를 요구하는 테스트는 범용 query 테스트의 로컬 key로 대체한다.
- 승인된 API 네임스페이스 밖의 예제 `users` 도메인 composable, query key, 서버 라우트는 제거한다. 실제 `management/accounts` 구현으로 바꾸지 않는다.
- 기본 레이아웃에서 `storeToRefs`를 명시적으로 import한다.
- `UiPanel` 테스트 기대값을 확정 UI 기준인 `rounded-1`로 정정한다.

## 완료 기준

다음 명령을 모두 새로 실행해 통과해야 한다.

```powershell
pnpm test
pnpm lint
pnpm exec vue-tsc --noEmit
pnpm build
git diff --check
```

추가 정적 검증으로 다음을 확인한다.

- `app/types/response.types.ts`와 그 import가 남아 있지 않다.
- 현재 `app/utils/api/`의 중복 요청 구현과 그 import가 남아 있지 않다.
- 승인된 네임스페이스 밖의 예제 `users` 도메인·query key·서버 라우트가 남아 있지 않다.
- 조회·mutation 설정에 자동 재시도가 남아 있지 않다.
- 서버 공통 응답이 다섯 필드를 빠짐없이 반환한다.
- 제품 페이지, 실제 제품 API, Prisma 스키마가 변경되지 않았다.

`pnpm audit`로 원격이 알린 취약점의 현재 의존 경로를 확인하되, 패키지 업데이트는 별도 범위로 분리한다.

## 구현 이후의 다음 단계

품질 기준선이 통과한 뒤 공통 API 계약을 바탕으로 데이터 스키마 구현과 인증·세션 기반을 별도 설계·계획한다. 이번 작업의 완료가 제품 API나 페이지 구현의 완료를 뜻하지 않는다.
