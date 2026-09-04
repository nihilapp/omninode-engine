import type {
  FetchOptions,
  ResponseType,
} from 'ofetch';

import type {
  ComputedRef,
  Ref,
} from 'vue';

export type ApiMethod =
  | 'DELETE'
  | 'GET'
  | 'PATCH'
  | 'POST'
  | 'PUT';

export type ApiParams = object;

export type ApiFetchOptions = Omit<
  FetchOptions<ResponseType>,
  'body' | 'headers' | 'method' | 'query' | 'retry'
>;

export interface ApiRequestOptions<
  TBody = unknown,
  TParams extends ApiParams = ApiParams,
> {
  params?: TParams;
  body?: TBody;
  headers?: HeadersInit;
  options?: ApiFetchOptions;
}

export interface ApiRequestInput<
  TBody = unknown,
  TParams extends ApiParams = ApiParams,
> extends ApiRequestOptions<TBody, TParams> {
  method: ApiMethod;
  url: string;
}

export type ApiGetOptions<
  TParams extends ApiParams = ApiParams,
> = Omit<ApiRequestOptions<never, TParams>, 'body'>;

export interface ApiResponse<
  TData,
  TDetails = unknown,
> {
  data: TData | null;
  error: boolean;
  code: string;
  message: string;
  details: TDetails | null;
}

export type ApiErrorKind =
  | 'api'
  | 'cancelled'
  | 'invalid-response'
  | 'network';

export interface ApiError<
  TDetails = unknown,
> extends Error {
  kind: ApiErrorKind;
  code: string;
  details: TDetails | null;
  cause?: unknown;
}

export type ApiRequestStatus =
  | 'error'
  | 'idle'
  | 'pending'
  | 'success';

export interface ApiRequestResult<
  TData,
  TInput,
> {
  data: Ref<TData | null | undefined>;
  error: Ref<ApiError | null>;
  pending: ComputedRef<boolean>;
  status: Ref<ApiRequestStatus>;
  execute: (input?: TInput) => Promise<TData | null>;
  reset: () => void;
}

export interface TListData<TData> {
  list: TData[];
  page: number;
  pageSize: number;
  totalElements: number;
  numberOfElements: number;
  startIndex: number;
  endIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  isFirst: boolean;
  isLast: boolean;
  empty: boolean;
  totalPages: number;
}
