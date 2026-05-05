import React from 'react';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Назад
      </button>
      <span className="px-3 py-1">
        Страница {page} из {pages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Вперёд
      </button>
    </div>
  );
};