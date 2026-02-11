import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

type ApiResponse<T = any> = {
  data: T;
  status: number;
};

type ApiRequestConfig = {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

type ApiError = Error & {
  status?: number;
  response?: {
    status: number;
    data: any;
  };
};

const rawBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://samercado.onrender.com/api';

const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseUrl = normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;

const DEFAULT_TIMEOUT_MS = 30000;

const makeUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

const parseBody = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

const request = async <T = any>(
  method: string,
  path: string,
  body?: JsonValue,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  const token = await SecureStore.getItemAsync('authToken');
  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(makeUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await parseBody(response);

    if (!response.ok) {
      const error = new Error(
        (data as any)?.error || (data as any)?.message || `Request failed with status ${response.status}`
      ) as ApiError;
      error.status = response.status;
      error.response = { status: response.status, data };
      throw error;
    }

    return { data: data as T, status: response.status };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeoutMs}ms`) as ApiError;
      timeoutError.response = {
        status: 408,
        data: { error: 'Request timeout', message: `Request timeout after ${timeoutMs}ms` },
      };
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const api = {
  get: <T = any>(path: string, config?: ApiRequestConfig) => request<T>('GET', path, undefined, config),
  post: <T = any>(path: string, body?: JsonValue, config?: ApiRequestConfig) =>
    request<T>('POST', path, body, config),
  put: <T = any>(path: string, body?: JsonValue, config?: ApiRequestConfig) => request<T>('PUT', path, body, config),
  patch: <T = any>(path: string, body?: JsonValue, config?: ApiRequestConfig) =>
    request<T>('PATCH', path, body, config),
  delete: <T = any>(path: string, config?: ApiRequestConfig) => request<T>('DELETE', path, undefined, config),
};

export default api;
