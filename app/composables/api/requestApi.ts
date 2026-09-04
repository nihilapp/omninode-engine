import type {
  ApiRequestInput,
  ApiResponse,
} from '~/types/api.types';

import {
  createApiError,
  isApiResponse,
  normalizeApiError,
} from './shared';

function isExternalUrl(
  url: string,
) {
  return /^[a-z][a-z\d+.-]*:/i.test(url)
    || url.startsWith('//');
}

function canUseRequestFetcher(
  url: string,
  baseURL?: string,
) {
  if (
    isExternalUrl(url)
    || !url.startsWith('/')
  ) {
    return false;
  }

  return baseURL === undefined
    || (
      baseURL.startsWith('/')
      && !baseURL.startsWith('//')
    );
}

function resolveApiFetcher(
  url: string,
  baseURL?: string,
) {
  if (
    canUseRequestFetcher(
      url,
      baseURL,
    )
    && typeof useRequestFetch === 'function'
  ) {
    try {
      return useRequestFetch();
    } catch {
      return $fetch;
    }
  }

  return $fetch;
}

function serializeHeaders(
  headers?: HeadersInit,
) {
  if (headers === undefined) {
    return undefined;
  }

  return Object.fromEntries(new Headers(headers).entries());
}

export async function requestApi<
  TData,
  TBody = unknown,
  TParams extends object = object,
  TDetails = unknown,
>(
  input: ApiRequestInput<TBody, TParams>,
): Promise<TData | null> {
  let response: ApiResponse<TData, TDetails>;
  const fetcher = resolveApiFetcher(
    input.url,
    input.options?.baseURL,
  );

  try {
    response = await fetcher<ApiResponse<TData, TDetails>>(
      input.url,
      {
        ...input.options,
        body: input.body as BodyInit | Record<string, unknown> | null | undefined,
        headers: serializeHeaders(input.headers),
        method: input.method,
        query: input.params,
        retry: 0,
      },
    );
  } catch (cause) {
    throw normalizeApiError(cause);
  }

  if (!isApiResponse<TData, TDetails>(response)) {
    throw createApiError(
      'invalid-response',
      'INVALID_API_RESPONSE',
      'API 응답 형식이 올바르지 않습니다.',
      null,
    );
  }

  if (response.error) {
    throw createApiError(
      'api',
      response.code,
      response.message,
      response.details,
    );
  }

  return response.data;
}
