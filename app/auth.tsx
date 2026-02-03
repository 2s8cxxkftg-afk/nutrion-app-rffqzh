
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
  const router = useRouter();

  // Handle deep links for password reset
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received in auth screen:', event.url);
      
      try {
        const url = Linking.parse(event.url);
        console.log('Parsed URL:', JSON.stringify(url, null, 2));
        
        // Check if this is a password reset link
        // Supabase sends recovery links with type=recovery in the URL
        const isResetLink = url.path === 'reset-password' || 
                           url.queryParams?.type === 'recovery' ||
                           event.url.includes('reset-password') ||
                           event.url.includes('type=recovery');
        
        if (isResetLink) {
          console.log('Password reset link detected');
          
          // Extract the access token and refresh token from the URL
          const accessToken = url.queryParams?.access_token as string;
          const refreshToken = url.queryParams?.refresh_token as string;
          const type = url.queryParams?.type as string;
          
          console.log('Token info - type:', type, 'has access_token:', !!accessToken, 'has refresh_token:', !!refreshToken);
          
          if (accessToken && type === 'recovery') {
            console.log('Setting session from URL tokens');
            
            // Set the session using the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Error setting session:', error);
              Toast.show("Invalid or expired reset link. Please request a new one.", "error");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              return;
            }
            
            console.log('Session set successfully:', data.session?.user?.email);
            Toast.show("Reset link verified! Set your new password.", "success");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Navigate to reset password screen
            setTimeout(() => {
              router.push('/reset-password');
            }, 500);
          } else {
            console.log('No valid tokens found in URL, navigating to reset screen to check session');
            router.push('/reset-password');
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
        Toast.show("Error processing reset link", "error");
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL on auth screen:', url);
        handleDeepLink({ url });
      }
    }).catch((error) => {
      console.error('Error getting initial URL:', error);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailAuth = async () => {
    console.log('User tapped Sign In/Sign Up button');
    
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
        console.log('Attempting to sign in with email:', email);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        console.log('Sign in successful');
        Toast.show("Welcome back!", "success");
        router.replace("/(tabs)/pantry");
      } else {
        console.log('Attempting to sign up with email:', email);
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        console.log('Sign up successful');
        Toast.show("Account created! Please check your email to verify.", "success");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Toast.show(error.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('User tapped Forgot Password button');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/forgot-password');
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
                Forgot Password?
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
