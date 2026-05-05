import React, { useState, useEffect } from 'react';

interface BookFiltersProps {
  initialSearch: string;
  sortBy: string;
  sortOrder: string;
  onSearchSubmit: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
}

export const BookFilters: React.FC<BookFiltersProps> = ({
  initialSearch,
  sortBy,
  sortOrder,
  onSearchSubmit,
  onSortByChange,
  onSortOrderChange,
}) => {
  const [searchInput, setSearchInput] = useState(initialSearch);

  // Синхронизация с URL при изменении параметра search извне (например, при загрузке страницы)
  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchInput);
    }
  };

  return (
    <div className="flex gap-4 mb-4 p-4 bg-gray-100 rounded">
      <input
        type="text"
        placeholder="Поиск по названию или автору (Enter)"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        // ЗАПРОС ОТПРАВЛЯЕМ КОГДА ЭНТЕР
        onKeyDown={handleKeyDown}
        className="flex-1 p-2 border rounded"
      />
      <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} className="p-2 border rounded">
        <option value="created_at">Дате добавления</option>
        <option value="title">Названию</option>
        <option value="author">Автору</option>
      </select>
      <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)} className="p-2 border rounded">
        <option value="desc">По убыванию</option>
        <option value="asc">По возрастанию</option>
      </select>
    </div>
  );
};