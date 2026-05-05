// components/Layout/Header.tsx
import React from 'react';
import { Menu, LogOut } from 'lucide-react';

interface HeaderProps {
  username: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onLogout: () => void;
  onHomeClick: () => void;
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  onAdminOpen?: () => void;
  showAdmin?: boolean;
  onAdminClose?: () => void;
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
}

export const Header: React.FC<HeaderProps> = ({ 
  username, 
  isSidebarOpen, 
  toggleSidebar, 
  onLogout, 
  onHomeClick,
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  onAdminOpen,
  showAdmin,
  onAdminClose
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
}) => {
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  const role = localStorage.getItem('role') || 'user';
  // ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        {/* Добавлен data-testid для тестирования */}
        <button 
          data-testid="menu-button"
          onClick={toggleSidebar} 
          className="p-2 hover:bg-gray-100 rounded"
        >
          <Menu size={20} />
        </button>
        <h1 onClick={onHomeClick} className="text-xl font-bold text-blue-800 cursor-pointer">
          Lazy Reading
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-700">{username}</span>
        {/* ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ */}
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          {role}
        </span>
        {role === 'admin' && !showAdmin && onAdminOpen && (
          <button
            onClick={onAdminOpen}
            className="text-sm text-blue-600 hover:underline"
          >
            Админ-панель
          </button>
        )}
        {showAdmin && onAdminClose && (
          <button
            onClick={onAdminClose}
            className="text-sm text-gray-600 hover:underline"
          >
            ← Назад
          </button>
        )}
        {/* ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ */}
        <button onClick={onLogout} className="flex items-center gap-1 text-gray-600 hover:text-red-600">
          <LogOut size={18} /> Выйти
        </button>
      </div>
    </header>
  );
};