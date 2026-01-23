
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        message: t('auth.enterEmail') || 'Please enter your email',
        type: 'error',
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        message: t('auth.invalidEmail') || 'Please enter a valid email',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any = null;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1}/${maxRetries}: Sending password reset email to:`, email);
        
        // Set a timeout for the request (30 seconds)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
        });
        
        const resetPromise = supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://natively.dev/email-confirmed',
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
        setEmailSent(true);
        Toast.show({
          message: t('auth.resetPasswordEmailSent') || 'Password reset email sent!',
          type: 'success',
        });
        
        Alert.alert(
          t('auth.checkEmail') || 'Check Your Email',
          t('auth.resetPasswordEmailSent') || 'We have sent you a password reset link. Please check your email.',
          [
            {
              text: t('ok') || 'OK',
              onPress: () => router.back(),
            },
          ]
        );
        
        setLoading(false);
        return;
        
      } catch (error: any) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        lastError = error;
        
        // If it's a timeout and we have retries left, continue
        if ((error.message?.includes('timeout') || error.message?.includes('Timeout')) && retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`Retrying in ${retryCount * 2} seconds...`);
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
    
    Toast.show({
      message: errorMessage,
      type: 'error',
    });
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="lock.fill" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('auth.forgotPassword') || 'Forgot Password'}</Text>
            <Text style={styles.subtitle}>
              {t('auth.forgotPasswordDesc') || 'Enter your email to receive a password reset link'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <IconSymbol name="envelope.fill" size={20} color={colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('auth.emailAddress') || 'Email Address'}
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading && !emailSent}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, (loading || emailSent) && styles.submitButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading || emailSent}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {t('auth.sendResetLink') || 'Send Reset Link'}
                  </Text>
                  <IconSymbol name="arrow_forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <IconSymbol name="info.circle" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {t('auth.resetPasswordInfo') || 'You will receive an email with instructions to reset your password'}
              </Text>
            </View>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.backToLoginText}>
                {t('auth.backToLogin') || 'Back to Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
    boxShadow: '0px 8px 24px rgba(46, 139, 87, 0.3)',
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
});
