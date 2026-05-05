import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { TestWrapper } from '../../test/wrapper';

describe('Header', () => {
  const defaultProps = {
    username: 'testuser',
    isSidebarOpen: true,
    toggleSidebar: vi.fn(),
    onLogout: vi.fn(),
    onHomeClick: vi.fn(),
    onAdminOpen: vi.fn(),
  };

  beforeEach(() => {
    localStorage.setItem('role', 'user');
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderHeader = () => {
    render(
      <TestWrapper>
        <Header {...defaultProps} />
      </TestWrapper>
    );
  };

  it('отображает имя пользователя и роль', () => {
    renderHeader();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('показывает кнопку "Админ-панель" только для админа', () => {
    localStorage.setItem('role', 'admin');
    renderHeader();
    expect(screen.getByText('Админ-панель')).toBeInTheDocument();
  });

  it('не показывает "Админ-панель" для обычного пользователя', () => {
    renderHeader();
    expect(screen.queryByText('Админ-панель')).not.toBeInTheDocument();
  });

  it('вызывает onLogout при клике на "Выйти"', async () => {
    renderHeader();
    await userEvent.click(screen.getByText('Выйти'));
    expect(defaultProps.onLogout).toHaveBeenCalledTimes(1);
  });

  it('вызывает toggleSidebar при клике на иконку меню', async () => {
    renderHeader();
    const menuButton = screen.getByTestId('menu-button');
    await userEvent.click(menuButton);
    expect(defaultProps.toggleSidebar).toHaveBeenCalled();
  });
});