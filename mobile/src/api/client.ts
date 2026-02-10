import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000/api',
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors
    return Promise.reject(error);
  }
);

export default api;