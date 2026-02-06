
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  form: {
    flex: 1,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.semibold,
    color: '#FFFFFF',
    marginRight: spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: spacing.sm,
  },
  passwordRequirements: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  requirementText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  requirementMet: {
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorIcon: {
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    console.log('[ResetPassword] === Checking for valid session ===');
    console.log('[ResetPassword] Platform:', Platform.OS);
    
    try {
      // For iOS/Android, check if we were opened via deep link
      if (Platform.OS !== 'web') {
        console.log('[ResetPassword] Native platform detected, checking deep link...');
        
        const url = await Linking.getInitialURL();
        console.log('[ResetPassword] Initial URL:', url);
        
        if (url && (url.includes('reset-password') || url.includes('type=recovery'))) {
          console.log('[ResetPassword] Reset password deep link detected');
          
          // Parse URL for tokens (Supabase may include them as query params or hash)
          const parsedUrl = Linking.parse(url);
          console.log('[ResetPassword] Parsed URL:', JSON.stringify(parsedUrl, null, 2));
          
          // Extract tokens from query params if present
          const accessToken = parsedUrl.queryParams?.access_token as string;
          const refreshToken = parsedUrl.queryParams?.refresh_token as string;
          const type = parsedUrl.queryParams?.type as string;
          
          console.log('[ResetPassword] URL params - type:', type, 'has access_token:', !!accessToken);
          
          if (type === 'recovery' && accessToken) {
            console.log('[ResetPassword] Recovery tokens found in deep link, setting session');
            
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (sessionError) {
              console.error('[ResetPassword] Error setting session from deep link:', sessionError);
              throw sessionError;
            }
            
            console.log('[ResetPassword] Session set successfully from deep link tokens');
            console.log('[ResetPassword] User:', data.session?.user?.email);
            setHasValidSession(true);
            setSessionChecked(true);
            return;
          }
        }
      }
      
      // For web, check URL hash for tokens
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        console.log('[ResetPassword] Web platform, checking URL for tokens');
        console.log('[ResetPassword] URL hash:', window.location.hash);
        console.log('[ResetPassword] URL search:', window.location.search);
        
        // Check both hash and search params
        let accessToken = '';
        let refreshToken = '';
        let type = '';
        
        // Check hash params (Supabase default)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token') || '';
          refreshToken = hashParams.get('refresh_token') || '';
          type = hashParams.get('type') || '';
        }
        
        // Check search params as fallback
        if (!accessToken && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token') || '';
          refreshToken = searchParams.get('refresh_token') || '';
          type = searchParams.get('type') || '';
        }
        
        console.log('[ResetPassword] Extracted params - type:', type, 'has access_token:', !!accessToken);
        
        if (type === 'recovery' && accessToken) {
          console.log('[ResetPassword] Recovery link detected, setting session from URL tokens');
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionError) {
            console.error('[ResetPassword] Error setting session from URL:', sessionError);
            throw sessionError;
          }
          
          console.log('[ResetPassword] Session set successfully from URL tokens');
          console.log('[ResetPassword] User:', data.session?.user?.email);
          setHasValidSession(true);
          setSessionChecked(true);
          return;
        }
      }
      
      // If no tokens in URL/deep link, check for existing session
      console.log('[ResetPassword] No tokens in URL, checking for existing session');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[ResetPassword] Error getting session:', error);
        setHasValidSession(false);
      } else if (session) {
        console.log('[ResetPassword] Valid session found');
        console.log('[ResetPassword] Session user:', session.user?.email);
        setHasValidSession(true);
      } else {
        console.log('[ResetPassword] No valid session found');
        setHasValidSession(false);
        Toast.show('Invalid or expired reset link. Please request a new one.', 'error');
        setTimeout(() => {
          router.replace('/forgot-password');
        }, 2000);
      }
    } catch (error: any) {
      console.error('[ResetPassword] Error checking session:', error);
      console.error('[ResetPassword] Error details:', JSON.stringify(error, null, 2));
      setHasValidSession(false);
      Toast.show('Error validating reset link. Please try again.', 'error');
      setTimeout(() => {
        router.replace('/forgot-password');
      }, 2000);
    } finally {
      setSessionChecked(true);
    }
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleResetPassword = async () => {
    console.log('[ResetPassword] User tapped Reset Password button');
    
    if (!newPassword || !confirmPassword) {
      Toast.show('Please fill in all fields', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!validatePassword(newPassword)) {
      Toast.show('Password must be at least 6 characters', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show('Passwords do not match', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      console.log('[ResetPassword] Updating password...');
      
      // Update user password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('[ResetPassword] Password update error:', error.message);
        console.error('[ResetPassword] Error details:', JSON.stringify(error, null, 2));
        throw new Error(error.message);
      }

      console.log('[ResetPassword] Password updated successfully');
      console.log('[ResetPassword] Updated user:', data.user?.email);
      Toast.show('Password updated successfully!', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to pantry after a short delay
      setTimeout(() => {
        console.log('[ResetPassword] Navigating to pantry');
        router.replace('/(tabs)/pantry');
      }, 1500);
    } catch (error: any) {
      console.error('[ResetPassword] Error resetting password:', error);
      Toast.show(error.message || 'Failed to reset password', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const passwordLengthMet = newPassword.length >= 6;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  if (!sessionChecked) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Verifying reset link...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasValidSession) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <IconSymbol 
              ios_icon_name="exclamationmark.triangle" 
              android_material_icon_name="warning" 
              size={64} 
              color={colors.error} 
            />
          </View>
          <Text style={styles.errorTitle}>
            Invalid Reset Link
          </Text>
          <Text style={styles.errorMessage}>
            This password reset link is invalid or has expired. Please request a new one from the login screen.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="lock.rotation" 
                android_material_icon_name="lock" 
                size={48} 
                color={colors.primary} 
              />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <IconSymbol 
                    ios_icon_name="lock.fill" 
                    android_material_icon_name="lock" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={(text) => {
                    console.log('[ResetPassword] New password input changed');
                    setNewPassword(text);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <IconSymbol 
                    ios_icon_name="lock.fill" 
                    android_material_icon_name="lock" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    console.log('[ResetPassword] Confirm password input changed');
                    setConfirmPassword(text);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.passwordRequirements}>
              <Text style={[styles.requirementText, passwordLengthMet && styles.requirementMet]}>
                {passwordLengthMet ? '✓' : '○'} At least 6 characters
              </Text>
              <Text style={[styles.requirementText, passwordsMatch && styles.requirementMet]}>
                {passwordsMatch ? '✓' : '○'} Passwords match
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <React.Fragment>
                  <Text style={styles.submitButtonText}>
                    Reset Password
                  </Text>
                  <IconSymbol 
                    ios_icon_name="checkmark" 
                    android_material_icon_name="check" 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </React.Fragment>
              )}
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <IconSymbol 
                ios_icon_name="info.circle" 
                android_material_icon_name="info" 
                size={20} 
                color={colors.textSecondary} 
              />
              <Text style={styles.infoText}>
                Choose a strong password that you haven&apos;t used before. After resetting, you&apos;ll be signed in automatically.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
