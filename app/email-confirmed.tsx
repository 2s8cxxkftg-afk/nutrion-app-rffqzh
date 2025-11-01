
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function EmailConfirmedScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleContinue = () => {
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <IconSymbol name="checkmark.circle.fill" size={80} color={colors.success} />
          </View>
        </View>

        {/* Logo */}
        <Image
          source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Email Verified!</Text>

        {/* Description */}
        <Text style={styles.description}>
          Your email has been successfully verified. You can now sign in to your Nutrion account.
        </Text>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Sign In</Text>
          <IconSymbol name="arrow_forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Auto-redirect message */}
        <Text style={styles.autoRedirectText}>
          Redirecting automatically in a moment...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    fontWeight: '500',
    maxWidth: 320,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxShadow: '0px 8px 24px rgba(46, 139, 87, 0.3)',
    elevation: 6,
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  autoRedirectText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
