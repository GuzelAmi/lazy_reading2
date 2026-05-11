import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthScreen } from './components/Auth/AuthScreen';
import { Header } from './components/Layout/Header';
import { LeftSidebar } from './components/Layout/LeftSidebar';
import { RightSidebar } from './components/Layout/RightSidebar';
import { SessionView } from './components/Views/SessionView';
import { BookList } from './components/Books/BookList';
import { PublicHome } from './components/PublicHome';
import AdminPanel from './components/Lab1AdminPanel';
import type { ViewState, Session, DictionaryResponse } from './types';
import { authService } from './services/auth';
import { booksService } from './services/books';
import { sessionsService } from './services/sessions';
import { dictionaryService } from './services/dictionary';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    return <Navigate to="/books" replace />;
  }
  return children;
};

const App = () => {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [view, setView] = useState<ViewState>('HOME');
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [selectedWordDef, setSelectedWordDef] = useState<DictionaryResponse | null>(null);
  const [loadingDef, setLoadingDef] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setLoggedIn(true);
      setUsername(storedUsername);
      loadSessions();
    }
  }, []);

  const loadSessions = async () => {
    try {
      const data = await sessionsService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        await authService.register({ username, password });
      }
      const res = await authService.login({ username, password });
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('refresh_token', res.refresh_token);
      localStorage.setItem('user_id', res.user_id.toString());
      localStorage.setItem('username', username);
      localStorage.setItem('role', res.role);
      setLoggedIn(true);
      await loadSessions();
      // ✅ Добавьте эту строку
      window.location.href = '/books';
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (err) {
        console.error('Logout error', err);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setLoggedIn(false);
    setSessions([]);
    setActiveSession(null);
    setSelectedWordDef(null);
    setShowAdmin(false);
    navigate('/');
  };

  const handleSelectSession = (s: Session) => {
    setActiveSession(s);
    setView('SESSION');
    setIsRightOpen(true);
    setSelectedWordDef(null);
  };

  const handleWordSelect = async (word: string) => {
    setLoadingDef(true);
    try {
      const def = await dictionaryService.getDefinition(word);
      setSelectedWordDef(def);
      if (!isRightOpen) setIsRightOpen(true);
    } catch (err) {
      console.error('Error getting definition:', err);
      setSelectedWordDef({
        word,
        definition: 'Не удалось получить определение',
        example: '',
      });
    } finally {
      setLoadingDef(false);
    }
  };

  const updateSessionProgress = useCallback((sessionId: number, position: number, total: number) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, current_position: position, total_sentences: total }
          : session
      )
    );
    setActiveSession((prev) =>
      prev?.id === sessionId ? { ...prev, current_position: position, total_sentences: total } : prev
    );
  }, []);

  const handleDeleteSession = async (sessionId: number) => {
    try {
      await sessionsService.deleteSession(sessionId);
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка удаления сессии');
    }
  };

  const onUploadClick = () => {
    setShowUploadModal(true);
    setUploadTitle('');
    setUploadAuthor('');
    setSelectedFile(null);
  };

  const handleFileSelectForUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !file.name.endsWith('.txt')) {
      alert('Пожалуйста, выберите файл в формате TXT');
      return;
    }
    setSelectedFile(file || null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Выберите файл');
      return;
    }
    if (!uploadTitle.trim()) {
      alert('Введите название книги');
      return;
    }
    setUploading(true);
    try {
      const book = await booksService.uploadBook(
        selectedFile,
        uploadTitle.trim(),
        uploadAuthor.trim() || undefined
      );
      const newSession = await sessionsService.createSession(book.id, `Чтение: ${uploadTitle}`);
      await loadSessions();
      setActiveSession(newSession);
      setView('SESSION');
      setIsRightOpen(true);
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadTitle('');
      setUploadAuthor('');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка загрузки книги');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route
        path="/auth"
        element={
          <AuthScreen
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            isRegistering={isRegistering}
            setIsRegistering={setIsRegistering}
            onSubmit={handleLogin}
          />
        }
      />

      <Route
        path="/books"
        element={
          <RequireAuth>
            <div className="h-screen flex flex-col bg-gray-50">
              <Header
                username={username}
                isSidebarOpen={isLeftOpen}
                toggleSidebar={() => setIsLeftOpen(!isLeftOpen)}
                onLogout={handleLogout}
                onHomeClick={() => {
                  setView('HOME');
                  setActiveSession(null);
                  setIsRightOpen(false);
                  setSelectedWordDef(null);
                }}
                onAdminOpen={() => setShowAdmin(true)}
              />
              <div className="flex flex-1 overflow-hidden">
                <LeftSidebar
                  isOpen={isLeftOpen}
                  sessions={sessions}
                  activeSessionId={activeSession?.id ?? null}
                  onSelectSession={handleSelectSession}
                  onUploadClick={onUploadClick}
                  onDeleteSession={handleDeleteSession}
                />
                <main className="flex-1 relative bg-white overflow-hidden">
                  {view === 'HOME' && <BookList />}
                  {view === 'SESSION' && activeSession && (
                    <SessionView
                      key={activeSession.id}
                      session={activeSession}
                      onWordSelect={handleWordSelect}
                      selectedWordDef={selectedWordDef}
                      onProgressUpdate={updateSessionProgress}
                    />
                  )}
                </main>
                <RightSidebar isOpen={isRightOpen} wordDef={selectedWordDef} loading={loadingDef} />
              </div>

              {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-96">
                    <h2 className="text-xl font-bold mb-4">Загрузка новой книги</h2>
                    <form onSubmit={handleUploadSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Название книги *</label>
                        <input
                          type="text"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          className="w-full p-2 border rounded"
                          required
                          data-testid="upload-title"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Автор (необязательно)</label>
                        <input
                          type="text"
                          value={uploadAuthor}
                          onChange={(e) => setUploadAuthor(e.target.value)}
                          className="w-full p-2 border rounded"
                          data-testid="upload-author"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Файл (TXT) *</label>
                        <input
                          type="file"
                          accept=".txt"
                          onChange={handleFileSelectForUpload}
                          className="w-full"
                          required
                        />
                      </div>
                      {selectedFile && (
                        <div className="text-sm text-gray-600 mb-4">
                          Выбран файл: {selectedFile.name}
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUploadModal(false);
                            setSelectedFile(null);
                            setUploadTitle('');
                            setUploadAuthor('');
                          }}
                          className="px-4 py-2 border rounded"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          disabled={uploading || !uploadTitle.trim() || !selectedFile}
                          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                          data-testid="upload-submit"
                        >
                          {uploading ? 'Загрузка...' : 'Загрузить'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <div className="h-screen flex flex-col bg-gray-50">
              <Header
                username={username}
                isSidebarOpen={isLeftOpen}
                toggleSidebar={() => setIsLeftOpen(!isLeftOpen)}
                onLogout={handleLogout}
                onHomeClick={() => setShowAdmin(false)}
                showAdmin={true}
                onAdminClose={() => setShowAdmin(false)}
              />
              <AdminPanel onClose={() => setShowAdmin(false)} />
            </div>
          </RequireAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;