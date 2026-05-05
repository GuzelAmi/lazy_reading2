import React from 'react';
import { BookOpen } from 'lucide-react';
import type { DictionaryResponse } from '../../types';  // ← это должно работать

interface RightSidebarProps {
  isOpen: boolean;
  wordDef: DictionaryResponse | null;
  loading: boolean;
  onClose?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, wordDef, loading }) => {
  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-white border-l flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-bold">Словарь</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto"></div>
            <p className="mt-2 text-gray-500">Загрузка определения...</p>
          </div>
        ) : wordDef ? (
          <div>
            <h3 className="text-xl font-bold mb-2 text-blue-800">{wordDef.word}</h3>
            <p className="mb-3 text-gray-700">{wordDef.definition}</p>
            {wordDef.example && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-1">Пример:</p>
                <p className="text-gray-600 italic">"{wordDef.example}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <BookOpen className="mx-auto mb-2" size={32} />
            <p>Кликните на слово, чтобы увидеть определение</p>
          </div>
        )}
      </div>
    </aside>
  );
};