import type {
  ApiParams,
  ApiRequestOptions,
} from '~/types/api.types';

import {
  createApiRequest,
} from './createApiRequest';

export function usePatch<
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
    'PATCH',
    input,
  );
}
