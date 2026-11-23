import axios from 'axios';

let accessToken = null;
let refreshRequest = null;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function setAccessToken(token) {
  accessToken = token;
}

function restoreAccessToken() {
  if (!refreshRequest) {
    refreshRequest = api
      .get('/api/v1/auth/session')
      .then(({ data }) => {
        const token = data.authenticated ? data.accessToken : null;
        setAccessToken(token);
        if (token) window.dispatchEvent(new CustomEvent('auth:token', { detail: token }));
        return token;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

api.interceptors.request.use((request) => {
  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`;
  }
  return request;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isAuthRequest = /\/auth\/(login|refresh|session|logout)$/.test(request?.url || '');
    if (error.response?.status !== 401 || !request || request._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const token = await restoreAccessToken();
      if (!token) throw new Error('Session expired');
      request.headers.Authorization = `Bearer ${token}`;
      return api(request);
    } catch (refreshError) {
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return Promise.reject(refreshError);
    }
  }
);

export async function restoreSession() {
  try {
    return await restoreAccessToken();
  } catch (error) {
    if (!error.response || error.response.status >= 500) {
      throw new Error('The API is unavailable. Start the backend and check the MongoDB settings.');
    }
    throw error;
  }
}
