
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, View, Text, StyleSheet, Platform } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Toast, { setToastCallback } from "@/components/Toast";
import { ErrorBoundary } from "react-error-boundary";

// Global error handler for unhandled errors and promise rejections
try {
  if (typeof global !== 'undefined' && typeof ErrorUtils !== 'undefined') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('=== GLOBAL ERROR CAUGHT ===');
      console.error('Platform:', Platform.OS);
      console.error('Error:', error);
      console.error('Message:', error?.message || 'No message');
      console.error('Is fatal:', isFatal);
      console.error('Stack:', error?.stack || 'No stack trace');
      console.error('=========================');
      
      // Call original handler
      if (originalHandler) {
        try {
          originalHandler(error, isFatal);
        } catch (handlerError) {
          console.error('Error in original handler:', handlerError);
        }
      }
    });
  }
} catch (setupError) {
  console.error('Failed to set up global error handler:', setupError);
}

// Initialize i18n with error handling
try {
  require("@/utils/i18n");
  console.log('[i18n] Initialized successfully');
} catch (error: any) {
  console.error('[i18n] Failed to initialize:', error?.message || error);
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.error('[SplashScreen] Failed to prevent auto-hide:', error);
});

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    if (loaded) {
      console.log('[RootLayout] Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync().catch((error) => {
        console.error('[SplashScreen] Failed to hide:', error);
      });
    }
  }, [loaded]);

  // Set up toast callback
  useEffect(() => {
    setToastCallback((message: string, type: 'success' | 'error' | 'info') => {
      console.log('[Toast] Showing:', message, type);
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
    });
  }, []);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(76, 175, 80)",
      background: "rgb(255, 255, 255)",
      card: "rgb(255, 255, 255)",
      text: "rgb(33, 33, 33)",
      border: "rgb(224, 224, 224)",
      notification: "rgb(244, 67, 54)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(76, 175, 80)",
      background: "rgb(18, 18, 18)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(244, 67, 54)",
    },
  };

  // Error fallback component
  const ErrorFallback = ({ error }: { error: Error }) => {
    console.error('[ErrorBoundary] App Error:', error);
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.title}>Oops! Something went wrong</Text>
        <Text style={errorStyles.message}>
          The app encountered an error. Please restart the app.
        </Text>
        <Text style={errorStyles.error}>{error.message}</Text>
      </View>
    );
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <WidgetProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
            >
              <StatusBar style="auto" animated />
              <Stack>
                {/* Index/splash screen */}
                <Stack.Screen name="index" options={{ headerShown: false }} />

                {/* Onboarding */}
                <Stack.Screen name="introduction" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />

                {/* Main app with tabs */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* Auth screens */}
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="forgot-password" 
                  options={{ 
                    headerShown: false,
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="reset-password" 
                  options={{ 
                    headerShown: true,
                    title: "Reset Password",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="confirm-email" 
                  options={{ 
                    headerShown: true,
                    title: "Confirm Email",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="email-confirmed" 
                  options={{ 
                    headerShown: true,
                    title: "Email Confirmed",
                    presentation: "card"
                  }} 
                />

                {/* Subscription screens */}
                <Stack.Screen 
                  name="subscription-intro" 
                  options={{ 
                    headerShown: false,
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="paywall" 
                  options={{ 
                    headerShown: true,
                    title: "Premium",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="subscription-success" 
                  options={{ 
                    headerShown: false,
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="subscription-management" 
                  options={{ 
                    headerShown: true,
                    title: "Manage Subscription",
                    presentation: "card"
                  }} 
                />

                {/* Feature screens */}
                <Stack.Screen 
                  name="add-item" 
                  options={{ 
                    headerShown: true,
                    title: "Add Item",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="edit-item" 
                  options={{ 
                    headerShown: true,
                    title: "Edit Item",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="scan-receipt" 
                  options={{ 
                    headerShown: true,
                    title: "Scan Receipt",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="ai-recipes" 
                  options={{ 
                    headerShown: true,
                    title: "AI Recipe Generator",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="food-search" 
                  options={{ 
                    headerShown: true,
                    title: "Search Food",
                    presentation: "card"
                  }} 
                />

                {/* Settings screens */}
                <Stack.Screen 
                  name="notification-settings" 
                  options={{ 
                    headerShown: true,
                    title: "Notification Settings",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="edit-profile" 
                  options={{ 
                    headerShown: true,
                    title: "Edit Profile",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="change-password" 
                  options={{ 
                    headerShown: true,
                    title: "Change Password",
                    presentation: "card"
                  }} 
                />
                <Stack.Screen 
                  name="about" 
                  options={{ 
                    headerShown: true,
                    title: "About",
                    presentation: "card"
                  }} 
                />

                {/* Test/Debug screens */}
                <Stack.Screen 
                  name="test-connection" 
                  options={{ 
                    headerShown: true,
                    title: "Test Connection",
                    presentation: "card"
                  }} 
                />

                {/* Modal examples */}
                <Stack.Screen 
                  name="modal" 
                  options={{ 
                    presentation: "modal",
                    title: "Modal"
                  }} 
                />
                <Stack.Screen 
                  name="formsheet" 
                  options={{ 
                    presentation: "formSheet",
                    title: "Form Sheet",
                    sheetGrabberVisible: true,
                    sheetAllowedDetents: [0.5, 0.8, 1.0],
                    sheetCornerRadius: 20
                  }} 
                />

                {/* 404 Not Found */}
                <Stack.Screen name="+not-found" options={{ headerShown: false }} />
              </Stack>
              <SystemBars style={"auto"} />
              
              {/* Global Toast */}
              <Toast
                visible={toastVisible}
                message={toastMessage}
                type={toastType}
                onHide={() => setToastVisible(false)}
              />
            </ThemeProvider>
          </WidgetProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F1E8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F5F4E',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
