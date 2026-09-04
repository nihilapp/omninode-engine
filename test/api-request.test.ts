import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestApi } from '../app/composables/api/requestApi';

const mockFetch = vi.fn();
const mockRequestFetch = vi.fn();

vi.stubGlobal('$fetch', mockFetch);

describe('requestApi', () => {
  afterEach(() => {
    mockFetch.mockReset();
    mockRequestFetch.mockReset();
    vi.unstubAllGlobals();
    vi.stubGlobal('$fetch', mockFetch);
  });

  it('uses the request-scoped fetcher for a relative internal URL', async () => {
    vi.stubGlobal(
      'useRequestFetch',
      () => mockRequestFetch,
    );
    mockRequestFetch.mockResolvedValue({
      code: 'SUCCESS',
      data: {
        id: 'account-1',
      },
      details: null,
      error: false,
      message: '조회했습니다.',
    });

    await expect(requestApi<{ id: string }>({
      method: 'GET',
      options: {
        baseURL: '/internal',
      },
      url: '/api/v1/management/accounts/account-1',
    })).resolves.toEqual({
      id: 'account-1',
    });

    expect(mockRequestFetch).toHaveBeenCalledOnce();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it.each([
    'https://external.example',
    '//external.example',
  ])('uses the global fetcher for a relative URL with external baseURL %s', async (
    baseURL,
  ) => {
    vi.stubGlobal(
      'useRequestFetch',
      () => mockRequestFetch,
    );
    mockFetch.mockResolvedValue({
      code: 'SUCCESS',
      data: {
        status: 'ok',
      },
      details: null,
      error: false,
      message: '조회했습니다.',
    });

    await expect(requestApi<{ status: string }>({
      method: 'GET',
      options: {
        baseURL,
      },
      url: '/statuses',
    })).resolves.toEqual({
      status: 'ok',
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockRequestFetch).not.toHaveBeenCalled();
  });

  it('uses the global fetcher for an absolute external URL', async () => {
    vi.stubGlobal(
      'useRequestFetch',
      () => mockRequestFetch,
    );
    mockFetch.mockResolvedValue({
      code: 'SUCCESS',
      data: {
        status: 'ok',
      },
      details: null,
      error: false,
      message: '조회했습니다.',
    });

    await expect(requestApi<{ status: string }>({
      method: 'GET',
      url: 'https://external.example/api/statuses',
    })).resolves.toEqual({
      status: 'ok',
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockRequestFetch).not.toHaveBeenCalled();
  });

  it('passes an AbortSignal through fetch options', async () => {
    const controller = new AbortController();

    vi.stubGlobal(
      'useRequestFetch',
      () => mockRequestFetch,
    );

    mockRequestFetch.mockResolvedValue({
      code: 'SUCCESS',
      data: null,
      details: null,
      error: false,
      message: '조회했습니다.',
    });

    await requestApi({
      method: 'GET',
      options: {
        signal: controller.signal,
      },
      url: '/api/v1/management/accounts',
    });

    expect(mockRequestFetch).toHaveBeenCalledWith(
      '/api/v1/management/accounts',
      expect.objectContaining({
        signal: controller.signal,
      }),
    );
  });

  it.each([
    [
      'native Headers',
      new Headers([
        [
          'Authorization',
          'Bearer token',
        ],
        [
          'X-CSRF-Token',
          'csrf-token',
        ],
      ]),
    ],
    [
      'tuple headers',
      [
        [
          'Authorization',
          'Bearer token',
        ],
        [
          'X-CSRF-Token',
          'csrf-token',
        ],
      ],
    ],
    [
      'plain object headers',
      {
        Authorization: 'Bearer token',
        'X-CSRF-Token': 'csrf-token',
      },
    ],
  ] as const)('serializes %s to a plain header record for H3 forwarding', async (
    _label,
    headers,
  ) => {
    mockFetch.mockResolvedValue({
      code: 'SUCCESS',
      data: null,
      details: null,
      error: false,
      message: '요청을 처리했습니다.',
    });

    await requestApi({
      headers,
      method: 'POST',
      url: '/api/v1/management/documents',
    });

    const serializedHeaders = mockFetch.mock.calls[0]?.[1]?.headers;
    const forwardedHeaders = {
      'X-Inbound-Header': 'inbound',
      ...serializedHeaders,
    };
    const h3Headers = new Headers(forwardedHeaders);

    expect(Object.getPrototypeOf(serializedHeaders)).toBe(Object.prototype);
    expect(h3Headers.get('authorization')).toBe('Bearer token');
    expect(h3Headers.get('x-csrf-token')).toBe('csrf-token');
    expect(h3Headers.get('x-inbound-header')).toBe('inbound');
  });

  it('returns only data from a successful HTTP 200 API response', async () => {
    mockFetch.mockResolvedValue({
      code: 'SUCCESS',
      data: {
        id: 'document-1',
      },
      details: null,
      error: false,
      message: '저장했습니다.',
    });

    await expect(requestApi<{ id: string }>({
      method: 'POST',
      url: '/api/v1/management/documents',
    })).resolves.toEqual({
      id: 'document-1',
    });
  });

  it('throws an API error for an HTTP 200 business failure and disables retries', async () => {
    mockFetch.mockResolvedValue({
      code: 'REVISION_CONFLICT',
      data: null,
      details: {
        currentRevisionId: 'revision-2',
      },
      error: true,
      message: '저장 충돌이 발생했습니다.',
    });

    await expect(requestApi({
      method: 'PATCH',
      url: '/api/v1/management/documents/document-1',
    })).rejects.toMatchObject({
      code: 'REVISION_CONFLICT',
      details: {
        currentRevisionId: 'revision-2',
      },
      kind: 'api',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/management/documents/document-1',
      expect.objectContaining({
        method: 'PATCH',
        retry: 0,
      }),
    );
  });

  it('normalizes a $fetch transport failure as a network error', async () => {
    const cause = new Error('연결할 수 없습니다.');
    vi.stubGlobal(
      'useRequestFetch',
      () => mockRequestFetch,
    );
    mockRequestFetch.mockRejectedValue(cause);

    await expect(requestApi({
      method: 'GET',
      url: '/api/v1/management/documents',
    })).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      details: null,
      kind: 'network',
    });
  });

  it('rejects a response that violates the five-field API contract', async () => {
    mockRequestFetch.mockResolvedValue({
      code: 'SUCCESS',
      data: {
        id: 'document-1',
      },
      error: false,
      message: '조회했습니다.',
    });

    await expect(requestApi({
      method: 'GET',
      url: '/api/v1/management/documents/document-1',
    })).rejects.toMatchObject({
      code: 'INVALID_API_RESPONSE',
      details: null,
      kind: 'invalid-response',
    });
  });
});
