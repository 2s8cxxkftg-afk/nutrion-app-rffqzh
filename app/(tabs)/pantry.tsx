
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, expirationColors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { PantryItem } from '@/types/pantry';
import { loadPantryItems, deletePantryItem } from '@/utils/storage';
import { getExpirationStatus, formatExpirationText } from '@/utils/expirationHelper';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

export default function PantryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'fresh' | 'nearExpiry' | 'expired'>('all');

  const loadItems = useCallback(async () => {
    try {
      console.log('Loading pantry items...');
      const loadedItems = await loadPantryItems();
      console.log('Loaded items:', loadedItems.length);
      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      Toast.show({
        message: t('pantry.loadError') || 'Failed to load pantry items',
        type: 'error',
      });
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      console.log('Pantry screen focused, loading items...');
      loadItems();
    }, [loadItems])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, [loadItems]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      Alert.alert(
        t('pantry.deleteConfirmTitle') || 'Delete Item',
        t('pantry.deleteConfirmMessage') || 'Are you sure you want to delete this item?',
        [
          {
            text: t('cancel') || 'Cancel',
            style: 'cancel',
          },
          {
            text: t('delete') || 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Deleting item:', itemId);
                await deletePantryItem(itemId);
                console.log('Item deleted successfully');
                Toast.show({
                  message: t('pantry.itemDeleted') || 'Item deleted successfully',
                  type: 'success',
                });
                await loadItems();
              } catch (error) {
                console.error('Error deleting item:', error);
                Toast.show({
                  message: t('pantry.deleteError') || 'Failed to delete item',
                  type: 'error',
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error showing delete confirmation:', error);
    }
  }, [t, loadItems]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    
    const status = getExpirationStatus(item.expirationDate);
    return matchesSearch && status === filterStatus;
  });

  // Calculate stats
  const stats = {
    total: items.length,
    fresh: items.filter(item => getExpirationStatus(item.expirationDate) === 'fresh').length,
    nearExpiry: items.filter(item => getExpirationStatus(item.expirationDate) === 'nearExpiry').length,
    expired: items.filter(item => getExpirationStatus(item.expirationDate) === 'expired').length,
  };

  const renderPantryItem = useCallback((item: PantryItem) => {
    const status = getExpirationStatus(item.expirationDate);
    const statusColor =
      status === 'expired'
        ? expirationColors.expired
        : status === 'nearExpiry'
        ? expirationColors.nearExpiry
        : expirationColors.fresh;

    return (
      <View key={item.id} style={styles.itemCard}>
        {/* Status Indicator Bar */}
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
        
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemMeta}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.quantityText}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch (error) {
                  console.log('Haptics not available:', error);
                }
                handleDeleteItem(item.id);
              }}
              activeOpacity={0.7}
            >
              <IconSymbol name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.expirationRow}>
            <View style={styles.expirationInfo}>
              <IconSymbol 
                name="calendar" 
                size={16} 
                color={statusColor} 
              />
              <Text style={[styles.expirationText, { color: statusColor }]}>
                {formatExpirationText(item.expirationDate)}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
        </View>
      </View>
    );
  }, [t, handleDeleteItem]);

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={commonStyles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t('pantry.title') || 'My Pantry'}</Text>
            <Text style={styles.headerSubtitle}>
              {stats.total} {stats.total === 1 ? 'item' : 'items'} in stock
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch (error) {
                console.log('Haptics not available:', error);
              }
              router.push('/add-item');
            }}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: expirationColors.fresh + '15' }]}>
            <Text style={[styles.statNumber, { color: expirationColors.fresh }]}>{stats.fresh}</Text>
            <Text style={styles.statLabel}>Fresh</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: expirationColors.nearExpiry + '15' }]}>
            <Text style={[styles.statNumber, { color: expirationColors.nearExpiry }]}>{stats.nearExpiry}</Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: expirationColors.expired + '15' }]}>
            <Text style={[styles.statNumber, { color: expirationColors.expired }]}>{stats.expired}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('pantry.search') || 'Search items...'}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
            onPress={() => setFilterStatus('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'fresh' && styles.filterChipActive]}
            onPress={() => setFilterStatus('fresh')}
            activeOpacity={0.7}
          >
            <View style={[styles.filterDot, { backgroundColor: expirationColors.fresh }]} />
            <Text style={[styles.filterChipText, filterStatus === 'fresh' && styles.filterChipTextActive]}>
              Fresh
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'nearExpiry' && styles.filterChipActive]}
            onPress={() => setFilterStatus('nearExpiry')}
            activeOpacity={0.7}
          >
            <View style={[styles.filterDot, { backgroundColor: expirationColors.nearExpiry }]} />
            <Text style={[styles.filterChipText, filterStatus === 'nearExpiry' && styles.filterChipTextActive]}>
              Expiring Soon
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'expired' && styles.filterChipActive]}
            onPress={() => setFilterStatus('expired')}
            activeOpacity={0.7}
          >
            <View style={[styles.filterDot, { backgroundColor: expirationColors.expired }]} />
            <Text style={[styles.filterChipText, filterStatus === 'expired' && styles.filterChipTextActive]}>
              Expired
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Items List */}
        <ScrollView
          style={styles.itemsList}
          contentContainerStyle={styles.itemsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {filteredItems.length === 0 ? (
            <View style={commonStyles.emptyState}>
              <View style={commonStyles.emptyStateIcon}>
                <IconSymbol 
                  name={searchQuery ? "magnifyingglass" : "archivebox"} 
                  size={64} 
                  color={colors.textTertiary} 
                />
              </View>
              <Text style={commonStyles.emptyStateTitle}>
                {searchQuery
                  ? t('pantry.noResults') || 'No items found'
                  : t('pantry.empty') || 'Your pantry is empty'}
              </Text>
              <Text style={commonStyles.emptyStateDescription}>
                {searchQuery
                  ? 'Try searching with different keywords'
                  : 'Start adding items to track your food inventory'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => router.push('/add-item')}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="plus" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyStateButtonText}>
                    {t('pantry.addFirst') || 'Add your first item'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredItems.map(renderPantryItem)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.displayMedium,
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 4px 16px ${colors.primary}40`,
    elevation: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.displaySmall,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  filterContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.label,
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  itemContent: {
    padding: spacing.lg,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  categoryText: {
    ...typography.labelSmall,
    color: colors.primary,
  },
  quantityText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expirationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expirationText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    boxShadow: `0px 4px 12px ${colors.primary}40`,
    elevation: 4,
  },
  emptyStateButtonText: {
    ...typography.h4,
    color: '#FFFFFF',
  },
});
