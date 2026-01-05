
import React, { useState, useRef, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && text) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerifyCode(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (verificationCode?: string) => {
    const fullCode = verificationCode || code.join('');
    
    if (fullCode.length !== 6) {
      Toast.show({ 
        type: 'error', 
        message: t('confirmEmail.enterAllDigits') || 'Please enter all 6 digits' 
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Verifying OTP code:', fullCode);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: fullCode,
        type: 'email',
      });

      if (error) {
        console.error('OTP verification error:', error);
        Toast.show({ 
          type: 'error', 
          message: error.message || t('confirmEmail.invalidCode') || 'Invalid verification code' 
        });
        // Clear the code inputs
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      console.log('OTP verification successful:', data);
      Toast.show({ 
        type: 'success', 
        message: t('confirmEmail.emailVerified') || 'Email verified successfully!' 
      });
      
      // Navigate to subscription intro
      router.replace('/subscription-intro');
    } catch (error: any) {
      console.error('Verification error:', error);
      Toast.show({ 
        type: 'error', 
        message: t('auth.unexpectedError') || 'An unexpected error occurred' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Toast.show({ 
        type: 'error', 
        message: t('confirmEmail.emailRequired') || 'Email is required' 
      });
      return;
    }

    setResending(true);

    try {
      console.log('Resending OTP to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email as string,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        console.error('Resend OTP error:', error);
        Toast.show({ 
          type: 'error', 
          message: error.message || t('confirmEmail.resendFailed') || 'Failed to resend code' 
        });
        return;
      }

      console.log('OTP resent successfully');
      Toast.show({ 
        type: 'success', 
        message: t('confirmEmail.codeSent') || 'Verification code sent!' 
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      Toast.show({ 
        type: 'error', 
        message: t('auth.unexpectedError') || 'An unexpected error occurred' 
      });
    } finally {
      setResending(false);
    }
  };

  const handleBackToSignIn = () => {
    router.replace('/auth');
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
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol 
                ios_icon_name="envelope.fill" 
                android_material_icon_name="email"
                size={60} 
                color={colors.primary} 
              />
            </View>
            <Text style={styles.title}>
              {t('confirmEmail.title') || 'Verify Your Email'}
            </Text>
            <Text style={styles.subtitle}>
              {t('confirmEmail.subtitle') || 'We sent a 6-digit code to'}
            </Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.description}>
              {t('confirmEmail.description') || 'Enter the code below to verify your email address'}
            </Text>
          </View>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={() => handleVerifyCode()}
            disabled={loading || code.join('').length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.verifyButtonText}>
                  {t('confirmEmail.verify') || 'Verify Email'}
                </Text>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle"
                  size={20} 
                  color="#FFFFFF" 
                />
              </>
            )}
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              {t('confirmEmail.didntReceive') || "Didn't receive the code?"}
            </Text>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={resending}
            >
              <Text style={[styles.resendLink, resending && styles.resendLinkDisabled]}>
                {resending 
                  ? (t('confirmEmail.sending') || 'Sending...') 
                  : (t('confirmEmail.resend') || 'Resend Code')
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Sign In */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSignIn}
            disabled={loading}
          >
            <IconSymbol 
              ios_icon_name="arrow.left" 
              android_material_icon_name="arrow_back"
              size={16} 
              color={colors.textSecondary} 
            />
            <Text style={styles.backButtonText}>
              {t('auth.backToLogin') || 'Back to Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info"
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.infoText}>
              {t('confirmEmail.info') || 'The verification code expires in 24 hours. Make sure to check your spam folder if you don\'t see the email.'}
            </Text>
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
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.huge,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.displayMedium,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxxl,
    gap: spacing.md,
  },
  codeInput: {
    flex: 1,
    height: 64,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...typography.displayMedium,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    gap: spacing.md,
    boxShadow: `0px 8px 24px ${colors.primary}40`,
    elevation: 6,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  resendText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
});
