
/**
 * BetterAuth Client Configuration
 *
 * Provides authentication client with:
 * - Platform-specific storage (localStorage for web, SecureStore for native)
 * - Bearer token handling for web
 * - Expo client plugin for deep linking
 */

// eslint-disable-next-line import/no-unresolved
import { createAuthClient } from "better-auth/react";
// eslint-disable-next-line import/no-unresolved
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Backend URL from app.json configuration
const API_URL = Constants.expoConfig?.extra?.backendUrl || "";
const BEARER_TOKEN_KEY = "nutrion_bearer_token";

// Platform-specific storage adapter
const storage = Platform.OS === "web"
  ? {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      deleteItem: (key: string) => localStorage.removeItem(key),
    }
  : SecureStore;

// Create auth client with platform-specific configuration
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "nutrion",
      storagePrefix: "nutrion",
      storage,
    }),
  ],
  // Web-specific bearer token configuration
  ...(Platform.OS === "web" && {
    fetchOptions: {
      auth: {
        type: "Bearer" as const,
        token: () => localStorage.getItem(BEARER_TOKEN_KEY) || "",
      },
    },
  }),
});

/**
 * Store bearer token for web authentication
 */
export function storeWebBearerToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(BEARER_TOKEN_KEY, token);
  }
}

/**
 * Clear stored authentication tokens
 */
export function clearAuthTokens() {
  if (Platform.OS === "web") {
    localStorage.removeItem(BEARER_TOKEN_KEY);
  }
}
