import React from 'react';

interface TableControlsProps {
  filter: string;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const TableControls: React.FC<TableControlsProps> = ({
  filter,
  onFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-3 px-1">
      <div>
        <input
          type="text"
          value={filter}
          onChange={onFilterChange}
          placeholder="Filter results..."
          aria-label="Filter results"
          className="w-full sm:w-64 px-3 py-2 text-sm text-slate-200 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div className="flex items-center space-x-4 mt-3 sm:mt-0">
        <span className="text-sm text-slate-400">
          Showing {startItem}-{endItem} of {totalItems}
        </span>
        <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="px-3 py-1 text-sm font-medium text-slate-300 bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
            >
              Prev
            </button>
            <span className="text-sm text-slate-300" aria-live="polite">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label="Next page"
              className="px-3 py-1 text-sm font-medium text-slate-300 bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
            >
              Next
            </button>
        </div>
      </div>
    </div>
  );
};