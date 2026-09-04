import {
  createMutation,
} from './createMutation';

import type {
  MutationInput,
} from '~/types/query.types';

export function useDeleteMutation<
  TData,
  TVariables = void,
>(
  input: MutationInput<TData, TVariables>,
) {
  return createMutation<TData, TVariables>(
    'DELETE',
    input,
  );
}
