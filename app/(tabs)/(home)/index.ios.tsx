
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { PantryItem } from '@/types/pantry';
import AdBanner from '@/components/AdBanner';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { loadPantryItems } from '@/utils/storage';
import { getExpirationStatus } from '@/utils/expirationHelper';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadItems = useCallback(async () => {
    try {
      const items = await loadPantryItems();
      setPantryItems(items);
    } catch (error) {
      console.log('Error loading pantry items:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, [loadItems]);

  const expiringItems = pantryItems.filter(item => {
    const status = getExpirationStatus(item.expirationDate);
    return status === 'expiring' || status === 'expired';
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Home',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Nutrion</Text>
          <Text style={styles.subtitle}>Manage your pantry smartly</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol
              ios_icon_name="cube.box.fill"
              android_material_icon_name="inventory"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.statNumber}>{pantryItems.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={32}
              color={colors.warning}
            />
            <Text style={styles.statNumber}>{expiringItems.length}</Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/add-item');
            }}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Add Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/ai-recipes');
            }}
          >
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name="auto-awesome"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.actionText}>AI Recipe Generator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/scan-receipt');
            }}
          >
            <IconSymbol
              ios_icon_name="doc.text.viewfinder"
              android_material_icon_name="receipt"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.actionText}>Scan Receipt</Text>
          </TouchableOpacity>
        </View>

        {expiringItems.length > 0 && (
          <View style={styles.alertSection}>
            <Text style={styles.sectionTitle}>Items Expiring Soon</Text>
            {expiringItems.slice(0, 3).map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.alertItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/edit-item?id=${item.id}`);
                }}
              >
                <View style={styles.alertContent}>
                  <Text style={styles.alertItemName}>{item.name}</Text>
                  <Text style={styles.alertItemDate}>{item.expirationDate}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <AdBanner />
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
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  statNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickActions: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...commonStyles.shadow,
  },
  actionText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.md,
    fontWeight: typography.weights.medium as any,
  },
  alertSection: {
    marginBottom: spacing.lg,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    ...commonStyles.shadow,
  },
  alertContent: {
    flex: 1,
  },
  alertItemName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  alertItemDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
