
import '../utils/i18n';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { ToastComponent } from '@/components/Toast';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="language-selection" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="email-confirmed" options={{ headerShown: false }} />
        <Stack.Screen name="add-item" options={{ headerShown: false }} />
        <Stack.Screen name="food-search" options={{ headerShown: false }} />
        <Stack.Screen name="scan-barcode" options={{ headerShown: false }} />
        <Stack.Screen name="language-settings" options={{ headerShown: false }} />
        <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
        <Stack.Screen name="subscription-management" options={{ headerShown: false }} />
        <Stack.Screen name="subscription-intro" options={{ headerShown: false }} />
        <Stack.Screen name="setup-2fa" options={{ headerShown: false }} />
        <Stack.Screen name="edit-item" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="formsheet" options={{ presentation: 'formSheet' }} />
        <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal' }} />
      </Stack>
      <StatusBar style="auto" />
      <ToastComponent />
    </ThemeProvider>
  );
}
