import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthScreen } from './AuthScreen';
import { TestWrapper } from '../../test/wrapper';

describe('AuthScreen', () => {
  it('вызывает onSubmit с данными при отправке формы', async () => {
    const onSubmit = vi.fn();
    const setUsername = vi.fn();
    const setPassword = vi.fn();

    render(
      <TestWrapper>
        <AuthScreen
          username="testuser"
          setUsername={setUsername}
          password="testpass"
          setPassword={setPassword}
          isRegistering={false}
          setIsRegistering={vi.fn()}
          onSubmit={onSubmit}
        />
      </TestWrapper>
    );

    // В этом случае поля уже заполнены через props
    const submitButton = screen.getByText('Войти');
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalled();
  });
});