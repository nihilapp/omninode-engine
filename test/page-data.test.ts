import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  responseCodeData,
} from '../app/data/response-code.data';
import {
  responseMessageData,
} from '../app/data/response-message.data';
import {
  BaseResponse,
} from '../server/utils/baseResponse';
import {
  pageData,
} from '../server/utils/pageData';

describe('pageData', () => {
  it('page와 pageSize가 없으면 기본 크기 10건만 반환한다', () => {
    const result = pageData(
      Array.from({ length: 12, }, (_, index) => index + 1),
    );

    expect(result).toEqual({
      list: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
      ],
      page: 1,
      pageSize: 10,
      totalElements: 12,
      numberOfElements: 10,
      startIndex: 1,
      endIndex: 10,
      hasPrev: false,
      hasNext: true,
      isFirst: true,
      isLast: false,
      empty: false,
      totalPages: 2,
    });
  });

  it('pageSize가 100을 넘으면 100으로 제한한다', () => {
    const result = pageData(
      Array.from({ length: 101, }, (_, index) => index + 1),
      1,
      101,
    );

    expect(result.pageSize).toBe(100);
    expect(result.list).toHaveLength(100);
    expect(result.totalPages).toBe(2);
  });

  it('빈 목록도 1 기반 현재 페이지를 유지한다', () => {
    const result = pageData(
      [
      ],
      5,
      10,
    );

    expect(result).toMatchObject({
      page: 1,
      totalPages: 0,
      startIndex: 0,
      endIndex: 0,
    });
  });

  it('요청한 페이지 크기만큼 목록 메타데이터를 계산한다', () => {
    const result = pageData(
      Array.from({ length: 30, }, (_, index) => index + 1),
      2,
      10,
    );

    expect(result).toEqual({
      list: [
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
      ],
      page: 2,
      pageSize: 10,
      totalElements: 30,
      numberOfElements: 10,
      startIndex: 11,
      endIndex: 20,
      hasPrev: true,
      hasNext: true,
      isFirst: false,
      isLast: false,
      empty: false,
      totalPages: 3,
    });
  });
});

describe('BaseResponse.list', () => {
  it('계산된 페이지 데이터를 그대로 응답에 담는다', () => {
    const data = pageData(
      [
        'first',
        'second',
      ],
      1,
      10,
    );
    const result = BaseResponse.list(
      data,
      responseCodeData.OK,
      responseMessageData.OK,
    );

    expect(result).toMatchObject({
      data,
      error: false,
      code: responseCodeData.OK,
      message: responseMessageData.OK,
      details: null,
    });
  });
});

describe('BaseResponse.error', () => {
  it('오류 세부 정보를 다섯 필드 응답에 담는다', () => {
    expect(BaseResponse.error(
      'REVISION_CONFLICT',
      '저장 충돌이 발생했습니다.',
      {
        currentRevisionId: 'revision-2',
      },
    )).toEqual({
      data: null,
      error: true,
      code: 'REVISION_CONFLICT',
      message: '저장 충돌이 발생했습니다.',
      details: {
        currentRevisionId: 'revision-2',
      },
    });
  });
});
