
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
  debugButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  debugButtonText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  debugBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  debugText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  successBox: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '30',
  },
  successText: {
    color: colors.primary,
  },
  testButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testButtonText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginRight: spacing.sm,
  },
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const testSupabaseConnection = async () => {
    console.log('Testing Supabase connection...');
    setTestingConnection(true);
    
    try {
      // Test basic Supabase connectivity
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        Toast.show('Supabase connection failed: ' + error.message, 'error');
      } else {
        console.log('Supabase connection successful');
        Toast.show('Supabase connection successful! ✓', 'success');
      }
    } catch (error: any) {
      console.error('Supabase connection test error:', error);
      Toast.show('Connection test failed: ' + (error?.message || 'Unknown error'), 'error');
    } finally {
      setTestingConnection(false);
    }
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
      
      // Build redirect URLs for all platforms
      // Note: app.json has scheme "Nutrion" (capital N)
      const appScheme = 'Nutrion';
      
      // For production/native apps
      const nativeRedirectUrl = `${appScheme}://reset-password`;
      
      // For development (Expo Go)
      const expoRedirectUrl = Linking.createURL('reset-password');
      
      // For web
      const webRedirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/reset-password`
        : 'http://localhost:8081/reset-password';
      
      // Use the appropriate redirect URL based on platform
      const redirectUrl = Platform.OS === 'web' ? webRedirectUrl : expoRedirectUrl;
      
      console.log('Platform:', Platform.OS);
      console.log('Redirect URL:', redirectUrl);
      console.log('Native URL:', nativeRedirectUrl);
      console.log('Expo URL:', expoRedirectUrl);
      console.log('Web URL:', webRedirectUrl);
      
      // Send password reset email
      console.log('Calling supabase.auth.resetPasswordForEmail...');
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      console.log('Password reset response received');
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('Response error:', JSON.stringify(error, null, 2));
      
      if (error) {
        console.error('Password reset error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        
        // Handle specific error types
        if (error.status === 429 || error.message?.includes('rate limit')) {
          throw new Error('Too many password reset attempts. Please wait 10 minutes and try again, or configure custom SMTP in Supabase.');
        } else if (error.message?.includes('Email rate limit exceeded')) {
          throw new Error('Email rate limit exceeded. Please wait 10 minutes or configure custom SMTP in Supabase dashboard.');
        } else if (error.message?.includes('Invalid redirect URL') || error.message?.includes('redirect_to')) {
          throw new Error('Redirect URL not whitelisted. Please add redirect URLs in Supabase dashboard (see Setup Instructions below).');
        } else if (error.message?.includes('SMTP')) {
          throw new Error('Email configuration error. Please configure SMTP settings in Supabase dashboard.');
        } else if (error.message?.includes('Email not enabled')) {
          throw new Error('Email authentication not enabled. Please enable email auth in Supabase dashboard.');
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error('Failed to send reset email. Please check Supabase configuration (tap "Show Setup Instructions" below).');
        }
      }
      
      // Success! Supabase always returns success even if email doesn't exist (for security)
      console.log('Password reset email sent successfully');
      setEmailSent(true);
      Toast.show('Password reset email sent! Check your inbox and spam folder.', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 3000);
      
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Extract a meaningful error message
      let errorMessage = 'Failed to send reset email. Please try again later.';
      let shouldShowSetup = false;
      
      if (error?.message) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = 'Connection timeout. Please check your internet connection and try again.';
        } else if (error.message.includes('Too many requests') || error.message.includes('rate limit')) {
          errorMessage = 'Too many password reset attempts. Please wait 10 minutes and try again, or configure custom SMTP in Supabase.';
          shouldShowSetup = true;
        } else if (error.message.includes('redirect URL') || error.message.includes('redirect_to')) {
          errorMessage = 'Configuration error: Redirect URLs not whitelisted. Please see setup instructions below.';
          shouldShowSetup = true;
        } else if (error.message.includes('SMTP') || error.message.includes('Email not enabled')) {
          errorMessage = 'Email configuration error. Please see setup instructions below.';
          shouldShowSetup = true;
        } else if (error.message.includes('User not found')) {
          // For security, don't reveal if email exists or not
          errorMessage = 'If this email is registered, you will receive a password reset link.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address first before resetting your password.';
        } else {
          errorMessage = error.message;
          // Show setup for any configuration-related errors
          if (error.message.includes('configuration') || error.message.includes('not enabled') || error.message.includes('not configured')) {
            shouldShowSetup = true;
          }
        }
      } else if (error?.status === 504) {
        errorMessage = 'Server timeout. Please try again in a few moments.';
      } else if (error?.status === 429) {
        errorMessage = 'Too many requests. Please wait 10 minutes and try again.';
        shouldShowSetup = true;
      } else if (error?.name === 'AuthRetryableFetchError') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Toast.show(errorMessage, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Automatically show setup instructions for configuration errors
      if (shouldShowSetup && !showDebugInfo) {
        setTimeout(() => {
          setShowDebugInfo(true);
        }, 1000);
      }
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
                You will receive an email with instructions to reset your password. Please check your spam folder if you don&apos;t see it. The email may take a few minutes to arrive.
              </Text>
            </View>

            {/* Success Message */}
            {emailSent && (
              <View style={[styles.infoBox, styles.successBox]}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle" 
                  android_material_icon_name="check-circle" 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={[styles.infoText, styles.successText]}>
                  Email sent successfully! Click the link in your email to reset your password. The link will expire in 1 hour.
                  {'\n\n'}
                  📧 Check your inbox and spam folder
                  {'\n'}⏱️ Email may take 1-2 minutes to arrive
                  {'\n'}🔗 Click the link to reset your password
                </Text>
              </View>
            )}

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

            {/* Debug Info Toggle (for troubleshooting) */}
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                setShowDebugInfo(!showDebugInfo);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.debugButtonText}>
                {showDebugInfo ? 'Hide' : 'Show'} Setup Instructions
              </Text>
            </TouchableOpacity>

            {/* Debug Info */}
            {showDebugInfo && (
              <View style={styles.debugBox}>
                <Text style={[styles.debugText, { fontFamily: typography.fontFamily.semibold, marginBottom: spacing.sm, fontSize: 14 }]}>
                  📧 Supabase Email Configuration Checklist:
                </Text>
                <Text style={styles.debugText}>
                  {'\n'}✓ Step 1: Enable Email Template
                  {'\n'}   Go to: Supabase Dashboard → Authentication → Email Templates
                  {'\n'}   Enable: &quot;Reset Password&quot; template
                  {'\n'}   Verify: Template is active and not disabled
                  {'\n'}
                  {'\n'}✓ Step 2: Configure Redirect URLs
                  {'\n'}   Go to: Authentication → URL Configuration
                  {'\n'}   Add ALL these URLs to &quot;Redirect URLs&quot; list:
                  {'\n'}   • Nutrion://reset-password
                  {'\n'}   • exp://localhost:8081/--/reset-password
                  {'\n'}   • http://localhost:8081/reset-password
                  {'\n'}   • https://yourdomain.com/reset-password
                  {'\n'}
                  {'\n'}✓ Step 3: Configure SMTP (CRITICAL for production)
                  {'\n'}   Go to: Authentication → Settings → SMTP Settings
                  {'\n'}   Issue: Default Supabase emails are rate-limited (4/hour)
                  {'\n'}   Solution: Add custom SMTP provider:
                  {'\n'}   • Gmail SMTP (smtp.gmail.com:587)
                  {'\n'}   • SendGrid (smtp.sendgrid.net:587)
                  {'\n'}   • AWS SES, Mailgun, etc.
                  {'\n'}
                  {'\n'}✓ Step 4: Test Email Delivery
                  {'\n'}   • Enter your email above and tap &quot;Send Reset Link&quot;
                  {'\n'}   • Check inbox AND spam folder
                  {'\n'}   • Email should arrive within 1-2 minutes
                  {'\n'}   • If no email: Check SMTP settings and Supabase logs
                  {'\n'}
                  {'\n'}🔍 Current Configuration:
                  {'\n'}   Platform: {Platform.OS}
                  {'\n'}   Supabase URL: {process.env.EXPO_PUBLIC_SUPABASE_URL || 'Not configured'}
                  {'\n'}   Configured: {isConfigured ? 'Yes ✓' : 'No ✗'}
                  {'\n'}
                  {'\n'}⚠️ Common Issues:
                  {'\n'}   • No email received: Check SMTP settings or use custom SMTP
                  {'\n'}   • Rate limit error: Wait 5-10 minutes or configure custom SMTP
                  {'\n'}   • Invalid link: Verify redirect URLs are whitelisted
                  {'\n'}   • Link expired: Links expire after 1 hour, request new one
                </Text>

                {/* Test Connection Button */}
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={testSupabaseConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <React.Fragment>
                      <Text style={styles.testButtonText}>
                        Test Supabase Connection
                      </Text>
                      <IconSymbol 
                        ios_icon_name="network" 
                        android_material_icon_name="wifi" 
                        size={16} 
                        color={colors.text} 
                      />
                    </React.Fragment>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
