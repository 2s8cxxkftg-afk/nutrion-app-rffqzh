
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/utils/supabase';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from '@/components/Toast';
import { useRouter } from 'expo-router';
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
  Image,
} from 'react-native';

interface PasswordRequirement {
  label: string;
  met: boolean;
  key: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.sm,
    padding: spacing.xs,
  },
  requirementsContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  requirementMet: {
    color: colors.success,
  },
  requirementNotMet: {
    color: colors.textSecondary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordRequirements = (pwd: string): PasswordRequirement[] => {
    return [
      {
        key: 'length',
        label: 'At least 8 characters',
        met: pwd.length >= 8,
      },
      {
        key: 'uppercase',
        label: 'One uppercase letter',
        met: /[A-Z]/.test(pwd),
      },
      {
        key: 'lowercase',
        label: 'One lowercase letter',
        met: /[a-z]/.test(pwd),
      },
      {
        key: 'number',
        label: 'One number',
        met: /\d/.test(pwd),
      },
    ];
  };

  const handleEmailAuth = async () => {
    if (!validateEmail(email)) {
      Toast.show({
        message: 'Please enter a valid email address',
        type: 'error',
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        message: 'Password must be at least 8 characters',
        type: 'error',
      });
      return;
    }

    if (isSignUp) {
      const requirements = getPasswordRequirements(password);
      const allMet = requirements.every(req => req.met);
      
      if (!allMet) {
        Toast.show({
          message: 'Please meet all password requirements',
          type: 'error',
        });
        return;
      }

      if (password !== confirmPassword) {
        Toast.show({
          message: 'Passwords do not match',
          type: 'error',
        });
        return;
      }
    }

    try {
      setLoading(true);

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          Toast.show({
            message: 'This email is already registered. Please sign in.',
            type: 'error',
          });
          setIsSignUp(false);
          return;
        }

        Toast.show({
          message: '✅ Account created! Check your email to verify.',
          type: 'success',
        });
        
        router.push(`/confirm-email?email=${encodeURIComponent(email)}`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        Toast.show({
          message: '🎉 Welcome back! Signed in successfully!',
          type: 'success',
        });
        
        router.replace('/(tabs)/pantry');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Toast.show({
        message: error.message || 'Authentication failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const requirements = getPasswordRequirements(password);
  const isFormValid = validateEmail(email) && 
    password.length >= 8 && 
    (!isSignUp || (password === confirmPassword && requirements.every(req => req.met)));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {isSignUp ? '🚀 Join Nutrion!' : '👋 Welcome Back!'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Start your journey to zero food waste today!' 
                : 'Sign in to continue managing your pantry!'}
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, !isSignUp && styles.activeTab]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, isSignUp && styles.activeTab]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>📧 Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>🔒 Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <IconSymbol
                  ios_icon_name={showPassword ? 'eye.slash' : 'eye'}
                  android_material_icon_name={showPassword ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {isSignUp && password.length > 0 && (
              <View style={styles.requirementsContainer}>
                {requirements.map((req) => (
                  <View key={req.key} style={styles.requirement}>
                    <IconSymbol
                      ios_icon_name={req.met ? 'checkmark.circle.fill' : 'circle'}
                      android_material_icon_name={req.met ? 'check_circle' : 'radio_button_unchecked'}
                      size={16}
                      color={req.met ? colors.success : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        req.met ? styles.requirementMet : styles.requirementNotMet,
                      ]}
                    >
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>✅ Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <IconSymbol
                    ios_icon_name={showConfirmPassword ? 'eye.slash' : 'eye'}
                    android_material_icon_name={showConfirmPassword ? 'visibility_off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!isSignUp && (
            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, (!isFormValid || loading) && styles.submitButtonDisabled]}
            onPress={handleEmailAuth}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.loadingText}>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? '🚀 Create Account!' : '✨ Sign In!'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
