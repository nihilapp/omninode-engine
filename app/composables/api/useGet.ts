import type {
  ApiGetOptions,
  ApiParams,
} from '~/types/api.types';

import {
  createApiRequest,
} from './createApiRequest';

export function useGet<
  TData,
  TParams extends ApiParams = ApiParams,
>(
  input: ApiGetOptions<TParams> & {
    url: string;
  },
) {
  return createApiRequest<
    TData,
    never,
    TParams
  >(
    'GET',
    input,
  );
}
