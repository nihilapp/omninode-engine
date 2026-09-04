import { describe, expect, it } from 'vitest';

import {
  createApiError,
  isApiResponse,
  normalizeApiError,
} from '../app/composables/api/shared';

describe('isApiResponse', () => {
  it('accepts an API response with all five required fields', () => {
    expect(isApiResponse({
      code: 'SUCCESS',
      data: {
        id: 'document-1',
      },
      details: null,
      error: false,
      message: '조회했습니다.',
    })).toBe(true);
  });

  it('rejects a response that omits a required field', () => {
    expect(isApiResponse({
      code: 'SUCCESS',
      data: null,
      error: false,
      message: '조회했습니다.',
    })).toBe(false);
  });

  it('rejects a response with incorrectly typed common fields', () => {
    expect(isApiResponse({
      code: 200,
      data: null,
      details: null,
      error: 'false',
      message: null,
    })).toBe(false);
  });
});

describe('createApiError', () => {
  it('returns an Error instance with API error identifiers', () => {
    const cause = new Error('원본 오류');
    const error = createApiError(
      'api',
      'REVISION_CONFLICT',
      '저장 충돌이 발생했습니다.',
      {
        currentRevisionId: 'revision-2',
      },
      cause,
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      cause,
      code: 'REVISION_CONFLICT',
      details: {
        currentRevisionId: 'revision-2',
      },
      kind: 'api',
      message: '저장 충돌이 발생했습니다.',
    });
  });
});

describe('normalizeApiError', () => {
  it('classifies an AbortError as cancelled', () => {
    const cause = new Error('요청이 취소되었습니다.');
    cause.name = 'AbortError';

    expect(normalizeApiError(cause)).toMatchObject({
      code: 'REQUEST_CANCELLED',
      details: null,
      kind: 'cancelled',
    });
  });

  it('classifies a response-less failure as network', () => {
    const cause = new Error('연결할 수 없습니다.');

    expect(normalizeApiError(cause)).toMatchObject({
      code: 'NETWORK_ERROR',
      details: null,
      kind: 'network',
    });
  });

  it('classifies an AbortError nested in an ofetch-style cause chain as cancelled', () => {
    const abortCause = new Error('요청이 취소되었습니다.');
    abortCause.name = 'AbortError';
    const fetchError = Object.assign(
      new Error('Fetch failed'),
      {
        cause: Object.assign(
          new Error('Request failed'),
          {
            cause: abortCause,
          },
        ),
      },
    );

    expect(normalizeApiError(fetchError)).toMatchObject({
      code: 'REQUEST_CANCELLED',
      details: null,
      kind: 'cancelled',
    });
  });

  it('traverses a circular cause chain safely', () => {
    const cause = new Error('연결할 수 없습니다.') as Error & {
      cause?: unknown;
    };
    cause.cause = cause;

    expect(normalizeApiError(cause)).toMatchObject({
      code: 'NETWORK_ERROR',
      details: null,
      kind: 'network',
    });
  });

  it('does not expose authentication headers from a transport failure', () => {
    const cause = Object.assign(
      new Error('Fetch failed'),
      {
        options: {
          headers: {
            Authorization: 'Bearer secret-token',
            Cookie: 'session=secret-session',
          },
        },
      },
    );
    const error = normalizeApiError(cause);

    expect(error.cause).toBeUndefined();
    expect(JSON.stringify(error)).not.toContain('secret-token');
    expect(JSON.stringify(error)).not.toContain('secret-session');
  });
});
