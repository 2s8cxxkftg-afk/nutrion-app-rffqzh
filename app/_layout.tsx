
import '../utils/i18n';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import 'react-native-reanimated';
import { ToastComponent } from '@/components/Toast';
import { initializeNotifications } from '@/utils/notificationScheduler';
import { ErrorBoundary } from 'react-error-boundary';

SplashScreen.preventAutoHideAsync();

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={resetErrorBoundary}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
      <Text style={styles.errorHint}>
        If the problem persists, try restarting the app.
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Initialize notification system with error handling
      initializeNotifications().catch(error => {
        console.error('Failed to initialize notifications:', error);
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error:', error);
        console.error('Error Info:', errorInfo);
      }}
      onReset={() => {
        // Reset app state if needed
        console.log('Error boundary reset');
      }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="language-selection" options={{ headerShown: false }} />
          <Stack.Screen name="introduction" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="confirm-email" options={{ headerShown: false }} />
          <Stack.Screen name="email-confirmed" options={{ headerShown: false }} />
          <Stack.Screen name="add-item" options={{ headerShown: false }} />
          <Stack.Screen name="food-search" options={{ headerShown: false }} />
          <Stack.Screen name="language-settings" options={{ headerShown: false }} />
          <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
          <Stack.Screen name="subscription-management" options={{ headerShown: false }} />
          <Stack.Screen name="subscription-intro" options={{ headerShown: false }} />
          <Stack.Screen name="subscription-success" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="edit-item" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="change-password" options={{ headerShown: false }} />
          <Stack.Screen name="test-connection" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="formsheet" options={{ presentation: 'formSheet' }} />
          <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal' }} />
        </Stack>
        <StatusBar style="auto" />
        <ToastComponent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorHint: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
