
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import Toast from '@/components/Toast';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  statusGood: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  statusBad: {
    color: colors.error,
    fontFamily: typography.fontFamily.bold,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: typography.fontFamily.semibold,
  },
  codeBlock: {
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
});

export default function TestPasswordResetScreen() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = async () => {
    console.log('[TestPasswordReset] Running diagnostic tests...');
    setTesting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const results: any = {
      supabaseConfigured: false,
      supabaseUrl: '',
      sessionCheck: false,
      deepLinkScheme: '',
      redirectUrl: '',
      timestamp: new Date().toISOString(),
    };

    try {
      // Test 1: Check Supabase configuration
      results.supabaseConfigured = isSupabaseConfigured();
      results.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'NOT SET';
      console.log('[TestPasswordReset] Supabase configured:', results.supabaseConfigured);

      // Test 2: Check session
      try {
        const { data, error } = await supabase.auth.getSession();
        results.sessionCheck = !error;
        results.sessionError = error?.message || null;
        console.log('[TestPasswordReset] Session check:', results.sessionCheck);
      } catch (error: any) {
        results.sessionCheck = false;
        results.sessionError = error.message;
        console.error('[TestPasswordReset] Session check error:', error);
      }

      // Test 3: Check deep link scheme
      results.deepLinkScheme = 'nutrion://';
      console.log('[TestPasswordReset] Deep link scheme:', results.deepLinkScheme);

      // Test 4: Generate redirect URL
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          results.redirectUrl = `${window.location.origin}/reset-password`;
        } else {
          results.redirectUrl = 'http://localhost:8081/reset-password';
        }
      } else {
        results.redirectUrl = 'nutrion://reset-password';
      }
      console.log('[TestPasswordReset] Redirect URL:', results.redirectUrl);

      // Test 5: Try to get initial URL
      try {
        const initialUrl = await Linking.getInitialURL();
        results.initialUrl = initialUrl || 'None';
        console.log('[TestPasswordReset] Initial URL:', results.initialUrl);
      } catch (error: any) {
        results.initialUrl = `Error: ${error.message}`;
        console.error('[TestPasswordReset] Error getting initial URL:', error);
      }

      setTestResults(results);
      Toast.show('Diagnostic tests completed', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('[TestPasswordReset] Test error:', error);
      Toast.show('Test failed: ' + error.message, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setTesting(false);
    }
  };

  const testDeepLink = async () => {
    console.log('[TestPasswordReset] Testing deep link...');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const testUrl = 'nutrion://reset-password?access_token=test123&refresh_token=test456&type=recovery';
      console.log('[TestPasswordReset] Opening test URL:', testUrl);
      
      const canOpen = await Linking.canOpenURL(testUrl);
      console.log('[TestPasswordReset] Can open URL:', canOpen);
      
      if (canOpen) {
        Toast.show('Deep link scheme is configured correctly!', 'success');
      } else {
        Toast.show('Deep link scheme is NOT configured. Rebuild the app.', 'error');
      }
    } catch (error: any) {
      console.error('[TestPasswordReset] Deep link test error:', error);
      Toast.show('Deep link test failed: ' + error.message, 'error');
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Password Reset Diagnostics',
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Configuration Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Configuration Status</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Supabase Configured:</Text>
            <Text style={[styles.value, isConfigured ? styles.statusGood : styles.statusBad]}>
              {isConfigured ? '✅ YES' : '❌ NO'}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Supabase URL:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Anon Key:</Text>
            <Text style={styles.value}>
              {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set'}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Deep Link Scheme:</Text>
            <Text style={styles.value}>nutrion://</Text>
          </View>
        </View>

        {/* Test Results */}
        {testResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 Test Results</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Session Check:</Text>
              <Text style={[styles.value, testResults.sessionCheck ? styles.statusGood : styles.statusBad]}>
                {testResults.sessionCheck ? '✅ PASS' : '❌ FAIL'}
              </Text>
            </View>
            
            {testResults.sessionError && (
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{testResults.sessionError}</Text>
              </View>
            )}
            
            <View style={styles.row}>
              <Text style={styles.label}>Redirect URL:</Text>
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{testResults.redirectUrl}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Initial URL:</Text>
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{testResults.initialUrl}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Actions</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={runTests}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Run Diagnostic Tests
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            onPress={testDeepLink}
            disabled={testing}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Test Deep Link Scheme
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => {
              console.log('[TestPasswordReset] Navigating to forgot password');
              router.push('/forgot-password');
            }}
            disabled={testing}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Go to Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Setup Instructions</Text>
          <Text style={styles.label}>
            To make password reset work, you need to:
            {'\n\n'}
            1. Add redirect URLs in Supabase Dashboard
            {'\n'}   → Authentication → URL Configuration
            {'\n'}   → Add: nutrion://reset-password
            {'\n\n'}
            2. Enable Reset Password email template
            {'\n'}   → Authentication → Email Templates
            {'\n'}   → Enable &quot;Reset Password&quot;
            {'\n\n'}
            3. (Optional) Configure SMTP
            {'\n'}   → Authentication → Settings → SMTP
            {'\n\n'}
            4. Rebuild the app after changing app.json
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
