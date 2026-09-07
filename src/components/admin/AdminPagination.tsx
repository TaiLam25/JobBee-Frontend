import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationMeta } from '../../types';

interface AdminPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}) => {
  const { total, page, limit, totalPages } = pagination;

  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#0a0f1d] border-t border-slate-800/80 text-xs text-slate-400 ${className}`}>
      {/* Left: Summary and Page Size */}
      <div className="flex items-center gap-3 flex-wrap">
        <span>
          Hiển thị <strong className="text-slate-200">{startItem}</strong> - <strong className="text-slate-200">{endItem}</strong> trong tổng số <strong className="text-indigo-400 font-bold">{total.toLocaleString('vi-VN')}</strong> bản ghi
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
            <span className="text-slate-500">Mỗi trang:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-xs focus:outline-hidden focus:border-indigo-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          title="Trang đầu"
          className="p-1.5 rounded-md border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title="Trang trước"
          className="p-1.5 rounded-md border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1.5 py-0.5 text-slate-600 select-none">
                  ...
                </span>
              );
            }

            const isCurrent = p === page;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`min-w-[28px] h-7 px-2 rounded-md font-mono text-xs font-semibold flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/30 border border-indigo-500'
                    : 'border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Trang sau"
          className="p-1.5 rounded-md border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Trang cuối"
          className="p-1.5 rounded-md border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
