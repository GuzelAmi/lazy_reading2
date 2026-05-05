import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';
import { TestWrapper } from '../../test/wrapper';

describe('Pagination', () => {
  const renderPagination = (page: number, pages: number, onPageChange: () => void) => {
    render(
      <TestWrapper>
        <Pagination page={page} pages={pages} onPageChange={onPageChange} />
      </TestWrapper>
    );
  };

  it('не отображается, если всего одна страница', () => {
    renderPagination(1, 1, vi.fn());
    expect(screen.queryByText('Назад')).not.toBeInTheDocument();
  });

  it('отображает кнопки для нескольких страниц', () => {
    renderPagination(2, 5, vi.fn());
    expect(screen.getByText('Назад')).toBeInTheDocument();
    expect(screen.getByText('Вперёд')).toBeInTheDocument();
    expect(screen.getByText('Страница 2 из 5')).toBeInTheDocument();
  });

  it('кнопка "Назад" disabled на первой странице', () => {
    renderPagination(1, 5, vi.fn());
    expect(screen.getByText('Назад')).toBeDisabled();
  });

  it('кнопка "Вперёд" disabled на последней странице', () => {
    renderPagination(5, 5, vi.fn());
    expect(screen.getByText('Вперёд')).toBeDisabled();
  });

  it('вызывает onPageChange с правильным номером', async () => {
    const onPageChange = vi.fn();
    renderPagination(3, 5, onPageChange);
    await userEvent.click(screen.getByText('Назад'));
    await userEvent.click(screen.getByText('Вперёд'));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});