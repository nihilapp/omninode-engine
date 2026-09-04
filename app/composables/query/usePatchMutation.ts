import {
  createMutation,
} from './createMutation';

import type {
  MutationInput,
} from '~/types/query.types';

export function usePatchMutation<
  TData,
  TVariables = void,
>(
  input: MutationInput<TData, TVariables>,
) {
  return createMutation<TData, TVariables>(
    'PATCH',
    input,
  );
}
