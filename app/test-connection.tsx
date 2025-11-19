
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase, checkSupabaseConnection } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TestConnectionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test 1: AsyncStorage
      addResult('✅ Testing AsyncStorage...');
      await AsyncStorage.setItem('@test_key', 'test_value');
      const value = await AsyncStorage.getItem('@test_key');
      if (value === 'test_value') {
        addResult('✅ AsyncStorage working');
      } else {
        addResult('❌ AsyncStorage failed');
      }
      await AsyncStorage.removeItem('@test_key');

      // Test 2: Supabase Connection
      addResult('✅ Testing Supabase connection...');
      const isHealthy = await checkSupabaseConnection();
      if (isHealthy) {
        addResult('✅ Supabase connection healthy');
      } else {
        addResult('⚠️ Supabase connection issue');
      }

      // Test 3: Auth Session
      addResult('✅ Checking auth session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addResult(`⚠️ Auth error: ${error.message}`);
      } else if (session) {
        addResult(`✅ User logged in: ${session.user.email}`);
      } else {
        addResult('ℹ️ No active session');
      }

      // Test 4: Database Query
      addResult('✅ Testing database query...');
      const { data: tables, error: dbError } = await supabase
        .from('pantry_items')
        .select('count')
        .limit(1);
      
      if (dbError) {
        addResult(`⚠️ Database error: ${dbError.message}`);
      } else {
        addResult('✅ Database query successful');
      }

      addResult('🎉 All tests completed!');
    } catch (error: any) {
      addResult(`❌ Test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Connection Test</Text>
        <TouchableOpacity onPress={runTests} style={styles.refreshButton} disabled={loading}>
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading && results.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Running tests...</Text>
          </View>
        )}

        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ))}

        {results.length > 0 && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={runTests}
            disabled={loading}
          >
            <Text style={styles.retryButtonText}>Run Tests Again</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  refreshButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  resultItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultText: {
    ...typography.bodySmall,
    color: colors.text,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  retryButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
