
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import * as Network from 'expo-network';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export default function TestConnectionScreen() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  // Wrap runTests with useCallback to stabilize its reference
  const runTests = useCallback(async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: Network connectivity
    testResults.push({ name: 'Network Connection', status: 'pending', message: 'Testing...' });
    setResults([...testResults]);

    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected) {
        testResults[0] = { 
          name: 'Network Connection', 
          status: 'success', 
          message: `Connected (${networkState.type})` 
        };
      } else {
        testResults[0] = { 
          name: 'Network Connection', 
          status: 'error', 
          message: 'No internet connection' 
        };
      }
    } catch (error) {
      testResults[0] = { 
        name: 'Network Connection', 
        status: 'error', 
        message: 'Failed to check network' 
      };
    }
    setResults([...testResults]);

    // Test 2: Supabase connection
    testResults.push({ name: 'Supabase Connection', status: 'pending', message: 'Testing...' });
    setResults([...testResults]);

    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        testResults[1] = { 
          name: 'Supabase Connection', 
          status: 'error', 
          message: error.message 
        };
      } else {
        testResults[1] = { 
          name: 'Supabase Connection', 
          status: 'success', 
          message: 'Connected successfully' 
        };
      }
    } catch (error: any) {
      testResults[1] = { 
        name: 'Supabase Connection', 
        status: 'error', 
        message: error.message || 'Connection failed' 
      };
    }
    setResults([...testResults]);

    // Test 3: Authentication status
    testResults.push({ name: 'Authentication', status: 'pending', message: 'Testing...' });
    setResults([...testResults]);

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        testResults[2] = { 
          name: 'Authentication', 
          status: 'error', 
          message: error.message 
        };
      } else if (session) {
        testResults[2] = { 
          name: 'Authentication', 
          status: 'success', 
          message: `Logged in as ${session.user.email}` 
        };
      } else {
        testResults[2] = { 
          name: 'Authentication', 
          status: 'error', 
          message: 'Not authenticated' 
        };
      }
    } catch (error: any) {
      testResults[2] = { 
        name: 'Authentication', 
        status: 'error', 
        message: error.message || 'Auth check failed' 
      };
    }
    setResults([...testResults]);

    setTesting(false);
  }, []);

  useEffect(() => {
    runTests();
  }, [runTests]); // Fixed: Added runTests to dependencies

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return (
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check-circle"
            size={24}
            color={colors.success}
          />
        );
      case 'error':
        return (
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="error"
            size={24}
            color={colors.error}
          />
        );
      case 'pending':
        return <ActivityIndicator size="small" color={colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Connection Test',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Connection Diagnostics</Text>
          <Text style={styles.subtitle}>
            Testing your connection to Nutrion services
          </Text>
        </View>

        <View style={styles.resultsContainer}>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                {getStatusIcon(result.status)}
                <Text style={styles.resultName}>{result.name}</Text>
              </View>
              <Text style={[
                styles.resultMessage,
                result.status === 'error' && styles.resultMessageError,
                result.status === 'success' && styles.resultMessageSuccess,
              ]}>
                {result.message}
              </Text>
            </View>
          ))}
        </View>

        {!testing && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={runTests}
          >
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={20}
              color={colors.background}
            />
            <Text style={styles.retryButtonText}>Run Tests Again</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            If any tests fail, please check your internet connection and try again.
            If problems persist, contact support.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  resultsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  resultItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...commonStyles.shadow,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
  },
  resultMessage: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: 32,
  },
  resultMessageError: {
    color: colors.error,
  },
  resultMessageSuccess: {
    color: colors.success,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...commonStyles.shadow,
  },
  retryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.background,
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
