// frontend/src/components/Lab1AdminPanel.tsx
// ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1////////////////////////////////////
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { User } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId: number, newRole: 'user' | 'admin') => {
    try {
      await api.put(`/admin/users/${userId}/role`, null, { params: { role: newRole } });
      await fetchUsers(); // обновить список
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка изменения роли');
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Удалить пользователя ${username}? Все его книги и сессии будут удалены.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  if (loading) return <div className="p-4 text-center">Загрузка...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Управление пользователями</h1>

        <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Имя пользователя</th>
              <th className="p-3 text-left">Роль</th>
              <th className="p-3 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.id}</td>
                <td className="p-3">{user.username}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <select
                    value={user.role} // текущая роль выбрана по умолчанию
                    onChange={(e) => changeRole(user.id, e.target.value as 'user' | 'admin')}
                    className="border rounded p-1 text-sm"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="text-red-600 hover:text-red-800 text-sm ml-2"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          Вернуться к чтению
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
// ////////////////////////////////////ЛАБОРАТОРНАЯ НОМЕР 1////////////////////////////////////