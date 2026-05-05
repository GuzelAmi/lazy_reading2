import { render, screen, waitFor } from '@testing-library/react';
import { BookList } from './BookList';
import { booksService } from '../../services/books';
import { TestWrapper } from '../../test/wrapper';
import { vi } from 'vitest';

vi.mock('../../services/books', () => ({
  booksService: {
    getBooks: vi.fn(),
    deleteBook: vi.fn(),
    downloadBook: vi.fn(),
    updateBook: vi.fn(),
  },
}));

const mockBooks = {
  items: [
    { id: 1, title: 'Война и мир', author: 'Толстой', created_at: '2024-01-01' },
    { id: 2, title: 'Преступление и наказание', author: 'Достоевский', created_at: '2024-01-02' },
  ],
  total: 2,
  pages: 1,
};

describe('BookList', () => {
  beforeEach(() => {
    vi.mocked(booksService.getBooks).mockResolvedValue(mockBooks);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderBookList = () => {
    render(
      <TestWrapper>
        <BookList />
      </TestWrapper>
    );
  };

  it('загружает и отображает список книг', async () => {
    renderBookList();
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Война и мир')).toBeInTheDocument();
      expect(screen.getByText('Преступление и наказание')).toBeInTheDocument();
      expect(screen.getByText('Толстой')).toBeInTheDocument();
      expect(screen.getByText('Достоевский')).toBeInTheDocument();
    });
  });

  it('отображает сообщение "Нет книг", если список пуст', async () => {
    vi.mocked(booksService.getBooks).mockResolvedValue({ items: [], total: 0, pages: 0 });
    renderBookList();

    await waitFor(() => {
      expect(screen.getByText('Нет книг')).toBeInTheDocument();
    });
  });
});