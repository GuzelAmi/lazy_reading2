import React from 'react';
import { BookOpen, Sparkles, Shield } from 'lucide-react';
import { SEO } from './SEO';

export const PublicHome: React.FC = () => {
  return (
    <>
      <SEO
        title="Lazy Reading – читайте книги с комфортом"
        description="Приложение для чтения книг с возможностью получать определения незнакомых слов через нейросеть. Удобный плеер, сохранение прогресса, загрузка своих книг."
        canonical="/"
        noindex={false}
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-blue-900 mb-4">Lazy Reading</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Читайте книги в удобном формате, мгновенно получайте определения незнакомых слов с помощью нейросети.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ваши книги</h2>
              <p className="text-gray-600">Загружайте любые текстовые файлы (TXT) и читайте их в удобном плеере.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Определения слов</h2>
              <p className="text-gray-600">Кликните на любое слово – получите его точное определение от искусственного интеллекта.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Прогресс чтения</h2>
              <p className="text-gray-600">Приложение запоминает, где вы остановились, и показывает выделения.</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-500 mb-4">Начните читать уже сегодня</p>
            <div className="flex justify-center gap-4">
              <a href="/auth" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                Войти
              </a>
              <a href="/auth" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
                Зарегистрироваться
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};