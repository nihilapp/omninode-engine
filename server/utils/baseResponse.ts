import type {
  ApiResponse,
  TListData,
} from '~/types/api.types';

/**
 * 기본 응답 객체
 */
export class BaseResponse {

  /**
   * @desc
   * @param data
   * @param code
   * @param message
   */
  public static data<
    TData,
    TDetails = unknown,
  >(
    data: TData,
    code: string,
    message: string,
    details: TDetails | null = null,
  ): ApiResponse<TData, TDetails> {
    return {
      code,
      data,
      details,
      error: false,
      message,
    };
  }

  /**
   *
   * @param data
   * @param code
   * @param message
   */
  public static list<
    TData,
    TDetails = unknown,
  >(
    data: TListData<TData>,
    code: string,
    message: string,
    details: TDetails | null = null,
  ): ApiResponse<TListData<TData>, TDetails> {
    return {
      code,
      data,
      details,
      error: false,
      message,
    };
  }

  /**
   *
   * @param code
   * @param message
   */
  public static error<TDetails = unknown>(
    code: string,
    message: string,
    details: TDetails | null = null,
  ): ApiResponse<null, TDetails> {
    return {
      code,
      data: null,
      details,
      error: true,
      message,
    };
  }
}
