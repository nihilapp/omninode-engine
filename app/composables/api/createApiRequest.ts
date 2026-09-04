import {
  computed,
  ref,
} from 'vue';

import type {
  ApiError,
  ApiMethod,
  ApiParams,
  ApiRequestOptions,
  ApiRequestResult,
  ApiRequestStatus,
} from '~/types/api.types';

import {
  requestApi,
} from './requestApi';

function mergeHeaders(
  defaultHeaders?: HeadersInit,
  executionHeaders?: HeadersInit,
) {
  if (
    defaultHeaders === undefined
    && executionHeaders === undefined
  ) {
    return undefined;
  }

  const headers = new Headers(defaultHeaders);

  new Headers(executionHeaders).forEach(
    (value, key) => {
      headers.set(
        key,
        value,
      );
    },
  );

  return headers;
}

export function createApiRequest<
  TData,
  TBody = unknown,
  TParams extends ApiParams = ApiParams,
>(
  method: ApiMethod,
  input: ApiRequestOptions<TBody, TParams> & {
    url: string;
  },
): ApiRequestResult<
  TData,
  ApiRequestOptions<TBody, TParams>
> {
  const activeExecutionCount = ref(0);
  const latestExecutionId = ref(0);
  const data = ref<TData | null>();
  const error = ref<ApiError | null>(null);
  const status = ref<ApiRequestStatus>('idle');
  const pending = computed(() => activeExecutionCount.value > 0);

  const execute = async (
    executionInput: ApiRequestOptions<TBody, TParams> = {},
  ): Promise<TData | null> => {
    const executionId = latestExecutionId.value + 1;

    latestExecutionId.value = executionId;
    activeExecutionCount.value += 1;
    error.value = null;
    status.value = 'pending';

    try {
      const headers = mergeHeaders(
        input.headers,
        executionInput.headers,
      );
      const result = await requestApi<TData, TBody, TParams>({
        ...input,
        ...executionInput,
        headers,
        method,
      });

      if (executionId === latestExecutionId.value) {
        data.value = result;
        error.value = null;
        status.value = 'success';
      }

      return result;
    } catch (cause) {
      const apiError = cause as ApiError;

      if (executionId === latestExecutionId.value) {
        error.value = apiError;
        status.value = 'error';
      }

      throw apiError;
    } finally {
      activeExecutionCount.value -= 1;
    }
  };

  const reset = () => {
    latestExecutionId.value += 1;
    data.value = undefined;
    error.value = null;
    status.value = 'idle';
  };

  return {
    data,
    error,
    execute,
    pending,
    reset,
    status,
  };
}
