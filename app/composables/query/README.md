# Vue Query 래퍼 사용 가이드

`app/composables/query`에는 HTTP 메서드별 Vue Query 래퍼 훅만 둡니다.

## 규칙

- 훅은 파일당 하나입니다.
- 타입은 모두 `app/types`에 둡니다.
- GET은 `useQuery`, 나머지는 `useMutation`을 사용합니다.
- 도메인 규칙은 `app/composables/domain`에서 결정합니다.

## 제공 훅

```text
GET     → useGetQuery
POST    → usePostMutation
PUT     → usePutMutation
PATCH   → usePatchMutation
DELETE  → useDeleteMutation
```

## useGetQuery

```ts
const query = useGetQuery<ExampleItem[]>({
  key: [
    'example',
    'list',
  ],
  url: '/approved-endpoint',
});
```

외부 제어 가능 항목:

```ts
key
url
params
headers
fetchOptions
queryOptions
queryClient
```

## Mutation

```ts
const mutation = usePostMutation<ExampleItem, ExampleInput>({
  key: [
    'example',
    'create',
  ],
  url: '/approved-endpoint',
});

await mutation.mutateAsync({
  title: '예시',
});
```

`mutate()` 또는 `mutateAsync()`에 전달한 값이 HTTP body가 됩니다.
Query params가 필요하면 mutation 훅 생성 시 `params`에 지정합니다.

제품 도메인별 query key와 composable은 해당 제품 API가 승인된 뒤에 추가합니다.
