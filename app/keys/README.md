# Query Key Builder

`app/keys/`는 TanStack Vue Query의 query key를 도메인별로 생성하는 폴더입니다. 호출부에서 배열을 직접 만들지 않고, 반드시 해당 도메인의 Key Builder를 사용합니다.

## 파일 규칙

- 파일명은 `<도메인>.query-keys.ts` 형식을 사용합니다.
- 파일 하나는 하나의 도메인 query key만 소유합니다.
- key에는 함수나 class 인스턴스처럼 직렬화할 수 없는 값을 넣지 않습니다.
- 목록 조건은 `list(params)`의 마지막 요소로 넣고, 동일 조건은 같은 형태의 객체로 전달합니다.

## Key 계층

각 Builder는 전체 도메인, 목록, 조건부 목록, 상세 순서로 범위를 나눕니다.

```ts
export const documentQueryKeys = {
  all: () => [ 'documents' ] as const,
  lists: () => [ ...documentQueryKeys.all(), 'list' ] as const,
  list: (
    params: DocumentListParams,
  ) => [ ...documentQueryKeys.lists(), params ] as const,
  detail: (
    documentId: string,
  ) => [ ...documentQueryKeys.all(), 'detail', documentId ] as const,
};
```

## Query 훅에서 사용

도메인 훅은 Builder가 만든 key와 내부 fetcher를 함께 소유합니다.

```ts
export function useDocumentListQuery(
  params: DocumentListParams,
) {
  return useGetQuery<DocumentListResponse>({
    queryKey: documentQueryKeys.list(params),
    queryOptions: {
      enabled: false,
    },
    url: '/api/documents',
    params,
  });
}
```

호출부는 반환된 `refetch()`를 원하는 시점에 실행합니다.

```ts
const documentsQuery = useDocumentListQuery({
  page: 1,
});

await documentsQuery.refetch();
```

## 캐시 무효화

목록을 갱신할 때는 목록 범위만 무효화합니다.

```ts
queryClient.invalidateQueries({
  queryKey: documentQueryKeys.lists(),
});
```

특정 문서만 갱신할 때는 상세 key를 사용합니다.

```ts
queryClient.invalidateQueries({
  queryKey: documentQueryKeys.detail(documentId),
});
```

도메인의 모든 query를 무효화해야 할 때만 `all()`을 사용합니다.
