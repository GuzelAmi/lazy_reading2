import React from 'react';
import { BookOpen } from 'lucide-react';
import { SEO } from '../SEO';

interface AuthScreenProps {
  username: string;
  setUsername: (u: string) => void;
  password: string;
  setPassword: (p: string) => void;
  isRegistering: boolean;
  setIsRegistering: (r: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  isRegistering,
  setIsRegistering,
  onSubmit,
}) => {
  return (
    <>
      <SEO
        title="Вход / Регистрация"
        description="Войдите в свой аккаунт Lazy Reading"
        noindex={true}
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <div className="text-center mb-6">
            <BookOpen className="mx-auto text-blue-800" size={48} />
            <h1 className="text-2xl font-bold text-blue-800">Lazy Reading</h1>
            <p className="text-gray-500">Читайте с удовольствием</p>
          </div>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            />
            <button type="submit" className="w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-700">
              {isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            {isRegistering ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 underline">
              {isRegistering ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
};