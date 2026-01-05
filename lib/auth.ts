
/**
 * ============================================================================
 * BETTERAUTH CLIENT CONFIGURATION
 * ============================================================================
 * 
 * This file sets up the authentication client for the entire app.
 * It handles user login, signup, and session management across web and mobile.
 * 
 * KEY CONCEPTS:
 * - BetterAuth: A modern authentication library that works on web and mobile
 * - SecureStore: Encrypted storage for sensitive data on mobile devices
 * - Bearer Token: A security token used to authenticate API requests
 * - Deep Linking: URLs that open specific screens in your mobile app
 * 
 * PLATFORM DIFFERENCES:
 * - Web: Uses browser's localStorage (not encrypted, but acceptable for web)
 * - Mobile: Uses SecureStore (encrypted storage for maximum security)
 * 
 * TODO ITEMS (things you need to customize):
 * 1. Replace YOUR_BACKEND_URL with your actual backend URL
 * 2. Replace "your-app-scheme" with your app's URL scheme (e.g., "nutrion://")
 * 3. Replace "your-app" with your app name (e.g., "nutrion")
 */

import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Backend URL - Where your authentication server lives
 * This is automatically set in app.json when you deploy your backend
 * Example: "https://api.nutrion.com" or "http://localhost:3000"
 */
const API_URL = Constants.expoConfig?.extra?.backendUrl || "";

/**
 * Bearer token key - Used to store the authentication token
 * TODO: Replace "your-app" with your actual app name (e.g., "nutrion_bearer_token")
 * This key is used to save/retrieve the token from storage
 */
const BEARER_TOKEN_KEY = "your-app_bearer_token";

// ============================================================================
// PLATFORM-SPECIFIC STORAGE
// ============================================================================

/**
 * Storage adapter that works on both web and mobile
 * 
 * WHY WE NEED THIS:
 * - Web browsers use localStorage (built-in browser storage)
 * - Mobile apps use SecureStore (encrypted storage for security)
 * - This adapter provides a unified interface for both platforms
 * 
 * METHODS:
 * - getItem: Retrieve a value by key
 * - setItem: Save a value with a key
 * - deleteItem: Remove a value by key
 */
const storage = Platform.OS === "web"
  ? {
      // Web storage implementation using browser's localStorage
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      deleteItem: (key: string) => localStorage.removeItem(key),
    }
  : SecureStore; // Mobile storage using encrypted SecureStore

// ============================================================================
// AUTH CLIENT SETUP
// ============================================================================

/**
 * Main authentication client - This is what you'll use throughout your app
 * 
 * WHAT IT DOES:
 * - Handles user login/signup
 * - Manages user sessions
 * - Stores authentication tokens securely
 * - Handles OAuth (Google, Apple, etc.)
 * 
 * CONFIGURATION EXPLAINED:
 * - baseURL: Your backend server address
 * - plugins: Extra features (expoClient adds mobile deep linking support)
 * - fetchOptions: Special settings for web to handle authentication tokens
 */
export const authClient = createAuthClient({
  // Backend server URL where authentication happens
  baseURL: API_URL,
  
  // Plugins add extra functionality
  plugins: [
    expoClient({
      // URL scheme for deep linking (e.g., "nutrion://auth/callback")
      // TODO: Replace with your app's scheme
      scheme: "your-app-scheme",
      
      // Prefix for storage keys to avoid conflicts with other data
      // TODO: Replace with your app name
      storagePrefix: "your-app",
      
      // Storage adapter (web or mobile)
      storage,
    }),
  ],
  
  // Web-specific configuration
  // This section only applies when running on web browsers
  ...(Platform.OS === "web" && {
    fetchOptions: {
      auth: {
        // Use Bearer token authentication for web
        // Bearer tokens are sent in the "Authorization" header of HTTP requests
        type: "Bearer" as const,
        
        // Function to retrieve the token from localStorage
        token: () => localStorage.getItem(BEARER_TOKEN_KEY) || "",
      },
    },
  }),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Store bearer token for web authentication
 * 
 * WHEN TO USE:
 * - After successful OAuth login on web (Google, Apple, etc.)
 * - The OAuth popup returns a token that needs to be stored
 * 
 * WHY WEB ONLY:
 * - Mobile apps use deep linking and handle tokens automatically
 * - Web uses popup-based OAuth which requires manual token storage
 * 
 * @param token - The authentication token received from OAuth
 */
export function storeWebBearerToken(token: string) {
  // Only store on web platform
  if (Platform.OS === "web") {
    localStorage.setItem(BEARER_TOKEN_KEY, token);
  }
}

/**
 * Clear stored authentication tokens
 * 
 * WHEN TO USE:
 * - When user logs out
 * - When token expires
 * - When switching accounts
 * 
 * WHAT IT DOES:
 * - Removes the bearer token from storage
 * - User will need to log in again
 */
export function clearAuthTokens() {
  // Only clear on web platform (mobile tokens are handled by BetterAuth)
  if (Platform.OS === "web") {
    localStorage.removeItem(BEARER_TOKEN_KEY);
  }
}
