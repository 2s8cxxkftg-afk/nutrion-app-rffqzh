
/**
 * ============================================================================
 * API UTILITIES - MAKING BACKEND REQUESTS EASY
 * ============================================================================
 * 
 * This file provides helper functions to communicate with your backend server.
 * Think of it as a translator between your app and your server.
 * 
 * KEY CONCEPTS:
 * - API: Application Programming Interface - how your app talks to the server
 * - Endpoint: A specific URL on your server (e.g., "/users", "/pantry/items")
 * - HTTP Methods: Different types of requests (GET=read, POST=create, PUT=update, DELETE=remove)
 * - Bearer Token: A password-like token that proves you're logged in
 * - JSON: JavaScript Object Notation - the language apps use to exchange data
 * 
 * EXAMPLE USAGE:
 * ```typescript
 * // Get all pantry items
 * const items = await apiGet('/pantry/items');
 * 
 * // Add a new item
 * const newItem = await apiPost('/pantry/items', { name: 'Milk', quantity: 1 });
 * 
 * // Update an item (requires authentication)
 * const updated = await authenticatedPut('/pantry/items/123', { quantity: 2 });
 * 
 * // Delete an item (requires authentication)
 * await authenticatedDelete('/pantry/items/123');
 * ```
 */

import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Backend URL - The address of your server
 * 
 * HOW IT WORKS:
 * - Automatically configured in app.json when backend deploys
 * - Example: "https://api.nutrion.com" or "http://localhost:3000"
 * - All API requests will be sent to this URL
 */
export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || "";

/**
 * Bearer token storage key
 * 
 * WHAT IS A BEARER TOKEN:
 * - A secret code that proves you're logged in
 * - Sent with every authenticated request
 * - Like showing your ID card to access restricted areas
 * 
 * TODO: Replace "your-app" with your app name (e.g., "nutrion_bearer_token")
 * MUST MATCH: The key in lib/auth.ts
 */
const BEARER_TOKEN_KEY = "your-app_bearer_token";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if backend is properly configured
 * 
 * WHEN TO USE:
 * - Before making API calls
 * - In app startup to verify configuration
 * - To show helpful error messages to developers
 * 
 * @returns true if backend URL exists, false otherwise
 */
export const isBackendConfigured = (): boolean => {
  return !!BACKEND_URL && BACKEND_URL.length > 0;
};

/**
 * Get bearer token from platform-specific storage
 * 
 * HOW IT WORKS:
 * - Web: Retrieves from browser's localStorage
 * - Mobile: Retrieves from encrypted SecureStore
 * 
 * WHEN TO USE:
 * - Before making authenticated API requests
 * - To check if user is logged in
 * 
 * @returns Bearer token string or null if not found
 */
export const getBearerToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      // Web: Use browser's localStorage
      return localStorage.getItem(BEARER_TOKEN_KEY);
    } else {
      // Mobile: Use encrypted SecureStore
      return await SecureStore.getItemAsync(BEARER_TOKEN_KEY);
    }
  } catch (error) {
    // Log error for debugging
    console.error("[API] Error retrieving bearer token:", error);
    return null;
  }
};

// ============================================================================
// CORE API FUNCTIONS
// ============================================================================

/**
 * Generic API call helper with error handling
 * 
 * THIS IS THE MAIN FUNCTION - All other API functions use this internally
 * 
 * HOW IT WORKS:
 * 1. Checks if backend is configured
 * 2. Builds the full URL (backend URL + endpoint)
 * 3. Sends the request with proper headers
 * 4. Handles errors and returns data
 * 
 * PARAMETERS EXPLAINED:
 * @param endpoint - The API path (e.g., '/users', '/pantry/items')
 * @param options - Request configuration (method, headers, body, etc.)
 * 
 * EXAMPLE:
 * ```typescript
 * const data = await apiCall('/pantry/items', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'Milk' })
 * });
 * ```
 * 
 * @returns Parsed JSON response from server
 * @throws Error if backend not configured or request fails
 */
export const apiCall = async <T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  // STEP 1: Verify backend is configured
  if (!isBackendConfigured()) {
    throw new Error("Backend URL not configured. Please rebuild the app.");
  }

  // STEP 2: Build full URL
  // Example: "https://api.nutrion.com" + "/pantry/items" = "https://api.nutrion.com/pantry/items"
  const url = `${BACKEND_URL}${endpoint}`;
  
  // Log for debugging (helps track what requests are being made)
  console.log("[API] Calling:", url, options?.method || "GET");

  try {
    // STEP 3: Send HTTP request
    const response = await fetch(url, {
      ...options, // Spread existing options (method, body, etc.)
      headers: {
        // Tell server we're sending/expecting JSON data
        "Content-Type": "application/json",
        ...options?.headers, // Include any additional headers
      },
    });

    // STEP 4: Check if request was successful
    if (!response.ok) {
      // Request failed - get error message from server
      const text = await response.text();
      console.error("[API] Error response:", response.status, text);
      throw new Error(`API error: ${response.status} - ${text}`);
    }

    // STEP 5: Parse and return JSON data
    const data = await response.json();
    console.log("[API] Success:", data);
    return data;
  } catch (error) {
    // Log error for debugging
    console.error("[API] Request failed:", error);
    throw error; // Re-throw so calling code can handle it
  }
};

// ============================================================================
// CONVENIENCE FUNCTIONS - BASIC REQUESTS
// ============================================================================

/**
 * GET request - Retrieve data from server
 * 
 * WHEN TO USE:
 * - Fetching list of items
 * - Getting user profile
 * - Reading any data
 * 
 * EXAMPLE:
 * ```typescript
 * const items = await apiGet('/pantry/items');
 * const user = await apiGet('/users/me');
 * ```
 */
export const apiGet = async <T = any>(endpoint: string): Promise<T> => {
  return apiCall<T>(endpoint, { method: "GET" });
};

/**
 * POST request - Create new data on server
 * 
 * WHEN TO USE:
 * - Adding new pantry item
 * - Creating new user
 * - Submitting forms
 * 
 * EXAMPLE:
 * ```typescript
 * const newItem = await apiPost('/pantry/items', {
 *   name: 'Milk',
 *   quantity: 1,
 *   expiryDate: '2024-12-31'
 * });
 * ```
 */
export const apiPost = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data), // Convert JavaScript object to JSON string
  });
};

/**
 * PUT request - Replace entire resource on server
 * 
 * WHEN TO USE:
 * - Updating entire item
 * - Replacing user profile
 * 
 * DIFFERENCE FROM PATCH:
 * - PUT replaces the entire resource
 * - PATCH updates only specific fields
 * 
 * EXAMPLE:
 * ```typescript
 * const updated = await apiPut('/pantry/items/123', {
 *   name: 'Milk',
 *   quantity: 2,
 *   expiryDate: '2024-12-31'
 * });
 * ```
 */
export const apiPut = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request - Update specific fields on server
 * 
 * WHEN TO USE:
 * - Updating only quantity
 * - Changing only expiry date
 * - Partial updates
 * 
 * EXAMPLE:
 * ```typescript
 * // Only update quantity, leave other fields unchanged
 * const updated = await apiPatch('/pantry/items/123', {
 *   quantity: 2
 * });
 * ```
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request - Remove data from server
 * 
 * WHEN TO USE:
 * - Deleting pantry item
 * - Removing user account
 * - Clearing data
 * 
 * EXAMPLE:
 * ```typescript
 * await apiDelete('/pantry/items/123');
 * ```
 */
export const apiDelete = async <T = any>(endpoint: string): Promise<T> => {
  return apiCall<T>(endpoint, { method: "DELETE" });
};

// ============================================================================
// AUTHENTICATED REQUESTS - REQUIRE LOGIN
// ============================================================================

/**
 * Authenticated API call - For requests that require login
 * 
 * HOW IT WORKS:
 * 1. Retrieves bearer token from storage
 * 2. Adds token to Authorization header
 * 3. Server verifies token and processes request
 * 
 * WHEN TO USE:
 * - Any request that needs user identity
 * - Accessing user-specific data
 * - Protected endpoints
 * 
 * SECURITY:
 * - Token proves you're logged in
 * - Server rejects requests without valid token
 * - Like showing your ID card at a secure building
 * 
 * @param endpoint - API path
 * @param options - Request configuration
 * @returns Parsed JSON response
 * @throws Error if token not found or request fails
 */
export const authenticatedApiCall = async <T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  // STEP 1: Get authentication token
  const token = await getBearerToken();

  // STEP 2: Verify token exists
  if (!token) {
    throw new Error("Authentication token not found. Please sign in.");
  }

  // STEP 3: Make request with Authorization header
  return apiCall<T>(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      // Add Bearer token to Authorization header
      // Format: "Authorization: Bearer abc123xyz..."
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Authenticated GET - Retrieve user-specific data
 * 
 * EXAMPLE:
 * ```typescript
 * const myItems = await authenticatedGet('/pantry/items');
 * const myProfile = await authenticatedGet('/users/me');
 * ```
 */
export const authenticatedGet = async <T = any>(endpoint: string): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, { method: "GET" });
};

/**
 * Authenticated POST - Create user-specific data
 * 
 * EXAMPLE:
 * ```typescript
 * const newItem = await authenticatedPost('/pantry/items', {
 *   name: 'Milk',
 *   quantity: 1
 * });
 * ```
 */
export const authenticatedPost = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated PUT - Replace user-specific resource
 * 
 * EXAMPLE:
 * ```typescript
 * const updated = await authenticatedPut('/pantry/items/123', {
 *   name: 'Milk',
 *   quantity: 2
 * });
 * ```
 */
export const authenticatedPut = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated PATCH - Update specific fields of user data
 * 
 * EXAMPLE:
 * ```typescript
 * const updated = await authenticatedPatch('/pantry/items/123', {
 *   quantity: 2
 * });
 * ```
 */
export const authenticatedPatch = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated DELETE - Remove user-specific data
 * 
 * EXAMPLE:
 * ```typescript
 * await authenticatedDelete('/pantry/items/123');
 * ```
 */
export const authenticatedDelete = async <T = any>(endpoint: string): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, { method: "DELETE" });
};
