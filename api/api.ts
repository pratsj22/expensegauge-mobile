// api.ts
import { useAuthStore } from '@/store/authStore';
import { useExpenseStore } from '@/store/expenseStore';
import axios from 'axios';
import { router } from 'expo-router';
import { checkConnection } from './network';
import { addToQueue } from '@/store/offlineQueue';
// import { API_URL } from '@env'; // loaded from .env file
const API_URL = "http://192.168.29.6:8000/api/v1"


const api = axios.create({
  baseURL: API_URL,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { refreshToken, setTokens, reset } = useAuthStore.getState()
    console.log(error);

    const originalRequest = error.config;
    const errorCode = error.response?.data?.code;
    if (errorCode) {
      return Promise.reject(error);
    }
    const isConnected = await checkConnection();

    // If offline, queue the request
    if (!isConnected) {
      console.log('Offline detected, queueing request...');
      const metadata = originalRequest.headers['x-meta']
        ? JSON.parse(originalRequest.headers['x-meta'])
        : {};

      await addToQueue({
        method: originalRequest.method?.toUpperCase() as any,
        url: originalRequest.url!,
        data: originalRequest.data ? JSON.parse(originalRequest.data) : undefined,
        ...metadata,
      });
      return Promise.resolve({ data: { offline: true } }); // Fake response
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_URL}/user/refresh`, {
          refreshToken,
        });
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;
        setTokens(newAccessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed — logout user
        console.error('Refresh token invalid, logging out');
        const { setCachedExpenses } = useExpenseStore.getState()
        reset()
        setCachedExpenses([], 0)
        // redirect to login screen here
        router.replace('/')
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
)

export default api;
