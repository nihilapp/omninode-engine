# 옴니노드 구현 품질 기준선 복구 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 제품 기능 구현 전에 공통 API 요청·응답과 Vue Query 계층을 확정 구조로 수렴시키고 기존 전체 검증을 통과시킨다.

**Architecture:** `app/types/api.types.ts`가 요청·응답 계약을 소유하고, `app/composables/api/`의 상태 없는 공통 요청기와 직접 요청 composable이 이를 사용한다. `app/composables/query/`는 같은 요청기를 이용해 캐시와 mutation 수명 주기만 관리하며, 서버 응답 유틸리티도 같은 다섯 필드 계약을 반환한다.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, TanStack Vue Query 5, ofetch, Vitest, Vue Test Utils, Pinia

**Spec:** `docs/superpowers/specs/2026-09-03-quality-baseline-recovery-design.md`

## Global Constraints

- 모든 API 성공·실패 응답은 HTTP 200으로 반환한다.
- 처리 결과는 `data`, `error`, `code`, `message`, `details`로 판별하고 `details`를 생략하지 않는다.
- 조회·변경·인증 요청은 자동 재시도하지 않는다.
- 실패 query는 재마운트·포커스·재연결로 자동 재요청하지 않고, 성공 stale query의 일반 자동 재조회는 유지한다.
- 상대 내부 URL은 Nuxt 요청 범위 fetch를 사용하고 절대 외부 URL은 전역 fetch를 사용한다.
- API 요청·응답 계약은 `app/types/api.types.ts`, Vue Query 전용 타입은 `app/types/query.types.ts`에 둔다.
- 명명된 TypeScript 타입과 인터페이스는 `app/types/` 밖에 새로 선언하지 않는다.
- 함수 선언·호출에서 인자가 둘 이상이면 인자마다 줄바꿈하고 스페이스 2칸으로 들여쓴다.
- 실제 제품 페이지, 인증·세션, 관리·공개 API, Prisma 스키마와 데이터베이스는 변경하지 않는다.
- 승인된 API 네임스페이스 밖의 예제 `users` 코드는 실제 제품 API로 바꾸지 않고 제거한다.
- 커밋 단계는 마스터가 커밋을 명시적으로 승인한 실행에서만 수행한다.

---

## File Map

### API 계약과 요청

- Modify: `app/types/api.types.ts` — 공통 응답, 요청 입력, 정규화 오류 타입
- Delete: `app/types/response.types.ts` — `api.types.ts`와 중복되는 기존 응답 타입
- Create: `app/composables/api/shared.ts` — 입력 병합, 응답 판별, 오류 정규화, 직접 요청 상태 도우미
- Create: `app/composables/api/requestApi.ts` — `$fetch`를 한 번 호출하는 상태 없는 공통 요청기
- Create: `app/composables/api/createApiRequest.ts` — 직접 요청 상태와 동시 실행 순서 관리
- Create: `app/composables/api/useGet.ts`
- Create: `app/composables/api/usePost.ts`
- Create: `app/composables/api/usePut.ts`
- Create: `app/composables/api/usePatch.ts`
- Create: `app/composables/api/useDelete.ts`
- Create: `app/composables/api/index.ts` — 직접 요청 API의 export-only barrel
- Delete: `app/utils/api/api.ts` — 중복 클래스 기반 요청기
- Delete: `app/utils/api/index.ts`
- Delete: `app/utils/api/README.md`

### Vue Query

- Modify: `app/types/query.types.ts` — Vue Query 결합 타입과 `ApiError` 연결
- Create: `app/composables/query/createMutation.ts` — 메서드별 mutation의 공통 구현
- Modify: `app/composables/query/useGetQuery.ts`
- Modify: `app/composables/query/usePostMutation.ts`
- Modify: `app/composables/query/usePutMutation.ts`
- Modify: `app/composables/query/usePatchMutation.ts`
- Modify: `app/composables/query/useDeleteMutation.ts`
- Modify: `app/plugins/vue-query.ts` — 전역 조회·mutation 재시도 금지

### 서버와 기존 기준선

- Modify: `server/utils/baseResponse.ts` — 다섯 필드 공통 응답
- Modify: `server/utils/pageData.ts` — 기본 10건·최대 100건
- Modify: `app/data/response-code.data.ts` — HTTP 상태와 업무 코드를 혼동시키는 설명 제거
- Modify: `app/data/response-message.data.ts` — HTTP 상태 그룹 설명 제거
- Modify: `app/layouts/default.vue` — `storeToRefs` 명시 import
- Delete: `app/composables/domain/user/useCreateUser.ts`
- Delete: `app/composables/domain/user/useDeleteUser.ts`
- Delete: `app/composables/domain/user/useGetUser.ts`
- Delete: `app/composables/domain/user/useGetUsers.ts`
- Delete: `app/composables/domain/user/usePatchUser.ts`
- Delete: `app/composables/domain/user/useUpdateUser.ts`
- Delete: `app/keys/users.keys.ts`
- Delete: `app/types/user.types.ts`
- Delete: `server/routes/api/v1/users/index.get.ts`

### 테스트

- Modify: `test/api-shared.test.ts`
- Modify: `test/api-composables.test.ts`
- Delete: `test/query-fetcher.test.ts`
- Create: `test/api-request.test.ts`
- Modify: `test/query-composables.test.ts`
- Delete: `test/query-keys.test.ts`
- Modify: `test/page-data.test.ts`
- Modify: `test/vue-query-plugin.test.ts`
- Modify: `test/default-layout.test.ts` only if the explicit import changes test setup expectations
- Modify: `test/ui-panel.test.ts`
- Modify: `test/type-import-paths.contract.js` — 삭제·이동된 타입 경로 계약 반영

---

### Task 1: API 계약과 공통 요청기

**Files:**
- Modify: `app/types/api.types.ts`
- Create: `app/composables/api/shared.ts`
- Create: `app/composables/api/requestApi.ts`
- Create: `test/api-request.test.ts`
- Modify: `test/api-shared.test.ts`
- Delete: `test/query-fetcher.test.ts`

**Interfaces:**
- Consumes: `$fetch`, ofetch `FetchOptions<ResponseType>`
- Produces: `ApiResponse<TData, TDetails>`, `ApiError<TDetails>`, `ApiRequestInput<TBody, TParams>`, `requestApi<TData, TBody, TParams, TDetails>()`, `normalizeApiError()`, `isApiResponse()`

- [ ] **Step 1: 공통 응답과 오류 판별의 실패 테스트 작성**

`test/api-request.test.ts`에 HTTP 200 성공·업무 실패·전송 실패·계약 위반을 구분하는 테스트를 작성한다.

```ts
mockFetch.mockResolvedValue({
  data: null,
  error: true,
  code: 'REVISION_CONFLICT',
  message: '저장 충돌이 발생했습니다.',
  details: {
    currentRevisionId: 'revision-2',
  },
});

await expect(requestApi({
  method: 'PATCH',
  url: '/api/v1/management/documents/document-1',
})).rejects.toMatchObject({
  kind: 'api',
  code: 'REVISION_CONFLICT',
  details: {
    currentRevisionId: 'revision-2',
  },
});

expect(mockFetch).toHaveBeenCalledWith(
  '/api/v1/management/documents/document-1',
  expect.objectContaining({
    method: 'PATCH',
    retry: 0,
  }),
);
```

성공 응답은 `data`만 반환하고, 필드가 빠진 응답은 `INVALID_API_RESPONSE`, `$fetch` 자체 실패는 `NETWORK_ERROR`가 되는 경우도 각각 작성한다.

- [ ] **Step 2: 새 요청 테스트가 실패하는지 확인**

Run: `pnpm exec vitest run test/api-request.test.ts test/api-shared.test.ts`

Expected: FAIL because `requestApi`, `ApiResponse`, `ApiError`가 아직 없다.

- [ ] **Step 3: API 계약 타입 구현**

`app/types/api.types.ts`에 다음 계약을 추가하고 fetch option에서 `retry`를 재정의하지 못하게 제외한다.

```ts
export interface ApiResponse<
  TData,
  TDetails = unknown,
> {
  data: TData | null;
  error: boolean;
  code: string;
  message: string;
  details: TDetails | null;
}

export type ApiErrorKind =
  | 'api'
  | 'cancelled'
  | 'invalid-response'
  | 'network';

export interface ApiError<
  TDetails = unknown,
> extends Error {
  kind: ApiErrorKind;
  code: string;
  details: TDetails | null;
  cause?: unknown;
}

export type ApiFetchOptions = Omit<
  FetchOptions<ResponseType>,
  'body' | 'headers' | 'method' | 'query' | 'retry'
>;
```

기존 `TListData<TData>`도 같은 파일로 이동한다. `code`와 `message`는 업무별 값을 수용할 수 있도록 `string` 계약을 사용한다.

- [ ] **Step 4: 응답 판별과 오류 정규화 구현**

`app/composables/api/shared.ts`에 공통 필드 존재 여부와 필드 타입을 검사하는 `isApiResponse()`를 구현한다. 오류는 `Error` 인스턴스에 식별 정보를 합쳐 반환한다.

```ts
export function createApiError<
  TDetails = unknown,
>(
  kind: ApiErrorKind,
  code: string,
  message: string,
  details: TDetails | null,
  cause?: unknown,
): ApiError<TDetails> {
  return Object.assign(
    new Error(message),
    {
      cause,
      code,
      details,
      kind,
    },
  );
}
```

`AbortError`는 `cause` 연결 안쪽에 있어도 `cancelled`, 그 밖의 응답 없는 실패는 `network`로 구분한다. 순환 `cause`에서도 탐색을 종료하고, 원본 요청 body나 인증 헤더를 오류에 포함하지 않는다.

- [ ] **Step 5: 상태 없는 공통 요청기 구현**

`app/composables/api/requestApi.ts`는 내부·외부 경계에 따라 선택한 fetcher로 입력을 전달하고 반드시 `retry: 0`을 마지막에 지정한다.

요청 URL이 `/`로 시작하고 `baseURL`이 없거나 `/`로 시작하는 내부 경로일 때만 `useRequestFetch()`로 현재 SSR 요청의 세션 쿠키를 승계한다. URL 또는 `baseURL`이 절대 외부·protocol-relative 경로이면 전역 `$fetch`를 사용한다. Nuxt 요청 컨텍스트가 없으면 전역 `$fetch`로 fallback하며 fetch option의 `signal`은 보존한다. `HeadersInit`은 H3의 헤더 spread 병합에서도 값이 보존되도록 plain `Record<string, string>`으로 직렬화한다.

```ts
const fetcher = resolveApiFetcher(
  input.url,
  input.options?.baseURL,
);
const response = await fetcher<ApiResponse<TData, TDetails>>(
  input.url,
  {
    ...input.options,
    body: input.body,
    headers: serializeHeaders(input.headers),
    method: input.method,
    query: input.params,
    retry: 0,
  },
);

if (!isApiResponse<TData, TDetails>(response)) {
  throw createApiError(
    'invalid-response',
    'INVALID_API_RESPONSE',
    'API 응답 형식이 올바르지 않습니다.',
    null,
  );
}

if (response.error) {
  throw createApiError(
    'api',
    response.code,
    response.message,
    response.details,
  );
}

return response.data;
```

반환 타입은 `Promise<TData | null>`로 두어 삭제·상태 전환처럼 정상 `null`을 반환하는 성공도 표현한다.

- [ ] **Step 6: 요청과 공통 도우미 테스트 통과 확인**

Run: `pnpm exec vitest run test/api-request.test.ts test/api-shared.test.ts`

Expected: PASS.

- [ ] **Step 7: 승인된 경우 Task 1 커밋**

```powershell
git add app/types/api.types.ts app/composables/api/shared.ts app/composables/api/requestApi.ts test/api-request.test.ts test/api-shared.test.ts test/query-fetcher.test.ts
git commit -m "2026 0903 refactor: API 공통 계약과 요청기 정리"
```

---

### Task 2: 직접 요청 composable

**Files:**
- Create: `app/composables/api/createApiRequest.ts`
- Create: `app/composables/api/useGet.ts`
- Create: `app/composables/api/usePost.ts`
- Create: `app/composables/api/usePut.ts`
- Create: `app/composables/api/usePatch.ts`
- Create: `app/composables/api/useDelete.ts`
- Create: `app/composables/api/index.ts`
- Modify: `app/types/api.types.ts`
- Modify: `test/api-composables.test.ts`

**Interfaces:**
- Consumes: `requestApi()` from Task 1
- Produces: `createApiRequest()`, `useGet()`, `usePost()`, `usePut()`, `usePatch()`, `useDelete()`, `ApiRequestResult<TData, TInput>`

- [ ] **Step 1: 직접 요청 상태의 실패 테스트 작성**

기존 `useFetch` 호출 구조를 기대하는 테스트를 제거하고 다음 동작을 검증한다.

```ts
const request = usePost<
  { id: string },
  { title: string }
>({
  url: '/api/v1/management/documents',
});

expect(request.status.value).toBe('idle');
expect(mockFetch).not.toHaveBeenCalled();

await request.execute({
  body: {
    title: '새 문서',
  },
});

expect(request.data.value).toEqual({
  id: 'document-1',
});
expect(request.error.value).toBeNull();
expect(request.status.value).toBe('success');
```

동시 실행, 최신 실행 결과 보존, 실행 중 reset, API 실패 뒤 수동 재실행도 독립 테스트로 작성한다.

- [ ] **Step 2: 직접 요청 테스트가 실패하는지 확인**

Run: `pnpm exec vitest run test/api-composables.test.ts`

Expected: FAIL because `app/composables/api/`의 직접 요청 구현이 아직 없다.

- [ ] **Step 3: 직접 요청 결과 타입과 상태 구현**

`app/types/api.types.ts`에 직접 요청 상태와 반환 계약을 둔다.

```ts
export type ApiRequestStatus =
  | 'error'
  | 'idle'
  | 'pending'
  | 'success';

export interface ApiRequestResult<
  TData,
  TInput,
> {
  data: Ref<TData | null | undefined>;
  error: Ref<ApiError | null>;
  pending: ComputedRef<boolean>;
  status: Ref<ApiRequestStatus>;
  execute: (input?: TInput) => Promise<TData | null>;
  reset: () => void;
}
```

`createApiRequest.ts`는 활성 실행 수와 최신 실행 번호를 별도로 관리한다. `reset()`은 표시 상태를 초기화하고 최신 실행 번호를 무효화하되 활성 실행 수는 그대로 둔다.

기본 헤더와 실행 헤더는 `Headers`로 병합해 대소문자가 다른 동일 키도 실행 값이 덮어쓰고, 그 밖의 기본 인증·CSRF 헤더는 보존한다.

- [ ] **Step 4: 메서드별 composable 구현**

각 파일은 HTTP 메서드만 고정하고 나머지는 `createApiRequest()`에 위임한다.

```ts
export function usePost<
  TData,
  TBody = unknown,
  TParams extends ApiParams = ApiParams,
>(
  input: ApiRequestOptions<TBody, TParams> & {
    url: string;
  },
) {
  return createApiRequest<
    TData,
    TBody,
    TParams
  >(
    'POST',
    input,
  );
}
```

barrel은 export만 포함하고 로직이나 별도 타입을 선언하지 않는다.

- [ ] **Step 5: 직접 요청 테스트 통과 확인**

Run: `pnpm exec vitest run test/api-composables.test.ts test/api-shared.test.ts test/api-request.test.ts`

Expected: PASS.

- [ ] **Step 6: 승인된 경우 Task 2 커밋**

```powershell
git add app/types/api.types.ts app/composables/api test/api-composables.test.ts test/api-shared.test.ts test/api-request.test.ts
git commit -m "2026 0903 feat: 직접 API 요청 컴포저블 복구"
```

---

### Task 3: Vue Query 계층 수렴과 재시도 제거

**Files:**
- Modify: `app/types/query.types.ts`
- Create: `app/composables/query/createMutation.ts`
- Modify: `app/composables/query/useGetQuery.ts`
- Modify: `app/composables/query/usePostMutation.ts`
- Modify: `app/composables/query/usePutMutation.ts`
- Modify: `app/composables/query/usePatchMutation.ts`
- Modify: `app/composables/query/useDeleteMutation.ts`
- Modify: `app/plugins/vue-query.ts`
- Modify: `test/query-composables.test.ts`
- Modify: `test/vue-query-plugin.test.ts`
- Delete: `test/query-keys.test.ts`

**Interfaces:**
- Consumes: `requestApi()` and `ApiError` from Task 1
- Produces: Vue Query 조회·mutation composable, `createMutation()`, 전역 `retry: false`

- [ ] **Step 1: HTTP 200 업무 실패와 무재시도 테스트 작성**

`test/query-composables.test.ts`의 `$fetch` 반환값을 공통 응답으로 바꾼다. 로컬 query key를 사용해 별도 예제 파일 의존을 제거한다.

```ts
mockFetch.mockResolvedValue({
  data: null,
  error: true,
  code: 'PERMISSION_DENIED',
  message: '권한이 없습니다.',
  details: null,
});

const result = await query?.refetch();

expect(result?.status).toBe('error');
expect(query?.data.value).toBeUndefined();
expect(mockFetch).toHaveBeenCalledOnce();
```

mutation 실패가 기존 query cache를 유지하는 경우와 GET·mutation 모두 요청 한 번만 수행하는 경우도 작성한다. `test/vue-query-plugin.test.ts`는 query와 mutation의 기본 `retry`가 모두 `false`인지 검사한다.

- [ ] **Step 2: Vue Query 집중 테스트가 실패하는지 확인**

Run: `pnpm exec vitest run test/query-composables.test.ts test/vue-query-plugin.test.ts`

Expected: FAIL because 현재 query 계층은 원시 객체를 성공으로 처리하고 조회 retry가 1이다.

- [ ] **Step 3: Query 타입 경계 정리**

`QueryOptionOverrides`에서 `retry`와 `retryOnMount`를, `MutationOptionOverrides`에서 `retry`를 제외해 호출부가 자동 재시도를 다시 켤 수 없게 한다.

```ts
export type QueryOptionOverrides<
  TData,
> = Omit<
  UseQueryOptions<TData | null, ApiError, TData | null, QueryKey>,
  'queryFn' | 'queryKey' | 'retry' | 'retryOnMount'
>;
```

`GetQueryInput`과 `MutationInput`은 전송 계약을 재정의하지 않고 `ApiParams`, `ApiFetchOptions`를 참조한다.

- [ ] **Step 4: 공통 mutation 팩토리 구현**

`createMutation.ts`는 메서드, key, URL, 정적 매개변수와 mutation body를 `requestApi()`로 연결한다.

```ts
return useMutation<TData | null, ApiError, TVariables, unknown>(
  {
    ...input.mutationOptions,
    mutationFn: async (variables) => await requestApi({
      body: variables,
      headers: toValue(input.headers),
      method,
      options: toValue(input.fetchOptions),
      params: toValue(input.params),
      url: toValue(input.url),
    }),
    mutationKey,
    retry: false,
  },
  input.queryClient,
);
```

메서드별 mutation 파일은 `createMutation()`에 해당 메서드만 전달한다.

- [ ] **Step 5: 조회 composable과 플러그인 수정**

`useGetQuery`는 `requestApi()`를 query function으로 사용하고 query context의 `signal`을 fetch option으로 전달한다. `retry: false`와 `retryOnMount: false`를 option 병합 뒤에 두고, 실패 상태일 때만 재마운트·포커스·재연결 재요청을 차단한다. 이를 위해 `refetchOnMount`, `refetchOnWindowFocus`, `refetchOnReconnect`의 기존 호출부 설정을 캡처하고, query 상태가 `error`일 때만 `false`를 반환하는 wrapper를 option 병합 뒤에 둔다. `app/plugins/vue-query.ts`도 자동 재시도 금지 기본값을 명시한다.

```ts
const refetchOnMount = input.queryOptions?.refetchOnMount;
const refetchOnReconnect = input.queryOptions?.refetchOnReconnect;
const refetchOnWindowFocus = input.queryOptions?.refetchOnWindowFocus;

return useQuery({
  ...input.queryOptions,
  refetchOnMount: (query) => {
    if (query.state.status === 'error') {
      return false;
    }

    return typeof refetchOnMount === 'function'
      ? refetchOnMount(query)
      : refetchOnMount;
  },
  refetchOnReconnect: (query) => {
    if (query.state.status === 'error') {
      return false;
    }

    return typeof refetchOnReconnect === 'function'
      ? refetchOnReconnect(query)
      : refetchOnReconnect;
  },
  refetchOnWindowFocus: (query) => {
    if (query.state.status === 'error') {
      return false;
    }

    return typeof refetchOnWindowFocus === 'function'
      ? refetchOnWindowFocus(query)
      : refetchOnWindowFocus;
  },
  retry: false,
  retryOnMount: false,
});
```

```ts
defaultOptions: {
  mutations: {
    retry: false,
  },
  queries: {
    retry: false,
    retryOnMount: false,
    staleTime: 5_000,
  },
},
```

- [ ] **Step 6: Vue Query 테스트 통과 확인**

Run: `pnpm exec vitest run test/query-composables.test.ts test/vue-query-plugin.test.ts`

Expected: PASS, 실패 후 자동 재마운트·포커스·재연결이 `$fetch` 호출 수를 늘리지 않는다.

- [ ] **Step 7: 승인된 경우 Task 3 커밋**

```powershell
git add app/types/query.types.ts app/composables/query app/plugins/vue-query.ts test/query-composables.test.ts test/vue-query-plugin.test.ts test/query-keys.test.ts
git commit -m "2026 0903 refactor: Vue Query 요청 계층과 무재시도 정책 통합"
```

---

### Task 4: 서버 공통 응답과 페이지네이션

**Files:**
- Modify: `server/utils/baseResponse.ts`
- Modify: `server/utils/pageData.ts`
- Modify: `app/data/response-code.data.ts`
- Modify: `app/data/response-message.data.ts`
- Modify: `test/page-data.test.ts`

**Interfaces:**
- Consumes: `ApiResponse<TData, TDetails>`, `TListData<TData>` from Task 1
- Produces: `BaseResponse.data()`, `BaseResponse.list()`, `BaseResponse.error()`, `pageData()`

- [ ] **Step 1: 응답 다섯 필드와 페이지 제한의 실패 테스트 작성**

`test/page-data.test.ts`에서 인자를 생략하면 10건만 반환하고, 100을 넘는 pageSize는 100으로 제한하며, 빈 목록은 1 기반 현재 페이지를 유지하는지 검사한다.

```ts
expect(BaseResponse.error(
  'REVISION_CONFLICT',
  '저장 충돌이 발생했습니다.',
  {
    currentRevisionId: 'revision-2',
  },
)).toEqual({
  data: null,
  error: true,
  code: 'REVISION_CONFLICT',
  message: '저장 충돌이 발생했습니다.',
  details: {
    currentRevisionId: 'revision-2',
  },
});
```

- [ ] **Step 2: 서버 유틸리티 테스트가 실패하는지 확인**

Run: `pnpm exec vitest run test/page-data.test.ts`

Expected: FAIL because 현재 응답에는 `details`가 없고 인자 생략 시 전체 목록을 반환한다.

- [ ] **Step 3: BaseResponse 다섯 필드 구현**

각 메서드는 `details`를 선택 입력으로 받고 기본 `null`을 반환한다.

```ts
public static data<
  TData,
  TDetails = unknown,
>(
  data: TData,
  code: string,
  message: string,
  details: TDetails | null = null,
): ApiResponse<TData, TDetails> {
  return {
    code,
    data,
    details,
    error: false,
    message,
  };
}
```

`list()`와 `error()`도 같은 키를 같은 순서로 반환한다. HTTP 상태를 설정하거나 예외를 던지지 않는다.

- [ ] **Step 4: 1 기반 페이지와 크기 제한 구현**

```ts
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const requestedPageSize = Number.isInteger(pageSize) && Number(pageSize) > 0
  ? Math.min(Number(pageSize), MAX_PAGE_SIZE)
  : DEFAULT_PAGE_SIZE;
```

빈 결과의 `page`는 1, `totalPages`는 0, `startIndex`와 `endIndex`는 0으로 둔다. 존재하는 마지막 페이지보다 큰 값은 마지막 페이지로 제한한다.

- [ ] **Step 5: 응답 코드 설명을 HTTP 상태에서 분리**

`response-code.data.ts`와 `response-message.data.ts`의 `2xx`, `4xx`, `500` 같은 주석을 업무 성공·실패 코드 설명으로 바꾼다. 값 자체는 이번 작업에서 새 제품 코드 체계로 확장하지 않는다.

- [ ] **Step 6: 서버 유틸리티 테스트 통과 확인**

Run: `pnpm exec vitest run test/page-data.test.ts`

Expected: PASS.

- [ ] **Step 7: 승인된 경우 Task 4 커밋**

```powershell
git add server/utils/baseResponse.ts server/utils/pageData.ts app/data/response-code.data.ts app/data/response-message.data.ts test/page-data.test.ts
git commit -m "2026 0903 refactor: 서버 공통 응답과 페이지 규칙 통일"
```

---

### Task 5: 중복·예제 코드 제거와 UI 기준선 정리

**Files:**
- Delete: `app/types/response.types.ts`
- Delete: `app/utils/api/api.ts`
- Delete: `app/utils/api/index.ts`
- Delete: `app/utils/api/README.md`
- Delete: `app/composables/domain/user/*.ts`
- Delete: `app/keys/users.keys.ts`
- Delete: `app/types/user.types.ts`
- Delete: `server/routes/api/v1/users/index.get.ts`
- Modify: `app/layouts/default.vue`
- Modify: `test/ui-panel.test.ts`
- Modify: `test/type-import-paths.contract.js`

**Interfaces:**
- Consumes: Tasks 1–4에서 이전을 마친 공통 계약과 요청기
- Produces: 중복 import와 승인되지 않은 예제 API가 없는 작업 트리

- [ ] **Step 1: 제거 대상의 소비처 정적 검사 작성**

`test/type-import-paths.contract.js`에 다음 계약을 추가한다.

```js
import fs from 'node:fs';
import path from 'node:path';

const sourceRoots = [
  'app',
  'server',
  'test',
];

const forbiddenImports = [
  '~/types/response.types',
  '~/utils/api',
  '/api/v1/users',
  '/api/users',
];
```

각 루트의 `.ts`, `.vue`, `.js` 파일을 읽어 금지 문자열이 없음을 assertion으로 검사한다. 검사 파일 자기 자신에 선언된 문자열은 대상에서 제외한다.

- [ ] **Step 2: 정적 계약 테스트가 실패하는지 확인**

Run: `pnpm exec vitest run test/type-import-paths.contract.js`

Expected: FAIL with current `response.types`, `utils/api`, example users references.

- [ ] **Step 3: 중복 타입·요청기와 예제 사용자 기능 제거**

Tasks 1–4에서 소비처 이전이 끝난 것을 `rg`로 확인한 뒤 나열된 파일을 삭제한다. `management/accounts` 경로의 대체 API나 composable은 만들지 않는다.

Run: `rg -n "types/response\.types|~/utils/api|/api/v1/users|/api/users|usersKeys|useGetUsers" app server test`

Expected: 정적 계약 테스트 자체를 제외하고 결과가 없어야 한다.

- [ ] **Step 4: 레이아웃과 UiPanel 기준선 수정**

`app/layouts/default.vue`에 명시 import를 추가한다.

```ts
import {
  storeToRefs,
} from 'pinia';
```

`test/ui-panel.test.ts`의 기본 radius 기대값은 제품 UI 원칙에 맞게 `rounded-1`로 변경한다. 컴포넌트 구현의 `rounded-1`은 변경하지 않는다.

- [ ] **Step 5: 타입 경로와 기존 실패 테스트 통과 확인**

Run: `pnpm exec vitest run test/type-import-paths.contract.js test/default-layout.test.ts test/ui-panel.test.ts`

Expected: PASS.

- [ ] **Step 6: 승인된 경우 Task 5 커밋**

```powershell
git add app server test/type-import-paths.contract.js test/default-layout.test.ts test/ui-panel.test.ts
git commit -m "2026 0903 chore: 템플릿 예제와 기준선 불일치 정리"
```

---

### Task 6: 전체 회귀 검증과 문서 정합성

**Files:**
- Modify only if verification finds an in-scope defect: files already listed in Tasks 1–5
- Verify: `docs/superpowers/specs/2026-09-03-quality-baseline-recovery-design.md`
- Verify: `docs/project-design/2026-09-03-omninode-route-api-design.md`
- Verify: `docs/work-design/2026-09-03-route-api-design-documentation.md`
- Verify: `AGENTS.md`

**Interfaces:**
- Consumes: Tasks 1–5의 전체 결과
- Produces: 제품 기능 구현에 진입할 수 있는 녹색 기준선과 검증 기록

- [ ] **Step 1: 집중 테스트 전체 실행**

Run:

```powershell
pnpm exec vitest run test/api-request.test.ts test/api-shared.test.ts test/api-composables.test.ts test/query-composables.test.ts test/vue-query-plugin.test.ts test/page-data.test.ts test/type-import-paths.contract.js test/default-layout.test.ts test/ui-panel.test.ts
```

Expected: PASS.

- [ ] **Step 2: 전체 테스트 실행**

Run: `pnpm test`

Expected: 모든 테스트 파일과 테스트가 PASS.

- [ ] **Step 3: 린트·타입 검사·빌드 실행**

Run:

```powershell
pnpm lint
pnpm exec vue-tsc --noEmit
pnpm build
```

Expected: 세 명령 모두 exit code 0.

- [ ] **Step 4: 구조와 정책 정적 검사**

Run:

```powershell
rg -n "types/response\.types|~/utils/api|/api/v1/users|/api/users|retry:\s*[1-9]|retry:\s*true" app server test
rg -n "data:|error:|code:|message:|details:" server/utils/baseResponse.ts
git diff --check
git status --short
```

Expected: 금지 구조 검색 결과 없음, `BaseResponse`의 각 반환 객체에 다섯 필드 존재, diff check 통과.

- [ ] **Step 5: 제품 범위 비변경 확인**

Run:

```powershell
git diff --name-only -- prisma app/pages
```

Expected: 출력 없음. 실제 제품 페이지와 Prisma 스키마가 변경되지 않아야 한다.

- [ ] **Step 6: 의존성 취약점 경로 확인**

Run: `pnpm audit`

Expected: 결과를 의존 패키지, 심각도, 직접·간접 의존 여부로 기록한다. 이 명령의 취약점 보고는 이번 구현 실패로 간주하지 않으며 패키지 업데이트도 수행하지 않는다.

- [ ] **Step 7: 승인된 경우 최종 문서와 잔여 변경 커밋**

```powershell
git add AGENTS.md docs/project-design/2026-09-03-omninode-route-api-design.md docs/work-design/2026-09-03-route-api-design-documentation.md docs/superpowers/specs/2026-09-03-quality-baseline-recovery-design.md docs/superpowers/plans/2026-09-03-quality-baseline-recovery.md
git commit -m "2026 0903 docs: 품질 기준선 복구 설계와 계획 확정"
```

푸시는 마스터가 명시적으로 요청한 경우에만 실행한다.
