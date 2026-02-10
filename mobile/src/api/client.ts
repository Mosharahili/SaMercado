import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const apiBaseUrl =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  "http://localhost:4000/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
});

const TOKEN_KEY = "auth_token";

export const setToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  delete api.defaults.headers.common.Authorization;
};

// Load token on app start
(async () => {
  const token = await getToken();
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
})();

// API Types
export interface BannerDto {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  placement: string;
  enabled: boolean;
  ctaText?: string | null;
  actionType?: string;
  actionTargetId?: string | null;
  externalUrl?: string | null;
  startAt?: string | null;
  endAt?: string | null;
}

export interface PopupDto {
  id: string;
  title: string;
  message: string | null;
  imageUrl: string | null;
  targetType: string;
  enabled: boolean;
  primaryCtaText?: string | null;
  secondaryCtaText?: string | null;
  marketIds?: string[];
  categoryIds?: string[];
  startAt?: string | null;
  endAt?: string | null;
}

