import type {
  MutationKey,
  QueryClient,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/vue-query';

import type {
  MaybeRefOrGetter,
} from 'vue';

import type {
  ApiError,
  ApiFetchOptions,
  ApiParams,
} from '~/types/api.types';

export type QueryOptionOverrides<
  TData,
> = Omit<
  UseQueryOptions<TData | null, ApiError, TData | null, QueryKey>,
  'queryFn' | 'queryKey' | 'retry' | 'retryOnMount'
>;

export interface GetQueryInput<TData> {
  key: MaybeRefOrGetter<QueryKey>;
  url: MaybeRefOrGetter<string>;
  params?: MaybeRefOrGetter<ApiParams | undefined>;
  headers?: MaybeRefOrGetter<HeadersInit | undefined>;
  fetchOptions?: MaybeRefOrGetter<ApiFetchOptions | undefined>;
  queryOptions?: QueryOptionOverrides<TData>;
  queryClient?: QueryClient;
}

export type MutationOptionOverrides<
  TData,
  TVariables = void,
> = Omit<
  UseMutationOptions<TData | null, ApiError, TVariables, unknown>,
  'mutationFn' | 'mutationKey' | 'retry'
>;

export interface MutationInput<
  TData,
  TVariables = void,
> {
  key: MaybeRefOrGetter<MutationKey>;
  url: MaybeRefOrGetter<string>;
  params?: MaybeRefOrGetter<ApiParams | undefined>;
  headers?: MaybeRefOrGetter<HeadersInit | undefined>;
  fetchOptions?: MaybeRefOrGetter<ApiFetchOptions | undefined>;
  mutationOptions?: MutationOptionOverrides<TData, TVariables>;
  queryClient?: QueryClient;
}
