import {
  computed,
  toValue,
} from 'vue';

import {
  useMutation,
} from '@tanstack/vue-query';

import type {
  MutationKey,
} from '@tanstack/vue-query';

import {
  requestApi,
} from '~/composables/api/requestApi';

import type {
  ApiError,
  ApiMethod,
} from '~/types/api.types';

import type {
  MutationInput,
} from '~/types/query.types';

export function createMutation<
  TData,
  TVariables = void,
>(
  method: Exclude<ApiMethod, 'GET'>,
  input: MutationInput<TData, TVariables>,
) {
  const mutationKey = computed<MutationKey>(() => toValue(input.key));

  return useMutation<TData | null, ApiError, TVariables, unknown>(
    {
      ...input.mutationOptions,
      mutationFn: async (variables) => await requestApi<TData, TVariables>({
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
}
