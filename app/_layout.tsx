
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, View, Text, StyleSheet } from "react-native";
import { useNetworkState } from "expo-network";
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

// Handle unhandled promise rejections
try {
  if (typeof global !== 'undefined' && global.Promise) {
    const originalPromiseRejection = global.Promise.prototype.catch;
    global.Promise.prototype.catch = function(onRejected) {
      return originalPromiseRejection.call(this, (error: any) => {
        console.error('=== UNHANDLED PROMISE REJECTION ===');
        console.error('Error:', error);
        console.error('Message:', error?.message || 'No message');
        console.error('Stack:', error?.stack || 'No stack trace');
        console.error('===================================');
        
        if (onRejected) {
          try {
            return onRejected(error);
          } catch (rejectionError) {
            console.error('Error in rejection handler:', rejectionError);
            throw rejectionError;
          }
        }
        throw error;
      });
    };
  }
} catch (setupError) {
  console.error('Failed to set up promise rejection handler:', setupError);
}

// Initialize i18n with error handling
try {
  require("@/utils/i18n");
  console.log('i18n initialized successfully');
} catch (error: any) {
  console.error('Failed to initialize i18n:', error.message || error);
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.error('Failed to prevent splash screen auto-hide:', error);
});

export const unstable_settings = {
  initialRouteName: "(tabs)", // Ensure any route can link back to `/`
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch((error) => {
        console.error('Failed to hide splash screen:', error);
      });
    }
  }, [loaded]);

  // Set up toast callback
  useEffect(() => {
    setToastCallback((message: string, type: 'success' | 'error' | 'info') => {
      console.log('[Toast] Showing toast:', message, type);
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
    });
  }, []);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)", // System Blue
      background: "rgb(242, 242, 247)", // Light mode background
      card: "rgb(255, 255, 255)", // White cards/surfaces
      text: "rgb(0, 0, 0)", // Black text for light mode
      border: "rgb(216, 216, 220)", // Light gray for separators/borders
      notification: "rgb(255, 59, 48)", // System Red
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)", // System Blue (Dark Mode)
      background: "rgb(1, 1, 1)", // True black background for OLED displays
      card: "rgb(28, 28, 30)", // Dark card/surface color
      text: "rgb(255, 255, 255)", // White text for dark mode
      border: "rgb(44, 44, 46)", // Dark gray for separators/borders
      notification: "rgb(255, 69, 58)", // System Red (Dark Mode)
    },
  };

  // Error fallback component
  const ErrorFallback = ({ error }: { error: Error }) => {
    console.error('App Error:', error);
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
    fontFamily: 'monospace',
  },
});
