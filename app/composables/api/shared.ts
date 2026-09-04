import type {
  ApiError,
  ApiErrorKind,
  ApiResponse,
} from '~/types/api.types';

export function isApiResponse<
  TData,
  TDetails = unknown,
>(value: unknown): value is ApiResponse<TData, TDetails> {
  if (
    typeof value !== 'object'
    || value === null
    || Array.isArray(value)
  ) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    Object.hasOwn(response, 'data')
    && response.data !== undefined
    && Object.hasOwn(response, 'details')
    && response.details !== undefined
    && typeof response.error === 'boolean'
    && typeof response.code === 'string'
    && typeof response.message === 'string'
  );
}

export function createApiError<
  TDetails = unknown,
>(
  kind: ApiErrorKind,
  code: string,
  message: string,
  details: TDetails | null,
  cause?: unknown,
): ApiError<TDetails> {
  return Object.assign(
    new Error(message),
    {
      cause,
      code,
      details,
      kind,
    },
  );
}

export function normalizeApiError(
  cause: unknown,
): ApiError {
  const visitedCauses = new Set<unknown>();
  let currentCause = cause;
  let isCancelled = false;

  while (
    typeof currentCause === 'object'
    && currentCause !== null
    && !visitedCauses.has(currentCause)
  ) {
    visitedCauses.add(currentCause);

    if (
      'name' in currentCause
      && currentCause.name === 'AbortError'
    ) {
      isCancelled = true;
      break;
    }

    currentCause = 'cause' in currentCause
      ? currentCause.cause
      : undefined;
  }

  if (isCancelled) {
    return createApiError(
      'cancelled',
      'REQUEST_CANCELLED',
      '요청이 취소되었습니다.',
      null,
    );
  }

  return createApiError(
    'network',
    'NETWORK_ERROR',
    '네트워크 요청에 실패했습니다.',
    null,
  );
}
