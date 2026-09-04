import {
  computed,
  toValue,
} from 'vue';

import {
  useQuery,
} from '@tanstack/vue-query';

import type {
  MaybeRefDeep,
  QueryKey,
} from '@tanstack/vue-query';

import {
  requestApi,
} from '~/composables/api/requestApi';

import type {
  ApiError,
} from '~/types/api.types';

import type {
  GetQueryInput,
} from '~/types/query.types';

export function useGetQuery<
  TData,
>(
  input: GetQueryInput<TData>,
) {
  const queryKey = computed<QueryKey>(() => toValue(input.key));
  const refetchOnMount = input.queryOptions?.refetchOnMount;
  const refetchOnReconnect = input.queryOptions?.refetchOnReconnect;
  const refetchOnWindowFocus = input.queryOptions?.refetchOnWindowFocus;

  return useQuery<TData | null, ApiError, TData | null, QueryKey>(
    {
      ...input.queryOptions,
      queryFn: async (
        { signal, },
      ) => await requestApi<TData>({
        headers: toValue(input.headers),
        method: 'GET',
        options: {
          ...toValue(input.fetchOptions),
          signal,
        },
        params: toValue(input.params),
        url: toValue(input.url),
      }),
      queryKey: queryKey as MaybeRefDeep<QueryKey>,
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
    },
    input.queryClient,
  );
}
