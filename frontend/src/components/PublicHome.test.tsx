import { render, screen } from '@testing-library/react';
import { PublicHome } from './PublicHome';
import { TestWrapper } from '../test/wrapper';

describe('PublicHome', () => {
  const renderComponent = () => {
    render(
      <TestWrapper>
        <PublicHome />
      </TestWrapper>
    );
  };

  it('отображает заголовок и описание', () => {
    renderComponent();
    expect(screen.getByText('Lazy Reading')).toBeInTheDocument();
    expect(screen.getByText(/Читайте книги в удобном формате/i)).toBeInTheDocument();
  });

  it('содержит три карточки с преимуществами', () => {
    renderComponent();
    expect(screen.getByText('Ваши книги')).toBeInTheDocument();
    expect(screen.getByText('Определения слов')).toBeInTheDocument();
    expect(screen.getByText('Прогресс чтения')).toBeInTheDocument();
  });

  it('содержит кнопки "Войти" и "Зарегистрироваться"', () => {
    renderComponent();
    expect(screen.getByRole('link', { name: /Войти/i })).toHaveAttribute('href', '/auth');
    expect(screen.getByRole('link', { name: /Зарегистрироваться/i })).toHaveAttribute('href', '/auth');
  });
});