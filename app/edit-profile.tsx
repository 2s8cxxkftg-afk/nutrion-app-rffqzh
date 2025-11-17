
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        throw profileError;
      }

      if (profileData) {
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
        setAvatarUrl(profileData.avatar_url || '');
      }

      console.log('Profile loaded successfully:', profileData);
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

  const pickImage = async () => {
    try {
      console.log('Starting image picker...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Check current permission status
      const { status: currentStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('Current permission status:', currentStatus);

      let finalStatus = currentStatus;

      // Request permission if not granted
      if (currentStatus !== 'granted') {
        console.log('Requesting media library permission...');
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = newStatus;
        console.log('Permission request result:', newStatus);
      }

      // Check if permission was granted
      if (finalStatus !== 'granted') {
        console.log('Permission denied by user');
        Alert.alert(
          t('profile.permissionRequired'),
          t('profile.photoPermissionMessage'),
          [
            { text: t('cancel'), style: 'cancel' },
            {
              text: t('notifications.openSettings'),
              onPress: () => {
                if (Platform.OS === 'ios') {
                  // On iOS, we can't directly open settings, but we can show a message
                  Alert.alert(
                    t('profile.permissionRequired'),
                    t('profile.photoPermissionMessage')
                  );
                }
              }
            }
          ]
        );
        return;
      }

      console.log('Permission granted, launching image picker...');

      // Launch image picker with proper configuration for Expo SDK 54
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      // Check if user cancelled the picker
      if (result.canceled) {
        console.log('User cancelled image picker');
        return;
      }

      // Check if we have a valid asset
      if (!result.assets || result.assets.length === 0) {
        console.error('No assets returned from image picker');
        Toast.show({
          type: 'error',
          message: t('profile.imagePickError'),
          duration: 2000,
        });
        return;
      }

      const selectedAsset = result.assets[0];
      console.log('Selected image URI:', selectedAsset.uri);

      // Validate the URI
      if (!selectedAsset.uri) {
        console.error('Invalid image URI');
        Toast.show({
          type: 'error',
          message: t('profile.imagePickError'),
          duration: 2000,
        });
        return;
      }

      // Upload the selected image
      await uploadImage(selectedAsset.uri);
    } catch (error: any) {
      console.error('Error in pickImage:', error);
      Toast.show({
        type: 'error',
        message: error.message || t('profile.imagePickError'),
        duration: 3000,
      });
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      console.log('Starting image upload for URI:', uri);
      setUploading(true);

      if (!user) {
        throw new Error('No user found');
      }

      // Determine file extension
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      // FIXED: Use the correct path format with user_id folder for RLS policies
      const filePath = `avatars/${user.id}/${fileName}`;

      console.log('Preparing to upload to:', filePath);

      // For React Native, we need to fetch the file as ArrayBuffer
      console.log('Fetching image data...');
      const response = await fetch(uri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Convert to ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      console.log('Image data loaded, size:', arrayBuffer.byteLength);

      // Validate data
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Image file is empty');
      }

      // Determine content type
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      console.log('Content type:', contentType);

      // Upload to Supabase Storage using ArrayBuffer
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, arrayBuffer, {
          contentType: contentType,
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload image to storage');
      }

      console.log('Image uploaded successfully:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('Public URL generated:', publicUrl);

      // Update local state immediately for instant UI feedback
      setAvatarUrl(publicUrl);

      // Update profile in database
      console.log('Updating profile with new avatar URL...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile with avatar URL:', updateError);
        // Don't throw here - the image is uploaded, just log the error
        console.log('Image uploaded but profile update failed, will retry on save');
      } else {
        console.log('Profile updated with new avatar URL');
      }

      Toast.show({
        type: 'success',
        message: t('profile.imageUploaded'),
        duration: 2000,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      // Provide more specific error messages
      let errorMessage = t('profile.imageUploadError');
      
      if (error.message) {
        if (error.message.includes('fetch')) {
          errorMessage = t('profile.imageUploadError');
        } else if (error.message.includes('storage')) {
          errorMessage = t('profile.imageUploadError');
        } else {
          errorMessage = error.message;
        }
      }

      Toast.show({
        type: 'error',
        message: errorMessage,
        duration: 3000,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUploading(false);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (!user) {
        throw new Error('No user found');
      }

      console.log('Saving profile changes...');

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;

      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing profile...');
        result = await supabase
          .from('profiles')
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            avatar_url: avatarUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        // Insert new profile
        console.log('Creating new profile...');
        result = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            avatar_url: avatarUrl || null,
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

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate back after a short delay
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('profile.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
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

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image 
                  source={{ uri: avatarUrl }} 
                  style={styles.avatar}
                  onError={(error) => {
                    console.error('Error loading avatar image:', error);
                    setAvatarUrl(''); // Reset to placeholder on error
                  }}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <IconSymbol 
                    ios_icon_name="person.fill" 
                    android_material_icon_name="person"
                    size={64} 
                    color={colors.primary} 
                  />
                </View>
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.uploadingText}>{t('profile.uploading')}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.changePhotoButton, uploading && styles.changePhotoButtonDisabled]}
              onPress={pickImage}
              activeOpacity={0.7}
              disabled={uploading}
            >
              <IconSymbol 
                ios_icon_name="camera.fill" 
                android_material_icon_name="photo_camera"
                size={20} 
                color={uploading ? colors.textSecondary : colors.primary} 
              />
              <Text style={[styles.changePhotoText, uploading && styles.changePhotoTextDisabled]}>
                {uploading 
                  ? t('profile.uploading')
                  : avatarUrl 
                    ? t('profile.changePhoto')
                    : t('profile.addPhoto')
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
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
              <Text style={styles.infoText}>
                {t('profile.editProfileInfo')}
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.saveButtonText}>{t('profile.saving')}</Text>
              </>
            ) : (
              <>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle"
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
              </>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: colors.primary + '30',
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary + '30',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  uploadingText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.lg,
  },
  changePhotoButtonDisabled: {
    opacity: 0.5,
  },
  changePhotoText: {
    ...typography.h4,
    color: colors.primary,
  },
  changePhotoTextDisabled: {
    color: colors.textSecondary,
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
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 1,
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
    boxShadow: `0px 4px 12px ${colors.primary}40`,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
});
