
import React, { useState } from 'react';
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
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
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
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  backToLoginText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary,
  },
  retryText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: '#856404',
    lineHeight: 20,
    marginLeft: spacing.sm,
  },
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    console.log('User tapped Send Reset Link button');
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('Supabase is not configured');
      Toast.show('Supabase is not configured. Please check your environment variables.', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    if (!email) {
      Toast.show('Please enter your email', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!validateEmail(email)) {
      Toast.show('Please enter a valid email', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setRetryAttempt(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      console.log('Sending password reset email to:', email);
      
      // Use the app's deep link scheme for password reset
      const redirectUrl = Linking.createURL('reset-password');
      console.log('Redirect URL:', redirectUrl);
      
      // Increase timeout to 30 seconds (more reasonable for email sending)
      const timeoutDuration = 30000;
      console.log(`Setting timeout to ${timeoutDuration / 1000} seconds`);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log(`Request timeout after ${timeoutDuration / 1000} seconds`);
          reject(new Error(`Request timeout after ${timeoutDuration / 1000} seconds`));
        }, timeoutDuration);
      });
      
      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      console.log('Waiting for password reset response...');
      
      // Race between the actual request and timeout
      const result = await Promise.race([resetPromise, timeoutPromise]) as any;
      
      console.log('Password reset response received');
      console.log('Response data:', JSON.stringify(result?.data, null, 2));
      console.log('Response error:', JSON.stringify(result?.error, null, 2));
      
      if (result.error) {
        console.error('Password reset error:', result.error);
        console.error('Error status:', result.error.status);
        console.error('Error message:', result.error.message);
        console.error('Error name:', result.error.name);
        
        // Handle specific error types
        if (result.error.status === 429) {
          throw new Error('Too many requests. Please wait a few minutes and try again.');
        } else if (result.error.message) {
          throw new Error(result.error.message);
        } else {
          throw new Error('Failed to send reset email. Please try again.');
        }
      }
      
      // Success!
      console.log('Password reset email sent successfully');
      setEmailSent(true);
      Toast.show('Password reset email sent! Check your inbox.', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Extract a meaningful error message
      let errorMessage = 'Failed to send reset email. Please try again later.';
      
      if (error?.message) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = 'Connection timeout. Please check your internet connection and try again.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please wait a few minutes and try again.';
        } else if (error.message.includes('User not found')) {
          // For security, don't reveal if email exists or not
          errorMessage = 'If this email is registered, you will receive a password reset link.';
        } else {
          errorMessage = error.message;
        }
      } else if (error?.status === 504) {
        errorMessage = 'Server timeout. Please try again in a few moments.';
      } else if (error?.status === 429) {
        errorMessage = 'Too many requests. Please wait a few minutes and try again.';
      } else if (error?.name === 'AuthRetryableFetchError') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Toast.show(errorMessage, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setRetryAttempt(0);
    }
  };

  const isConfigured = isSupabaseConfigured();

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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="arrow-back" 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="lock.fill" 
                android_material_icon_name="lock" 
                size={48} 
                color={colors.primary} 
              />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we&apos;ll send you a link to reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Warning if Supabase not configured */}
            {!isConfigured && (
              <View style={styles.warningBox}>
                <IconSymbol 
                  ios_icon_name="exclamationmark.triangle" 
                  android_material_icon_name="warning" 
                  size={20} 
                  color="#856404" 
                />
                <Text style={styles.warningText}>
                  Supabase is not configured. Please set up your Supabase credentials in the environment variables.
                </Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <IconSymbol 
                  ios_icon_name="envelope.fill" 
                  android_material_icon_name="email" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading && !emailSent && isConfigured}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, (loading || emailSent || !isConfigured) && styles.submitButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading || emailSent || !isConfigured}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <React.Fragment>
                  <Text style={styles.submitButtonText}>
                    {emailSent ? 'Email Sent!' : 'Send Reset Link'}
                  </Text>
                  <IconSymbol 
                    ios_icon_name="arrow.right" 
                    android_material_icon_name="arrow-forward" 
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
                You will receive an email with instructions to reset your password. Please check your spam folder if you don&apos;t see it.
              </Text>
            </View>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.backToLoginText}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
