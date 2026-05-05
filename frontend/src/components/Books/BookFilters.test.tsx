import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookFilters } from './BookFilters';
import { TestWrapper } from '../../test/wrapper';

describe('BookFilters', () => {
  const defaultProps = {
    initialSearch: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    onSearchSubmit: vi.fn(),
    onSortByChange: vi.fn(),
    onSortOrderChange: vi.fn(),
  };

  const renderFilters = () => {
    render(
      <TestWrapper>
        <BookFilters {...defaultProps} />
      </TestWrapper>
    );
  };

  it('отображает поле поиска и селекты сортировки', () => {
    renderFilters();
    expect(screen.getByPlaceholderText(/поиск/i)).toBeInTheDocument();
    expect(screen.getByText('Дате добавления')).toBeInTheDocument();
    expect(screen.getByText('По убыванию')).toBeInTheDocument();
  });

  it('отправляет поиск только по нажатию Enter', async () => {
    renderFilters();
    const input = screen.getByPlaceholderText(/поиск/i);
    await userEvent.type(input, 'война');
    expect(defaultProps.onSearchSubmit).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(defaultProps.onSearchSubmit).toHaveBeenCalledWith('война');
  });

  it('вызывает onSortByChange при изменении сортировки', async () => {
    renderFilters();
    const select = screen.getAllByRole('combobox')[0];
    await userEvent.selectOptions(select, 'title');
    expect(defaultProps.onSortByChange).toHaveBeenCalledWith('title');
  });

  it('вызывает onSortOrderChange при изменении порядка', async () => {
    renderFilters();
    const select = screen.getAllByRole('combobox')[1];
    await userEvent.selectOptions(select, 'asc');
    expect(defaultProps.onSortOrderChange).toHaveBeenCalledWith('asc');
  });
});