import type {
  TListData,
} from '~/types/api.types';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export function pageData<TData>(
  data: TData[],
  page?: number,
  pageSize?: number,
): TListData<TData> {
  const totalElements = data.length;
  const requestedPage = Number.isInteger(page) && page > 0
    ? page
    : 1;
  const requestedPageSize = Number.isInteger(pageSize) && Number(pageSize) > 0
    ? Math.min(Number(pageSize), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
  const totalPages = Math.ceil(totalElements / requestedPageSize);
  const currentPage = totalPages === 0
    ? 1
    : Math.min(requestedPage, totalPages);
  const startOffset = (currentPage - 1) * requestedPageSize;
  const list = data.slice(
    startOffset,
    startOffset + requestedPageSize,
  );
  const numberOfElements = list.length;

  return {
    list,
    page: currentPage,
    pageSize: requestedPageSize,
    totalElements,
    numberOfElements,
    startIndex: numberOfElements === 0 ? 0 : startOffset + 1,
    endIndex: startOffset + numberOfElements,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    isFirst: currentPage === 1,
    isLast: totalPages === 0 || currentPage === totalPages,
    empty: numberOfElements === 0,
    totalPages,
  };
}
