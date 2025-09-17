import { useState, useMemo, useCallback } from 'react';

type SortDirection = 'ascending' | 'descending';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

interface UseTableManagerOptions<T> {
  initialItems?: T[];
  itemsPerPage?: number;
  initialSortKey?: keyof T;
  searchableKeys: (keyof T)[];
}

export const useTableManager = <T extends { [key: string]: any }>({
  initialItems = [],
  itemsPerPage = 10,
  initialSortKey,
  searchableKeys,
}: UseTableManagerOptions<T>) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    initialSortKey ? { key: initialSortKey, direction: 'descending' } : null
  );

  const filteredItems = useMemo(() => {
    if (!filter) {
      return items;
    }
    return items.filter((item) => {
      return searchableKeys.some((key) => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(filter.toLowerCase());
      });
    });
  }, [items, filter, searchableKeys]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);
  
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
     if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
     }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage, totalPages]);

  const requestSort = (key: keyof T) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
      setCurrentPage(1);
  };
  
  return {
    paginatedItems,
    requestSort,
    sortConfig,
    handleFilterChange,
    filter,
    currentPage,
    setCurrentPage,
    totalPages,
    setItems,
    totalItems: sortedItems.length,
    itemsPerPage,
  };
};