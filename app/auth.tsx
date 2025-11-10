
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
import { useTranslation } from 'react-i18next';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', message: t('auth.fillAllFields') || 'Please fill all fields' });
      return;
    }

    if (!isLogin && (!firstName.trim() || !lastName.trim())) {
      Toast.show({ type: 'error', message: t('auth.fillAllFields') || 'Please fill all fields' });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({ type: 'error', message: t('auth.invalidEmail') || 'Invalid email address' });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Toast.show({ type: 'error', message: t('auth.passwordsDoNotMatch') || 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      Toast.show({ type: 'error', message: t('auth.passwordTooShort') || 'Password must be at least 6 characters' });
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
          Toast.show({ type: 'error', message: error.message || t('auth.signInFailed') || 'Sign in failed' });
          return;
        }

        console.log('Sign in successful:', data);
        Toast.show({ type: 'success', message: 'Welcome!' });
        router.replace('/subscription-intro');
      } else {
        // Sign up with OTP verification
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://natively.dev/email-confirmed',
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              full_name: `${firstName.trim()} ${lastName.trim()}`,
            },
          },
        });

        if (error) {
          console.error('Sign up error:', error);
          Toast.show({ type: 'error', message: error.message || t('auth.signUpFailed') || 'Sign up failed' });
          return;
        }

        console.log('Sign up successful:', data);

        // Create profile entry with first and last name
        if (data.user) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: data.user.id,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                full_name: `${firstName.trim()} ${lastName.trim()}`,
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
            } else {
              console.log('Profile created successfully');
            }
          } catch (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required - navigate to OTP verification
          Toast.show({ 
            type: 'success', 
            message: t('auth.verificationCodeSent') || 'Verification code sent to your email!' 
          });
          router.push({
            pathname: '/confirm-email',
            params: { email }
          });
        } else {
          // Auto-confirmed, proceed to subscription intro
          Toast.show({ type: 'success', message: t('auth.accountCreated') || 'Account created successfully!' });
          router.replace('/subscription-intro');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Toast.show({ type: 'error', message: t('auth.unexpectedError') || 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
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
              {isLogin ? 'Welcome!' : 'Create your account'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name Input (Sign Up only) */}
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>{t('auth.firstName') || 'First Name'}</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <IconSymbol name="person.fill" size={20} color={colors.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.firstNamePlaceholder') || 'Enter your first name'}
                    placeholderTextColor={colors.textSecondary}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    autoComplete="name-given"
                    editable={!loading}
                  />
                </View>
              </View>
            )}

            {/* Last Name Input (Sign Up only) */}
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>{t('auth.lastName') || 'Last Name'}</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <IconSymbol name="person.fill" size={20} color={colors.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.lastNamePlaceholder') || 'Enter your last name'}
                    placeholderTextColor={colors.textSecondary}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    autoComplete="name-family"
                    editable={!loading}
                  />
                </View>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{t('auth.emailAddress') || 'Email Address'}</Text>
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
              <Text style={styles.inputLabel}>{t('auth.password') || 'Password'}</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <IconSymbol name="lock.fill" size={20} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.password') || 'Enter your password'}
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
                <Text style={styles.inputLabel}>{t('auth.confirmPassword') || 'Confirm Password'}</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <IconSymbol name="lock.fill" size={20} color={colors.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.confirmPasswordPlaceholder') || 'Confirm your password'}
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
                  {t('auth.forgotPassword') || 'Forgot your password?'}
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
                    {isLogin ? (t('auth.signIn') || 'Sign In') : (t('auth.signUp') || 'Create Account')}
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
                  {isLogin ? (t('auth.signUp') || 'Sign Up') : (t('auth.signIn') || 'Sign In')}
                </Text>
              </TouchableOpacity>
            </View>
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
    marginTop: spacing.lg,
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
});
