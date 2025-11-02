
import { IconSymbol } from '@/components/IconSymbol';
import { loadPantryItems, deletePantryItem } from '@/utils/storage';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from '@/components/Toast';
import { colors, commonStyles, expirationColors, spacing, borderRadius, typography } from '@/styles/commonStyles';
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
import { PantryItem } from '@/types/pantry';
import { getExpirationStatus, formatExpirationText } from '@/utils/expirationHelper';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function PantryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const loadedItems = await loadPantryItems();
      setItems(loadedItems);
      console.log('Loaded pantry items:', loadedItems.length);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      Toast.show({
        message: 'Failed to load pantry items',
        type: 'error',
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    Alert.alert(
      t('delete'),
      t('pantry.deleteConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePantryItem(itemId);
              await loadItems();
              Toast.show({
                message: t('pantry.itemDeleted'),
                type: 'success',
              });
            } catch (error) {
              console.error('Error deleting item:', error);
              Toast.show({
                message: 'Failed to delete item',
                type: 'error',
              });
            }
          },
        },
      ]
    );
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPantryItem = (item: PantryItem) => {
    const status = getExpirationStatus(item.expirationDate);
    const expirationText = formatExpirationText(item.expirationDate);

    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteItem(item.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <IconSymbol name="number" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {item.quantity} {item.unit}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <IconSymbol name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[
              styles.detailText,
              { color: expirationColors[status] }
            ]}>
              {expirationText}
            </Text>
          </View>
        </View>

        <View style={[
          styles.statusBadge,
          { backgroundColor: expirationColors[status] + '20' }
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: expirationColors[status] }
          ]} />
          <Text style={[
            styles.statusText,
            { color: expirationColors[status] }
          ]}>
            {status === 'expired' ? t('pantry.expired') : 
             status === 'expiring' ? t('pantry.expiresIn', { days: Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) }) :
             t('pantry.fresh')}
          </Text>
        </View>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>{t('pantry.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('pantry.search')}
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/add-item')}
            activeOpacity={0.7}
          >
            <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>{t('pantry.addItem')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/scan-barcode')}
            activeOpacity={0.7}
          >
            <IconSymbol name="qrcode.viewfinder" size={24} color={colors.secondary} />
            <Text style={styles.actionButtonText}>{t('pantry.scanBarcode')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/food-search')}
            activeOpacity={0.7}
          >
            <IconSymbol name="magnifyingglass.circle.fill" size={24} color={colors.accent} />
            <Text style={styles.actionButtonText}>{t('pantry.foodSearch')}</Text>
          </TouchableOpacity>
        </View>

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
                <IconSymbol name="archivebox" size={64} color={colors.textTertiary} />
              </View>
              <Text style={commonStyles.emptyStateTitle}>
                {searchQuery ? 'No items found' : t('pantry.emptyTitle')}
              </Text>
              <Text style={commonStyles.emptyStateDescription}>
                {searchQuery 
                  ? 'Try a different search term'
                  : t('pantry.emptyDescription')
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={commonStyles.emptyStateButton}
                  onPress={() => router.push('/add-item')}
                >
                  <IconSymbol name="plus" size={20} color="#FFFFFF" />
                  <Text style={commonStyles.emptyStateButtonText}>
                    {t('pantry.addFirst')}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  actionButtonText: {
    ...typography.labelSmall,
    color: colors.text,
    textAlign: 'center',
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
    padding: spacing.lg,
    marginBottom: spacing.md,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
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
    marginBottom: 4,
  },
  itemCategory: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  itemDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.labelSmall,
    fontWeight: '600',
  },
});
