import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  useDelete,
  useGet,
  usePatch,
  usePost,
  usePut,
} from '../app/composables/api';

const mockFetch = vi.fn();

vi.stubGlobal('$fetch', mockFetch);

function createDeferred<TData>() {
  let resolve: (value: TData) => void;

  const promise = new Promise<TData>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return {
    promise,
    resolve: (value: TData) => resolve(value),
  };
}

function createSuccessResponse<TData>(
  data: TData | null,
) {
  return {
    code: 'SUCCESS',
    data,
    details: null,
    error: false,
    message: '요청을 처리했습니다.',
  };
}

describe('직접 API 요청 composable', () => {
  afterEach(() => {
    mockFetch.mockReset();
  });

  it('POST 요청은 초기 호출 없이 실행 후 성공 상태를 표시한다', async () => {
    mockFetch.mockResolvedValue(createSuccessResponse({
      id: 'document-1',
    }));
    const request = usePost<
      { id: string },
      { title: string }
    >({
      url: '/api/v1/management/documents',
    });

    expect(request.status.value).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();

    await expect(request.execute({
      body: {
        title: '새 문서',
      },
    })).resolves.toEqual({
      id: 'document-1',
    });

    expect(request.data.value).toEqual({
      id: 'document-1',
    });
    expect(request.error.value).toBeNull();
    expect(request.status.value).toBe('success');
  });

  it('동시 실행 중에는 먼저 시작한 요청이 끝나도 pending 상태를 유지한다', async () => {
    const first = createDeferred<ReturnType<typeof createSuccessResponse<number>>>();
    const second = createDeferred<ReturnType<typeof createSuccessResponse<number>>>();
    mockFetch
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const request = usePost<number>({
      url: '/api/v1/management/documents',
    });

    const firstExecution = request.execute();
    const secondExecution = request.execute();

    expect(request.pending.value).toBe(true);
    first.resolve(createSuccessResponse(1));
    await firstExecution;

    expect(request.pending.value).toBe(true);
    second.resolve(createSuccessResponse(2));
    await secondExecution;

    expect(request.pending.value).toBe(false);
  });

  it('더 늦게 끝난 이전 실행이 최신 실행의 성공 결과를 덮어쓰지 않는다', async () => {
    const first = createDeferred<ReturnType<typeof createSuccessResponse<null>>>();
    const second = createDeferred<ReturnType<typeof createSuccessResponse<{ id: string }>>>();
    mockFetch
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const request = usePost<{ id: string }>({
      url: '/api/v1/management/documents',
    });

    const firstExecution = request.execute();
    const secondExecution = request.execute();

    second.resolve(createSuccessResponse({
      id: 'document-2',
    }));
    await secondExecution;
    first.resolve({
      code: 'REVISION_CONFLICT',
      data: null,
      details: null,
      error: true,
      message: '저장 충돌이 발생했습니다.',
    });
    await expect(firstExecution).rejects.toMatchObject({
      code: 'REVISION_CONFLICT',
      kind: 'api',
    });

    expect(request.data.value).toEqual({
      id: 'document-2',
    });
    expect(request.error.value).toBeNull();
    expect(request.status.value).toBe('success');
  });

  it('실행 중 reset은 활성 요청을 유지하면서 표시 상태만 초기화한다', async () => {
    const deferred = createDeferred<ReturnType<typeof createSuccessResponse<{ id: string }>>>();
    mockFetch.mockReturnValueOnce(deferred.promise);
    const request = usePost<{ id: string }>({
      url: '/api/v1/management/documents',
    });

    const execution = request.execute();
    request.reset();

    expect(request.data.value).toBeUndefined();
    expect(request.error.value).toBeNull();
    expect(request.pending.value).toBe(true);
    expect(request.status.value).toBe('idle');

    deferred.resolve(createSuccessResponse({
      id: 'document-1',
    }));
    await execution;

    expect(request.data.value).toBeUndefined();
    expect(request.error.value).toBeNull();
    expect(request.pending.value).toBe(false);
    expect(request.status.value).toBe('idle');
  });

  it('API 실패 뒤 사용자가 다시 실행하면 성공 상태로 복구한다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        code: 'REVISION_CONFLICT',
        data: null,
        details: null,
        error: true,
        message: '저장 충돌이 발생했습니다.',
      })
      .mockResolvedValueOnce(createSuccessResponse({
        id: 'document-1',
      }));
    const request = usePost<{ id: string }>({
      url: '/api/v1/management/documents',
    });

    await expect(request.execute()).rejects.toMatchObject({
      code: 'REVISION_CONFLICT',
      kind: 'api',
    });
    expect(request.data.value).toBeUndefined();
    expect(request.error.value).toMatchObject({
      code: 'REVISION_CONFLICT',
    });
    expect(request.status.value).toBe('error');

    await expect(request.execute()).resolves.toEqual({
      id: 'document-1',
    });

    expect(request.data.value).toEqual({
      id: 'document-1',
    });
    expect(request.error.value).toBeNull();
    expect(request.status.value).toBe('success');
  });

  it('실행 헤더는 기본 헤더를 보존하고 같은 키만 덮어쓴다', async () => {
    mockFetch.mockResolvedValue(createSuccessResponse(null));
    const request = usePost<null>({
      headers: {
        Authorization: 'Bearer default-token',
        'X-CSRF-Token': 'default-csrf',
      },
      url: '/api/v1/management/documents',
    });

    await request.execute({
      headers: {
        authorization: 'Bearer execution-token',
        'X-Request-Id': 'request-1',
      },
    });

    const requestHeaders = new Headers({
      'X-Inbound-Header': 'inbound',
      ...mockFetch.mock.calls[0]?.[1]?.headers,
    });

    expect(requestHeaders.get('authorization')).toBe('Bearer execution-token');
    expect(requestHeaders.get('x-csrf-token')).toBe('default-csrf');
    expect(requestHeaders.get('x-request-id')).toBe('request-1');
    expect(requestHeaders.get('x-inbound-header')).toBe('inbound');
  });

  it('실행 입력이 생략한 body·params·options 기본값을 보존한다', async () => {
    const controller = new AbortController();

    mockFetch.mockResolvedValue(createSuccessResponse(null));
    const request = usePost<
      null,
      { title: string },
      { projectId: string }
    >({
      body: {
        title: '기본 문서',
      },
      options: {
        signal: controller.signal,
      },
      params: {
        projectId: 'project-1',
      },
      url: '/api/v1/management/documents',
    });

    await request.execute();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/management/documents',
      expect.objectContaining({
        body: {
          title: '기본 문서',
        },
        query: {
          projectId: 'project-1',
        },
        signal: controller.signal,
      }),
    );
  });

  it.each([
    [
      'GET',
      useGet,
    ],
    [
      'PUT',
      usePut,
    ],
    [
      'PATCH',
      usePatch,
    ],
    [
      'DELETE',
      useDelete,
    ],
  ] as const)('%s composable은 해당 HTTP 메서드로 요청한다', async (
    method,
    useRequest,
  ) => {
    mockFetch.mockResolvedValue(createSuccessResponse(null));
    const request = useRequest({
      url: '/api/v1/management/documents/document-1',
    });

    await expect(request.execute()).resolves.toBeNull();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/management/documents/document-1',
      expect.objectContaining({
        method,
        retry: 0,
      }),
    );
  });
});
