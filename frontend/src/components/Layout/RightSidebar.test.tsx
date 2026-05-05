import { render, screen } from '@testing-library/react';
import { RightSidebar } from './RightSidebar';
import { TestWrapper } from '../../test/wrapper';

describe('RightSidebar', () => {
  const renderRightSidebar = (isOpen: boolean, wordDef: any, loading: boolean) => {
    render(
      <TestWrapper>
        <RightSidebar isOpen={isOpen} wordDef={wordDef} loading={loading} />
      </TestWrapper>
    );
  };

  it('отображает заглушку, когда нет выбранного слова', () => {
    renderRightSidebar(true, null, false);
    expect(screen.getByText('Кликните на слово, чтобы увидеть определение')).toBeInTheDocument();
  });

  it('отображает определение, когда слово выбрано', () => {
    const wordDef = {
      word: 'тестирование',
      definition: 'Процесс проверки качества ПО',
      example: 'Сегодня мы пишем тесты',
    };
    renderRightSidebar(true, wordDef, false);
    expect(screen.getByText('тестирование')).toBeInTheDocument();
    expect(screen.getByText('Процесс проверки качества ПО')).toBeInTheDocument();
    expect(screen.getByText('"Сегодня мы пишем тесты"')).toBeInTheDocument();
  });

  it('показывает индикатор загрузки', () => {
    renderRightSidebar(true, null, true);
    expect(screen.getByText('Загрузка определения...')).toBeInTheDocument();
  });
});