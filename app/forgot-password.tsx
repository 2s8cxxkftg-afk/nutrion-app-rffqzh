
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
  successBox: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '30',
  },
  successText: {
    color: colors.primary,
  },
  setupInstructionsBox: {
    backgroundColor: '#FFE5E5',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  setupTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    color: '#D32F2F',
    marginBottom: spacing.sm,
  },
  setupStep: {
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
    color: '#C62828',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  setupStepBold: {
    fontFamily: typography.fontFamily.bold,
    color: '#B71C1C',
  },
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    console.log('[ForgotPassword] User tapped Send Reset Link button');
    console.log('[ForgotPassword] Email:', email);
    console.log('[ForgotPassword] Platform:', Platform.OS);
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('[ForgotPassword] Supabase is not configured');
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      console.log('[ForgotPassword] Sending password reset email to:', email);
      
      // Generate the correct redirect URL based on platform
      // Use lowercase scheme to match app.json
      let redirectUrl = '';
      
      if (Platform.OS === 'web') {
        // For web, use the current origin + /reset-password
        if (typeof window !== 'undefined') {
          redirectUrl = `${window.location.origin}/reset-password`;
        } else {
          redirectUrl = 'http://localhost:8081/reset-password';
        }
      } else {
        // For native (iOS/Android), use the deep link scheme from app.json
        // The scheme in app.json is "nutrion" (lowercase)
        redirectUrl = 'nutrion://reset-password';
      }
      
      console.log('[ForgotPassword] Redirect URL:', redirectUrl);
      console.log('[ForgotPassword] Calling supabase.auth.resetPasswordForEmail...');
      
      // Send password reset email with deep link redirect
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: redirectUrl
        }
      );

      console.log('[ForgotPassword] Response data:', data);
      console.log('[ForgotPassword] Response error:', error);

      if (error) {
        console.error('[ForgotPassword] Password reset error:', error.message);
        console.error('[ForgotPassword] Error code:', error.status);
        console.error('[ForgotPassword] Error details:', JSON.stringify(error, null, 2));
        
        // Specific error handling
        if (error.message.includes('rate limit')) {
          Toast.show('Too many password reset attempts. Please wait 10 minutes and try again.', 'error');
        } else if (error.message.includes('Error sending recovery email')) {
          // This is the main error - SMTP/Email configuration issue
          console.error('[ForgotPassword] ❌ SMTP/Email configuration error detected');
          Toast.show('Email service not configured. Please check Supabase SMTP settings.', 'error');
          setShowSetupInstructions(true);
        } else if (error.message.includes('redirect URL') || error.message.includes('redirect_to')) {
          Toast.show('Configuration error: Redirect URLs not whitelisted in Supabase dashboard.', 'error');
          setShowSetupInstructions(true);
        } else if (error.message.includes('User not found')) {
          // For security, show success message even if user doesn't exist
          setEmailSent(true);
          Toast.show('If an account with that email exists, a password reset link has been sent.', 'success');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return;
        } else {
          Toast.show(error.message, 'error');
          setShowSetupInstructions(true);
        }
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      
      // Success! Email sent
      console.log('[ForgotPassword] ✅ Password reset email sent successfully');
      setEmailSent(true);
      Toast.show('Password reset email sent! Check your inbox and spam folder.', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 3000);
      
    } catch (error: any) {
      console.error('[ForgotPassword] Unexpected error:', error);
      console.error('[ForgotPassword] Error message:', error?.message);
      console.error('[ForgotPassword] Error stack:', error?.stack);
      
      Toast.show('An unexpected error occurred. Please try again.', 'error');
      setShowSetupInstructions(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
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
            onPress={() => {
              console.log('[ForgotPassword] User tapped back button');
              router.back();
            }}
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

            {/* Setup Instructions (shown on configuration errors) */}
            {showSetupInstructions && (
              <View style={styles.setupInstructionsBox}>
                <Text style={styles.setupTitle}>
                  🚨 Email Service Configuration Required
                </Text>
                <Text style={styles.setupStep}>
                  The password reset email cannot be sent because the email service is not configured in Supabase.
                </Text>
                <Text style={[styles.setupStep, { marginTop: spacing.sm }]}>
                  <Text style={styles.setupStepBold}>To fix this, you need to:</Text>
                </Text>
                <Text style={styles.setupStep}>
                  1. Go to your Supabase Dashboard
                </Text>
                <Text style={styles.setupStep}>
                  2. Navigate to: <Text style={styles.setupStepBold}>Authentication → Email Templates</Text>
                </Text>
                <Text style={styles.setupStep}>
                  3. Enable the <Text style={styles.setupStepBold}>&quot;Reset Password&quot;</Text> template
                </Text>
                <Text style={styles.setupStep}>
                  4. Go to: <Text style={styles.setupStepBold}>Project Settings → Auth → SMTP Settings</Text>
                </Text>
                <Text style={styles.setupStep}>
                  5. Configure SMTP (or use Supabase&apos;s default email service)
                </Text>
                <Text style={[styles.setupStep, { marginTop: spacing.sm }]}>
                  <Text style={styles.setupStepBold}>Also add these Redirect URLs:</Text>
                </Text>
                <Text style={styles.setupStep}>
                  Go to: <Text style={styles.setupStepBold}>Authentication → URL Configuration</Text>
                </Text>
                <Text style={[styles.setupStep, { marginLeft: spacing.md }]}>
                  • nutrion://reset-password
                </Text>
                <Text style={[styles.setupStep, { marginLeft: spacing.md }]}>
                  • exp://localhost:8081/--/reset-password
                </Text>
                <Text style={[styles.setupStep, { marginLeft: spacing.md }]}>
                  • http://localhost:8081/reset-password
                </Text>
                <Text style={[styles.setupStep, { marginLeft: spacing.md }]}>
                  • Your production URL/reset-password
                </Text>
                <Text style={[styles.setupStep, { marginTop: spacing.sm, color: '#D32F2F' }]}>
                  ⚠️ Without SMTP configuration, password reset emails cannot be sent.
                </Text>
                <Text style={[styles.setupStep, { marginTop: spacing.sm, color: '#1976D2' }]}>
                  📖 See SUPABASE_EMAIL_SETUP_GUIDE.md for detailed instructions
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
                onChangeText={(text) => {
                  console.log('[ForgotPassword] Email input changed');
                  setEmail(text);
                }}
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
              onPress={() => {
                console.log('[ForgotPassword] User tapped Back to Login');
                router.back();
              }}
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
