// src/services/api.test.ts
import { authService } from './auth';

describe('API error handling', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'old-token');
    localStorage.setItem('refresh_token', 'refresh-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('logoutClient очищает localStorage', () => {
    // Используем реальную функцию (не замоканную)
    authService.logoutClient();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});