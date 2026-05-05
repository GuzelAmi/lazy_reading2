import React from 'react';
import { Upload, Book, Trash2 } from 'lucide-react';
import type { Session } from '../../types';

interface LeftSidebarProps {
  isOpen: boolean;
  sessions: Session[];
  activeSessionId: number | null;
  onSelectSession: (session: Session) => void;
  onUploadClick: () => void;
  onDeleteSession?: (sessionId: number) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onUploadClick,
  onDeleteSession,
}) => {
  const calculateProgress = (session: Session) => {
    if (session.total_sentences > 0) {
      const progress = Math.round((session.current_position / session.total_sentences) * 100);
      return Math.min(progress, 100);
    }
    return 0;
  };

  if (!isOpen) {
    return (
      <div className="w-12 bg-white border-r flex flex-col items-center py-4">
        <button
          onClick={onUploadClick}
          className="p-2 hover:bg-gray-100 rounded-lg mb-4"
          title="Загрузить книгу"
        >
          <Upload size={20} />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 bg-white border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-bold text-gray-800">Мои сессии</h2>
        <p className="text-xs text-gray-500 mt-1">
          {sessions.length} {sessions.length === 1 ? 'сессия' : 'сессий'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sessions.map((session) => {
          const progress = calculateProgress(session);
          const isActive = activeSessionId === session.id;
          return (
            <div key={session.id} className="relative group">
              <div
                onClick={() => onSelectSession(session)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex gap-3">
                  {/* ЛАБ4 */}
                  {session.book_cover_url ? (
                    <img
                      src={session.book_cover_url}
                      alt={session.book_title}
                      className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 flex-shrink-0">
                      📖
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{session.book_title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {session.book_author || 'Автор неизвестен'}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Прогресс</span>
                        <span className="font-medium text-blue-600">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {session.current_position} / {session.total_sentences} предложений
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {onDeleteSession && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Удалить сессию? Эта книга также будет удалена.'))
                      onDeleteSession(session.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
        {sessions.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <Book className="mx-auto mb-2" size={32} />
            <p className="text-sm">Нет созданных сессий</p>
            <p className="text-xs mt-1">Загрузите книгу, чтобы начать</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-500 hover:text-blue-500"
        >
          <Upload size={18} />
          <span className="text-sm">Загрузить книгу</span>
        </button>
      </div>
    </aside>
  );
};