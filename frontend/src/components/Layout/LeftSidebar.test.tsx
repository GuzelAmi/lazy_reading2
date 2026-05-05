import { render, screen } from '@testing-library/react';
import { LeftSidebar } from './LeftSidebar';
import { TestWrapper } from '../../test/wrapper';

const mockSessions = [
  {
    id: 1,
    name: 'Сессия 1',
    book_id: 1,
    user_id: 1,
    current_position: 5,
    total_sentences: 10,
    book_title: 'Война и мир',
    book_author: 'Толстой',
    book_cover_url: 'https://example.com/cover1.jpg',
  },
  {
    id: 2,
    name: 'Сессия 2',
    book_id: 2,
    user_id: 1,
    current_position: 2,
    total_sentences: 20,
    book_title: 'Идиот',
    book_author: 'Достоевский',
    book_cover_url: null,
  },
];

describe('LeftSidebar', () => {
  const defaultProps = {
    isOpen: true,
    sessions: mockSessions,
    activeSessionId: 1,
    onSelectSession: vi.fn(),
    onUploadClick: vi.fn(),
    onDeleteSession: vi.fn(),
  };

  const renderSidebar = () => {
    render(
      <TestWrapper>
        <LeftSidebar {...defaultProps} />
      </TestWrapper>
    );
  };

  it('отображает список сессий', () => {
    renderSidebar();
    expect(screen.getByText('Война и мир')).toBeInTheDocument();
    expect(screen.getByText('Идиот')).toBeInTheDocument();
  });

  it('отображает обложку, если она есть', () => {
    renderSidebar();
    const cover = screen.getByAltText('Война и мир');
    expect(cover).toBeInTheDocument();
    expect(cover).toHaveAttribute('src', 'https://example.com/cover1.jpg');
  });

  it('отображает заглушку, если обложки нет', () => {
    renderSidebar();
    const placeholder = screen.getAllByText('📖')[0];
    expect(placeholder).toBeInTheDocument();
  });

  it('показывает прогресс для каждой сессии', () => {
    renderSidebar();
    expect(screen.getByText('5 / 10 предложений')).toBeInTheDocument();
    expect(screen.getByText('2 / 20 предложений')).toBeInTheDocument();
  });
});