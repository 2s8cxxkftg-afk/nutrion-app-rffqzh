
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export default function Setup2FAScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [verifying, setVerifying] = useState(false);

  const generateSecret = useCallback(async () => {
    try {
      setLoading(true);
      
      // Generate a random secret (32 characters base32)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let secret = '';
      for (let i = 0; i < 32; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      setSecret(secret);
      
      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || 'user@nutrion.app';
      
      // Generate QR code URL using Google Charts API
      const issuer = 'Nutrion';
      const otpauthUrl = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(otpauthUrl)}`;
      
      setQrCodeUrl(qrUrl);
      
      // Generate backup codes
      const codes = [];
      for (let i = 0; i < 8; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
      }
      setBackupCodes(codes);
      
    } catch (error) {
      console.error('Error generating secret:', error);
      Toast.show(t('auth.2faSetupError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    generateSecret();
  }, [generateSecret]);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Toast.show(t('auth.enter6DigitCode'), 'error');
      return;
    }

    setVerifying(true);

    try {
      // In a real app, you would verify the TOTP code on the server
      // For now, we'll just save the secret to the database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Toast.show(t('auth.notLoggedIn'), 'error');
        return;
      }

      // Save 2FA settings to database
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          two_factor_enabled: true,
          two_factor_secret: secret,
          backup_codes: backupCodes,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving 2FA settings:', error);
        Toast.show(t('auth.2faSaveError'), 'error');
        return;
      }

      Toast.show(t('auth.2faEnabled'), 'success');
      setStep('backup');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      Toast.show(t('auth.2faVerifyError'), 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleComplete = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('auth.setup2fa'),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          presentation: 'modal',
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 'setup' && (
          <>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
            </View>

            <Text style={styles.title}>{t('auth.scanQRCode')}</Text>
            <Text style={styles.description}>
              {t('auth.scanQRCodeDesc')}
            </Text>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              {qrCodeUrl ? (
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              ) : (
                <ActivityIndicator size="large" color={colors.primary} />
              )}
            </View>

            {/* Manual Entry */}
            <View style={styles.manualEntry}>
              <Text style={styles.manualEntryTitle}>
                {t('auth.manualEntry')}
              </Text>
              <View style={styles.secretContainer}>
                <Text style={styles.secretText}>{secret}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep('verify')}
            >
              <Text style={styles.primaryButtonText}>{t('next')}</Text>
              <IconSymbol name="arrow_forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}

        {step === 'verify' && (
          <>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotComplete]} />
              <View style={[styles.stepLine, styles.stepLineComplete]} />
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
            </View>

            <Text style={styles.title}>{t('auth.verifyCode')}</Text>
            <Text style={styles.description}>
              {t('auth.verifyCodeDesc')}
            </Text>

            {/* Verification Code Input */}
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="000000"
                placeholderTextColor={colors.textSecondary}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, verifying && styles.primaryButtonDisabled]}
              onPress={handleVerify}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>{t('auth.verify')}</Text>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStep('setup')}
            >
              <Text style={styles.secondaryButtonText}>{t('auth.back')}</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'backup' && (
          <>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotComplete]} />
              <View style={[styles.stepLine, styles.stepLineComplete]} />
              <View style={[styles.stepDot, styles.stepDotComplete]} />
              <View style={[styles.stepLine, styles.stepLineComplete]} />
              <View style={[styles.stepDot, styles.stepDotActive]} />
            </View>

            <View style={styles.successIcon}>
              <IconSymbol name="checkmark.circle.fill" size={64} color={colors.primary} />
            </View>

            <Text style={styles.title}>{t('auth.backupCodes')}</Text>
            <Text style={styles.description}>
              {t('auth.backupCodesDesc')}
            </Text>

            {/* Backup Codes */}
            <View style={styles.backupCodesContainer}>
              {backupCodes.map((code, index) => (
                <View key={index} style={styles.backupCodeItem}>
                  <Text style={styles.backupCodeNumber}>{index + 1}.</Text>
                  <Text style={styles.backupCodeText}>{code}</Text>
                </View>
              ))}
            </View>

            <View style={styles.warningBox}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                {t('auth.backupCodesWarning')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleComplete}
            >
              <Text style={styles.primaryButtonText}>{t('auth.done')}</Text>
              <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepDotComplete: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
  },
  stepLineComplete: {
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  qrContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  qrCode: {
    width: 250,
    height: 250,
  },
  manualEntry: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  manualEntryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  secretContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  secretText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
  codeInputContainer: {
    marginBottom: 32,
  },
  codeInput: {
    backgroundColor: colors.card,
    borderRadius: 16,
    height: 64,
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0px 8px 24px rgba(46, 139, 87, 0.3)',
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backupCodesContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  backupCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backupCodeNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 30,
  },
  backupCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
