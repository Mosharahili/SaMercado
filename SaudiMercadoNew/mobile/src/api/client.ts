import axios from 'axios';
import Constants from 'expo-constants';

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiBaseUrl || 'https://samercado.onrender.com',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = await SecureStore.getItemAsync('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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