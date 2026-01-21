import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  defaultPageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  paginatedItems: T[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Client-side pagination hook for lists.
 * For server-side pagination, use range() directly in queries.
 */
export function usePagination<T>(
  items: T[] | undefined,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { defaultPageSize = 25, initialPage = 0 } = options;
  
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  
  const totalItems = items?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Clamp page to valid range when items change
  const validPage = Math.min(page, Math.max(0, totalPages - 1));
  if (validPage !== page) {
    setPage(validPage);
  }
  
  const startIndex = validPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  const paginatedItems = useMemo(() => {
    if (!items) return [];
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);
  
  const hasNextPage = validPage < totalPages - 1;
  const hasPrevPage = validPage > 0;
  
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(p => p + 1);
    }
  }, [hasNextPage]);
  
  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage(p => p - 1);
    }
  }, [hasPrevPage]);
  
  const goToFirstPage = useCallback(() => setPage(0), []);
  const goToLastPage = useCallback(() => setPage(totalPages - 1), [totalPages]);
  
  return {
    page: validPage,
    pageSize,
    totalPages,
    paginatedItems,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
  };
}
