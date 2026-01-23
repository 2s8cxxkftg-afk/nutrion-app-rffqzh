
import React, { useState, useEffect } from "react";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, spacing, borderRadius, typography } from "@/styles/commonStyles";
import { supabase } from "@/utils/supabase";
import Toast from "@/components/Toast";
import Logo from "@/components/Logo";
import { useRouter, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  switchText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  switchButton: {
    marginLeft: spacing.xs,
  },
  switchButtonText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
});

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const router = useRouter();

  // Handle deep links for password reset
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      const url = Linking.parse(event.url);
      console.log('Parsed URL:', url);
      
      // Check if this is a password reset link
      // Supabase sends recovery links with type=recovery in the URL
      if (url.path === 'reset-password' || url.queryParams?.type === 'recovery') {
        console.log('Password reset link detected');
        
        // Extract the access token and refresh token from the URL
        const accessToken = url.queryParams?.access_token as string;
        const refreshToken = url.queryParams?.refresh_token as string;
        
        if (accessToken) {
          console.log('Setting session from URL tokens');
          
          // Set the session using the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error('Error setting session:', error);
            Toast.show("Invalid or expired reset link", "error");
            return;
          }
          
          console.log('Session set successfully, navigating to reset screen');
          router.push('/reset-password');
        } else {
          console.log('No access token found in URL, navigating to reset screen anyway');
          router.push('/reset-password');
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailAuth = async () => {
    if (!validateEmail(email)) {
      Toast.show("Please enter a valid email address", "error");
      return;
    }

    if (password.length < 6) {
      Toast.show("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        Toast.show("Welcome back!", "success");
        router.replace("/(tabs)/pantry");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        Toast.show("Account created! Please check your email to verify.", "success");
        setIsLogin(true);
      }
    } catch (error: any) {
      Toast.show(error.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    console.log('User tapped Forgot Password button');
    
    if (!validateEmail(email)) {
      Toast.show("Please enter your email address", "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setRetryAttempt(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Retry logic with exponential backoff
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any = null;
    
    while (retryCount < maxRetries) {
      try {
        setRetryAttempt(retryCount + 1);
        console.log(`Attempt ${retryCount + 1}/${maxRetries}: Sending password reset email to:`, email);
        
        // Use the app's deep link scheme for password reset
        const redirectUrl = Linking.createURL('reset-password');
        console.log('Redirect URL:', redirectUrl);
        
        // Set a timeout for the request (30 seconds)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
        });
        
        const resetPromise = supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        
        // Race between the actual request and timeout
        const result = await Promise.race([resetPromise, timeoutPromise]) as any;
        
        if (result.error) {
          console.error('Password reset error:', result.error);
          lastError = result.error;
          
          // Handle specific error types
          if (result.error.status === 504 || result.error.name === 'AuthRetryableFetchError') {
            // Retry on timeout errors
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`Retrying in ${retryCount * 2} seconds...`);
              Toast.show(`Connection timeout. Retrying (${retryCount}/${maxRetries})...`, "info");
              await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
              continue;
            }
            throw new Error('Connection timeout. Please check your internet connection and try again.');
          } else if (result.error.status === 429) {
            throw new Error('Too many requests. Please wait a few minutes and try again.');
          } else if (result.error.message) {
            throw new Error(result.error.message);
          } else {
            throw new Error('Failed to send reset email. Please try again.');
          }
        }
        
        // Success!
        console.log('Password reset email sent successfully');
        Toast.show("Password reset email sent! Check your inbox.", "success");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setLoading(false);
        setRetryAttempt(0);
        return;
        
      } catch (error: any) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        lastError = error;
        
        // If it's a timeout and we have retries left, continue
        if ((error.message?.includes('timeout') || error.message?.includes('Timeout')) && retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`Retrying in ${retryCount * 2} seconds...`);
          Toast.show(`Connection timeout. Retrying (${retryCount}/${maxRetries})...`, "info");
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
          continue;
        }
        
        // Otherwise, break and show error
        break;
      }
    }
    
    // If we get here, all retries failed
    console.error('All retry attempts failed. Last error:', lastError);
    
    // Extract a meaningful error message
    let errorMessage = 'Failed to send reset email. Please try again later.';
    
    if (lastError?.message) {
      if (lastError.message.includes('timeout') || lastError.message.includes('Timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (lastError.message.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a few minutes and try again.';
      } else {
        errorMessage = lastError.message;
      }
    } else if (lastError?.status === 504) {
      errorMessage = 'Server timeout. Please try again in a few moments.';
    } else if (lastError?.status === 429) {
      errorMessage = 'Too many requests. Please wait a few minutes and try again.';
    } else if (lastError?.name === 'AuthRetryableFetchError') {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    Toast.show(errorMessage, "error");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setLoading(false);
    setRetryAttempt(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Logo size="large" showText={true} />
          </View>

          <Text style={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Sign in to manage your pantry"
              : "Join Nutrion to reduce food waste"}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "Sign In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>
                {loading && retryAttempt > 0 
                  ? `Sending... (Attempt ${retryAttempt}/3)` 
                  : 'Forgot Password?'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              <Text style={styles.switchButtonText}>
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
