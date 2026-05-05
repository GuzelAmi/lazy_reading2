import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { booksService } from '../../services/books';
import { BookFilters } from './BookFilters';
import { Pagination } from './Pagination';
import { SEO } from '../SEO';
import { Helmet } from 'react-helmet-async';

interface Book {
  id: number;
  title: string;
  author: string | null;
  created_at: string;
}

export const BookList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';
  const page = Number(searchParams.get('page')) || 1;
  const size = 10;

  // Обновление URL при изменении сортировки или пагинации
  const updateFilters = (newSearch: string, newSortBy: string, newSortOrder: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newSortBy) params.set('sort_by', newSortBy);
    if (newSortOrder) params.set('sort_order', newSortOrder);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Отдельная функция для отправки поиска по Enter
  const handleSearchSubmit = (searchValue: string) => {
    const params = new URLSearchParams();
    if (searchValue) params.set('search', searchValue);
    if (sortBy) params.set('sort_by', sortBy);
    if (sortOrder) params.set('sort_order', sortOrder);
    params.set('page', '1');
    setSearchParams(params);
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        size,
      };
      const data = await booksService.getBooks(params);
      setBooks(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleDownload = async (id: number) => {
    try {
      const { url } = await booksService.downloadBook(id);
      window.open(url, '_blank');
    } catch (err) {
      alert('Не удалось скачать книгу');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Удалить книгу?')) {
      await booksService.deleteBook(id);
      await loadBooks();
    }
  };

  const handleEdit = async (book: Book) => {
    const newTitle = prompt('Введите новое название', book.title);
    if (newTitle && newTitle !== book.title) {
      await booksService.updateBook(book.id, { title: newTitle, author: book.author || undefined });
      await loadBooks();
    }
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <>
      <SEO
        title="Все книги"
        description="Список всех ваших книг. Читайте, выделяйте, узнавайте значения слов."
        canonical="/books"
        noindex={false}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Список книг",
            "description": "Все ваши книги для чтения с определением слов",
            "url": "https://lazyreading.ru/books",
            "numberOfItems": total,
          })}
        </script>
      </Helmet>
      <div className="p-4">
        <BookFilters
          initialSearch={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchSubmit={handleSearchSubmit}
          onSortByChange={(val) => updateFilters(search, val, sortOrder)}
          onSortOrderChange={(val) => updateFilters(search, sortBy, val)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Название</th>
                <th className="p-2 text-left">Автор</th>
                <th className="p-2 text-left">Дата добавления</th>
                <th className="p-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-t">
                  <td className="p-2">{book.title}</td>
                  <td className="p-2">{book.author || '—'}</td>
                  <td className="p-2">{new Date(book.created_at).toLocaleDateString()}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleEdit(book)} className="text-blue-600 hover:underline">✏️</button>
                    <button onClick={() => handleDownload(book.id)} className="text-green-600 hover:underline">⬇️</button>
                    <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:underline">🗑️</button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Нет книг</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
      </div>
    </>
  );
};