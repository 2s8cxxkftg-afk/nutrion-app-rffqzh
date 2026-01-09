
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/utils/supabase';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from '@/components/Toast';
import { IconSymbol } from '@/components/IconSymbol';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  codeInputFocused: {
    borderColor: colors.primary,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  resendButton: {
    marginLeft: spacing.xs,
  },
  resendButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  backButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});

export default function ConfirmEmailScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleCodeChange(text: string, index: number) {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerifyCode() {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      Toast.show('Please enter the complete code', 'error');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: verificationCode,
        type: 'email',
      });

      if (error) {
        console.error('Verification error:', error);
        Toast.show('Invalid verification code', 'error');
        return;
      }

      Toast.show('Email verified successfully!', 'success');
      router.replace('/email-confirmed');
    } catch (error) {
      console.error('Error verifying code:', error);
      Toast.show('Failed to verify code', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email as string,
      });

      if (error) {
        console.error('Resend error:', error);
        Toast.show('Failed to resend code', 'error');
        return;
      }

      Toast.show('Verification code sent!', 'success');
    } catch (error) {
      console.error('Error resending code:', error);
      Toast.show('Failed to resend code', 'error');
    }
  }

  function handleBackToSignIn() {
    router.back();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ position: 'absolute', top: spacing.md, left: spacing.md }}
          >
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="arrow-back"
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>

          <View style={styles.header}>
            <IconSymbol
              ios_icon_name="envelope.badge.fill"
              android_material_icon_name="email"
              size={64}
              color={colors.primary}
            />
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We&apos;ve sent a 6-digit code to{'\n'}
              <Text style={{ fontWeight: '600' }}>{email}</Text>
            </Text>
          </View>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFocused,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (loading || code.join('').length !== 6) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerifyCode}
            disabled={loading || code.join('').length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
            >
              <Text style={styles.resendButtonText}>Resend</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSignIn}
          >
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
