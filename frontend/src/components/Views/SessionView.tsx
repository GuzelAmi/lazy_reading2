import React from 'react';
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import type { Session, DictionaryResponse } from '../../types';
import { useBookReading } from '../hooks/useBookReading';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { SEO } from '../SEO';

interface SessionViewProps {
  session: Session;
  onWordSelect: (word: string) => void;
  selectedWordDef: DictionaryResponse | null;
  onProgressUpdate?: (sessionId: number, position: number, total: number) => void;
}

export const SessionView: React.FC<SessionViewProps> = ({
  session,
  onWordSelect,
  selectedWordDef,
  onProgressUpdate,
}) => {
  const {
    sentences,
    currentIndex,
    visitedSet,
    loading,
    setCurrentIndex,
    textContainerRef,
    currentSentenceRef,
  } = useBookReading(session);

  useKeyboardNavigation({
    active: !loading,
    sentencesLength: sentences.length,
    currentIndex,
    setCurrentIndex,
  });

  React.useEffect(() => {
    if (!loading && sentences.length > 0 && onProgressUpdate) {
      onProgressUpdate(session.id, currentIndex + 1, sentences.length);
    }
  }, [currentIndex, sentences.length, loading, session.id, onProgressUpdate]);

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) setCurrentIndex(currentIndex + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
  const handleWordClick = (word: string) => {
    if (word.length > 1 && onWordSelect) onWordSelect(word);
  };

  const renderSentenceWithWords = (sentence: string, idx: number) => {
    const words = sentence.split(/(\s+|[.,!?;:()])/);
    return words.map((part, i) => {
      const isWord = /^[a-zA-Zа-яА-ЯёЁ]+$/.test(part);
      if (isWord && part.length > 1) {
        return (
          <span
            key={i}
            onClick={() => handleWordClick(part.toLowerCase())}
            className="cursor-pointer hover:bg-blue-100 rounded px-0.5 transition-colors"
            title="Кликните для определения"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-500">Загрузка книги...</p>
        </div>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Не удалось загрузить текст книги</p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / sentences.length) * 100;

  return (
    <>
      <SEO
        title={`Чтение: ${session.book_title}`}
        description={`Читаем книгу "${session.book_title}" с определением незнакомых слов.`}
        noindex={true}
      />
      <main role="main" className="flex flex-col h-full">
        <div className="flex flex-col h-full">
          <div className="h-16 bg-white border-b flex items-center justify-between px-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">{session.book_title}</h2>
              <p className="text-xs text-gray-500">
                Предложение {currentIndex + 1} из {sentences.length}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50">
                <ArrowLeft size={20} />
              </button>
              <button onClick={handleNext} disabled={currentIndex === sentences.length - 1} className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div ref={textContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-2">
              {sentences.map((sentence, idx) => (
                <div
                  key={idx}
                  ref={idx === currentIndex ? currentSentenceRef : null}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    idx === currentIndex
                      ? 'bg-yellow-100 border-l-4 border-yellow-500 shadow-sm'
                      : visitedSet.has(idx)
                      ? 'bg-white text-gray-600 hover:shadow-sm'
                      : 'bg-white text-gray-800 hover:shadow-sm'
                  }`}
                >
                  {renderSentenceWithWords(sentence, idx)}
                </div>
              ))}
            </div>
          </div>
          <div className="h-1 bg-gray-200">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </main>
    </>
  );
};