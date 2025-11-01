
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
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import {
  checkBiometricCapabilities,
  authenticateWithBiometrics,
  isBiometricEnabled,
  getBiometricCredentials,
  getBiometricTypeName,
} from '@/utils/biometricAuth';
import { useTranslation } from 'react-i18next';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const capabilities = await checkBiometricCapabilities();
    setBiometricAvailable(capabilities.isAvailable);
    
    if (capabilities.isAvailable) {
      const enabled = await isBiometricEnabled();
      setBiometricEnabled(enabled);
      setBiometricType(getBiometricTypeName(capabilities.supportedTypes));
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await authenticateWithBiometrics(
        `Sign in to Nutrion with ${biometricType}`
      );

      if (result.success) {
        const credentials = await getBiometricCredentials();
        
        if (credentials) {
          setLoading(true);
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session) {
            Toast.show({ type: 'success', message: t('auth.welcomeBack') });
            router.replace('/(tabs)/pantry');
          } else {
            Toast.show({ type: 'error', message: t('auth.biometricLoginFailed') });
            setBiometricEnabled(false);
          }
        } else {
          Toast.show({ type: 'error', message: t('auth.noCredentialsSaved') });
          setBiometricEnabled(false);
        }
      } else {
        Toast.show({ type: 'error', message: result.error || t('auth.biometricAuthFailed') });
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      Toast.show({ type: 'error', message: t('auth.biometricAuthError') });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', message: t('auth.fillAllFields') });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({ type: 'error', message: t('auth.invalidEmail') });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Toast.show({ type: 'error', message: t('auth.passwordsDoNotMatch') });
      return;
    }

    if (password.length < 6) {
      Toast.show({ type: 'error', message: t('auth.passwordTooShort') });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Sign in error:', error);
          Toast.show({ type: 'error', message: error.message || t('auth.signInFailed') });
          return;
        }

        console.log('Sign in successful:', data);
        Toast.show({ type: 'success', message: t('auth.welcomeBack') });
        router.replace('/(tabs)/pantry');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://natively.dev/email-confirmed',
          },
        });

        if (error) {
          console.error('Sign up error:', error);
          Toast.show({ type: 'error', message: error.message || t('auth.signUpFailed') });
          return;
        }

        console.log('Sign up successful:', data);
        
        if (data.user && !data.session) {
          Alert.alert(
            t('auth.verifyEmail'),
            t('auth.verifyEmailMessage'),
            [{ text: t('ok') }]
          );
          setIsLogin(true);
        } else {
          Toast.show({ type: 'success', message: t('auth.accountCreated') });
          router.replace('/(tabs)/pantry');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Toast.show({ type: 'error', message: t('auth.unexpectedError') });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/pantry');
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
            <Image
              source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Nutrion</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          {/* Biometric Login Button */}
          {isLogin && biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <IconSymbol
                name={biometricType.includes('Face') ? 'faceid' : 'touchid'}
                size={28}
                color={colors.primary}
              />
              <Text style={styles.biometricButtonText}>
                Sign in with {biometricType}
              </Text>
            </TouchableOpacity>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <IconSymbol name="envelope.fill" size={20} color={colors.textSecondary} />
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
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <IconSymbol name="lock.fill" size={20} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={isLogin ? 'password' : 'new-password'}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <IconSymbol
                    name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input (Sign Up only) */}
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <IconSymbol name="lock.fill" size={20} color={colors.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <IconSymbol
                      name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Forgot Password Link (Login only) */}
            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                  <IconSymbol name="arrow.right" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Toggle Login/Signup */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
                <Text style={styles.toggleLink}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
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
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.huge,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.displayMedium,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  biometricButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: `0px 4px 12px ${colors.primary}20`,
    elevation: 3,
  },
  biometricButtonText: {
    ...typography.h4,
    color: colors.primary,
  },
  form: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  inputIconContainer: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    gap: spacing.md,
    boxShadow: `0px 8px 24px ${colors.primary}40`,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  toggleText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  toggleLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
