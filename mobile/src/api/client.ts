import axios from "axios";
import Constants from "expo-constants";

const apiBaseUrl =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  "http://localhost:4000/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use(async (config) => {
  // TODO: read token from secure storage
  // For scaffolding, we expect caller to set Authorization header when needed.
  return config;
});

