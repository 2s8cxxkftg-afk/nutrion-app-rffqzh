
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

interface PasswordRequirement {
  label: string;
  met: boolean;
  key: string;
}

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

  // Password validation requirements
  const getPasswordRequirements = (pwd: string): PasswordRequirement[] => {
    return [
      {
        key: 'length',
        label: t('auth.passwordMinLength') || 'At least 8 characters',
        met: pwd.length >= 8,
      },
      {
        key: 'uppercase',
        label: t('auth.passwordUppercase') || 'One uppercase letter (A-Z)',
        met: /[A-Z]/.test(pwd),
      },
      {
        key: 'lowercase',
        label: t('auth.passwordLowercase') || 'One lowercase letter (a-z)',
        met: /[a-z]/.test(pwd),
      },
      {
        key: 'number',
        label: t('auth.passwordNumber') || 'One number (0-9)',
        met: /[0-9]/.test(pwd),
      },
      {
        key: 'special',
        label: t('auth.passwordSpecial') || 'One special character (!@#$%^&*)',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      },
    ];
  };

  const passwordRequirements = getPasswordRequirements(password);
  const allRequirementsMet = !isLogin && passwordRequirements.every(req => req.met);

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

    // Enhanced password validation for sign up
    if (!isLogin) {
      if (!allRequirementsMet) {
        Toast.show({ 
          type: 'error', 
          message: t('auth.passwordRequirementsNotMet') || 'Please meet all password requirements' 
        });
        return;
      }
    } else {
      // Minimum length check for login
      if (password.length < 6) {
        Toast.show({ 
          type: 'error', 
          message: t('auth.passwordTooShort') || 'Password must be at least 6 characters' 
        });
        return;
      }
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
          
          // Provide specific error messages
          let errorMessage = error.message;
          
          if (error.message.includes('Invalid login credentials') || 
              error.message.includes('invalid') || 
              error.message.includes('credentials')) {
            errorMessage = t('auth.invalidCredentials') || 'Invalid email or password. Please check your credentials and try again.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = t('auth.emailNotConfirmed') || 'Please verify your email address before signing in.';
          } else if (error.message.includes('rate limit')) {
            errorMessage = t('auth.rateLimitExceeded') || 'Too many attempts. Please wait a few minutes and try again.';
          }
          
          Toast.show({ type: 'error', message: errorMessage });
          return;
        }

        console.log('Sign in successful:', data);
        Toast.show({ type: 'success', message: t('auth.welcomeBack') || 'Welcome back!' });
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
          
          // Provide specific error messages for sign up
          let errorMessage = error.message;
          
          if (error.message.includes('rate limit') || error.message.includes('email rate limit exceeded')) {
            errorMessage = t('auth.emailRateLimitExceeded') || 
              'Email rate limit exceeded. Please wait a few minutes before trying again. This helps us prevent spam and protect your account.';
          } else if (error.message.includes('User already registered')) {
            errorMessage = t('auth.userAlreadyExists') || 'An account with this email already exists. Please sign in instead.';
          } else if (error.message.includes('Password')) {
            errorMessage = t('auth.passwordRequirementsNotMet') || 'Password does not meet security requirements.';
          }
          
          Toast.show({ type: 'error', message: errorMessage });
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
                    <IconSymbol 
                      ios_icon_name="person.fill" 
                      android_material_icon_name="person"
                      size={20} 
                      color={colors.textSecondary} 
                    />
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
                    <IconSymbol 
                      ios_icon_name="person.fill" 
                      android_material_icon_name="person"
                      size={20} 
                      color={colors.textSecondary} 
                    />
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
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{t('auth.password') || 'Password'}</Text>
              <View style={styles.inputContainer}>
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
                    ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    android_material_icon_name={showPassword ? 'visibility_off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements (Sign Up only) */}
            {!isLogin && password.length > 0 && (
              <View style={styles.passwordRequirementsContainer}>
                <Text style={styles.passwordRequirementsTitle}>
                  {t('auth.passwordRequirements') || 'Password Requirements:'}
                </Text>
                {passwordRequirements.map((req) => (
                  <View key={req.key} style={styles.requirementRow}>
                    <IconSymbol
                      ios_icon_name={req.met ? 'checkmark.circle.fill' : 'circle'}
                      android_material_icon_name={req.met ? 'check_circle' : 'radio_button_unchecked'}
                      size={16}
                      color={req.met ? '#4CAF50' : colors.textSecondary}
                    />
                    <Text style={[
                      styles.requirementText,
                      req.met && styles.requirementTextMet
                    ]}>
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Confirm Password Input (Sign Up only) */}
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>{t('auth.confirmPassword') || 'Confirm Password'}</Text>
                <View style={styles.inputContainer}>
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
                      ios_icon_name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                      android_material_icon_name={showConfirmPassword ? 'visibility_off' : 'visibility'}
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
                <React.Fragment>
                  <Text style={styles.submitButtonText}>
                    {isLogin ? (t('auth.signIn') || 'Sign In') : (t('auth.signUp') || 'Create Account')}
                  </Text>
                  <IconSymbol 
                    ios_icon_name="arrow.right" 
                    android_material_icon_name="arrow_forward"
                    size={20} 
                    color="#FFFFFF" 
                  />
                </React.Fragment>
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
  passwordRequirementsContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordRequirementsTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  requirementText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  requirementTextMet: {
    color: '#4CAF50',
    fontWeight: '500',
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
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0px 8px 24px ${colors.primary}40`,
      },
    }),
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
