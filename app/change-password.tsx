
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

interface PasswordRequirement {
  label: string;
  met: boolean;
  key: string;
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordRequirements = (pwd: string): PasswordRequirement[] => {
    return [
      {
        key: 'length',
        label: t('auth.passwordMinLength'),
        met: pwd.length >= 8,
      },
      {
        key: 'uppercase',
        label: t('auth.passwordUppercase'),
        met: /[A-Z]/.test(pwd),
      },
      {
        key: 'lowercase',
        label: t('auth.passwordLowercase'),
        met: /[a-z]/.test(pwd),
      },
      {
        key: 'number',
        label: t('auth.passwordNumber'),
        met: /[0-9]/.test(pwd),
      },
      {
        key: 'special',
        label: t('auth.passwordSpecial'),
        met: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      },
    ];
  };

  const passwordRequirements = getPasswordRequirements(newPassword);
  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleChangePassword = async () => {
    try {
      if (!currentPassword.trim()) {
        Toast.show({
          type: 'error',
          message: t('profile.enterCurrentPassword'),
          duration: 2000,
        });
        return;
      }

      if (!newPassword.trim()) {
        Toast.show({
          type: 'error',
          message: t('profile.enterNewPassword'),
          duration: 2000,
        });
        return;
      }

      if (!allRequirementsMet) {
        Toast.show({
          type: 'error',
          message: t('auth.passwordRequirementsNotMet'),
          duration: 2000,
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Toast.show({
          type: 'error',
          message: t('auth.passwordsDoNotMatch'),
          duration: 2000,
        });
        return;
      }

      if (currentPassword === newPassword) {
        Toast.show({
          type: 'error',
          message: t('profile.newPasswordSameAsOld'),
          duration: 2000,
        });
        return;
      }

      setLoading(true);

      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available');
      }

      // Verify current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('No user found');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        Toast.show({
          type: 'error',
          message: t('profile.incorrectCurrentPassword'),
          duration: 2000,
        });
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        throw updateError;
      }

      console.log('Password updated successfully');

      Toast.show({
        type: 'success',
        message: t('profile.passwordChanged'),
        duration: 2000,
      });

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available');
      }

      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      console.error('Error changing password:', error);
      Toast.show({
        type: 'error',
        message: error.message || t('profile.passwordChangeError'),
        duration: 3000,
      });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.log('Haptics not available');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={commonStyles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow_back"
                size={28} 
                color={colors.text} 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.changePassword')}</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.currentPassword')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('profile.enterCurrentPassword')}
                  placeholderTextColor={colors.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name={showCurrentPassword ? 'eye.slash.fill' : 'eye.fill'}
                    android_material_icon_name={showCurrentPassword ? 'visibility_off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.newPassword')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('profile.enterNewPassword')}
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name={showNewPassword ? 'eye.slash.fill' : 'eye.fill'}
                    android_material_icon_name={showNewPassword ? 'visibility_off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {newPassword.length > 0 && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>{t('auth.passwordRequirements')}</Text>
                {passwordRequirements.map((req) => (
                  <View key={req.key} style={styles.requirementRow}>
                    <IconSymbol
                      ios_icon_name={req.met ? 'checkmark.circle.fill' : 'circle'}
                      android_material_icon_name={req.met ? 'check_circle' : 'radio_button_unchecked'}
                      size={18}
                      color={req.met ? colors.success : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        req.met && styles.requirementTextMet,
                      ]}
                    >
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
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

            <View style={styles.infoBox}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info"
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.infoText}>{t('profile.changePasswordInfo')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.changeButton, loading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <React.Fragment>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.changeButtonText}>{t('profile.changingPassword')}</Text>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="lock.fill" 
                  android_material_icon_name="lock"
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.changeButtonText}>{t('profile.changePassword')}</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
  },
  formSection: {
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: spacing.md,
  },
  requirementsContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementsTitle: {
    ...typography.label,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  requirementTextMet: {
    color: colors.success,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primary + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
});
