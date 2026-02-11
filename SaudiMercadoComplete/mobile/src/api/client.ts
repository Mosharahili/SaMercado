import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const base =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://samercado.onrender.com/api';

const baseURL = base.replace(/\/+$/, '').endsWith('/api') ? base.replace(/\/+$/, '') : `${base.replace(/\/+$/, '')}/api`;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
};

export type UploadFile = {
  uri: string;
  name: string;
  type?: string;
};

export type ApiError = Error & {
  status?: number;
  response?: {
    status: number;
    data: any;
  };
};

const request = async <T = any>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = await SecureStore.getItemAsync('auth_token');
  const timeoutMs = options.timeoutMs ?? 30000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseURL}${path.startsWith('/') ? path : `/${path}`}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const error = new Error(data?.error || data?.message || 'Request failed') as ApiError;
      error.status = response.status;
      error.response = { status: response.status, data };
      throw error;
    }

    return data as T;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(`Request timed out after ${timeoutMs}ms`) as ApiError;
      timeoutError.status = 408;
      timeoutError.response = {
        status: 408,
        data: { error: 'Request timeout' },
      };
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const apiOrigin = baseURL.replace(/\/api$/, '');

const resolveAssetUrl = (value?: string | null) => {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('file:')) {
    return value;
  }

  return `${apiOrigin}${value.startsWith('/') ? value : `/${value}`}`;
};

const upload = async <T = any>(
  path: string,
  file: UploadFile,
  fieldName = 'image',
  extraFields?: Record<string, string>
): Promise<T> => {
  const token = await SecureStore.getItemAsync('auth_token');
  const formData = new FormData();

  formData.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: file.type || 'application/octet-stream',
  } as any);

  if (extraFields) {
    Object.entries(extraFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await fetch(`${baseURL}${path.startsWith('/') ? path : `/${path}`}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || 'Upload failed') as ApiError;
    error.status = response.status;
    error.response = { status: response.status, data };
    throw error;
  }

  return data as T;
};

export const api = {
  get: <T = any>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = any>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T = any>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T = any>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload,
  resolveAssetUrl,
  baseURL,
};
