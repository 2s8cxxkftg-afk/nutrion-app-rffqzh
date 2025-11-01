
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
import { colors, commonStyles } from '@/styles/commonStyles';
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
          
          // Get the user session
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
            {!isLogin && (
              <Text style={styles.subtitle}>
                {t('auth.createAccount')}
              </Text>
            )}
          </View>

          {/* Biometric Login Button (only show on login screen if enabled) */}
          {isLogin && biometricAvailable && biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <IconSymbol
                name={biometricType.includes('Face') ? 'faceid' : 'touchid'}
                size={32}
                color={colors.primary}
              />
              <Text style={styles.biometricButtonText}>
                {t('auth.signInWith')} {biometricType}
              </Text>
            </TouchableOpacity>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <IconSymbol name="envelope.fill" size={20} color={colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('auth.emailAddress')}
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <IconSymbol name="lock.fill" size={20} color={colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
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

            {/* Confirm Password Input (Sign Up only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <IconSymbol name="lock.fill" size={20} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.confirmPassword')}
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
            )}

            {/* Forgot Password Link (Login only) */}
            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>
                  {t('auth.forgotPassword')}?
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
                    {isLogin ? t('auth.signIn') : t('auth.createAccount')}
                  </Text>
                  <IconSymbol name="arrow_forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Info Message about Google Sign-In */}
            <View style={styles.infoBox}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Google Sign-In is available in the production build. Use email authentication in Expo Go.
              </Text>
            </View>

            {/* Toggle Login/Signup */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
                <Text style={styles.toggleLink}>
                  {isLogin ? t('auth.signUp') : t('auth.signIn')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>{t('auth.skipForNow')}</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  biometricButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
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
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  toggleText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  toggleLink: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
