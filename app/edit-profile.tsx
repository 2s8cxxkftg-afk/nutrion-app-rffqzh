
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert(t('error'), t('profile.pleaseSignIn'));
        router.back();
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      }

      if (profileData) {
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
      }

      console.log('Profile loaded successfully');
    } catch (error: any) {
      console.error('Error loading profile:', error);
      Toast.show({
        type: 'error',
        message: t('profile.loadError'),
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!firstName.trim() || !lastName.trim()) {
        Toast.show({
          type: 'error',
          message: t('profile.nameRequired'),
          duration: 2000,
        });
        return;
      }

      setSaving(true);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available');
      }

      if (!user) {
        throw new Error('No user found');
      }

      console.log('Saving profile changes...');

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;

      if (existingProfile) {
        console.log('Updating existing profile...');
        result = await supabase
          .from('profiles')
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        console.log('Creating new profile...');
        result = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
          });
      }

      if (result.error) {
        console.error('Error saving profile:', result.error);
        throw result.error;
      }

      console.log('Profile saved successfully');

      Toast.show({
        type: 'success',
        message: t('profile.profileUpdated'),
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
      console.error('Error saving profile:', error);
      Toast.show({
        type: 'error',
        message: error.message || t('profile.saveError'),
        duration: 3000,
      });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.log('Haptics not available');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('profile.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.firstName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.firstNamePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType="next"
                editable={!saving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.lastName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.lastNamePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                editable={!saving}
              />
            </View>

            <View style={styles.infoBox}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info"
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.infoText}>{t('profile.editProfileInfo')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <React.Fragment>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.saveButtonText}>{t('profile.saving')}</Text>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle"
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
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
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
});
