import { useAuthStore } from '../store/auth';
import router from '../router';

export async function apiFetch(endpoint, options = {}) {
  const authStore = useAuthStore();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`;
  }

  try {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      authStore.logout();
      if (router.currentRoute.value.name !== 'Login') {
        router.push({ name: 'Login' });
      }
      return { success: false, error: 'Session expired or not authorized' };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }

    const text = await response.text();
    if (!response.ok) {
      return { success: false, error: text || `HTTP Error ${response.status}` };
    }

    return { success: true, data: text };
  } catch (err) {
    console.error('API request error:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}
