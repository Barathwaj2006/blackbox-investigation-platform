import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(username, password) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          return { success: false, error: text || 'Invalid server response' };
        }
        
        if (data.success) {
          this.user = data.user;
          this.token = data.token;
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Authentication failed' };
        }
      } catch (err) {
        return { success: false, error: err.message || 'Network error' };
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
});
