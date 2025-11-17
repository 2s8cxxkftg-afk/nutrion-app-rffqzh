
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
  Platform,
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
import { checkAndNotifyExpiringItems } from '@/utils/notificationScheduler';

export default function PantryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      console.log('Loading pantry items...');
      const loadedItems = await loadPantryItems();
      console.log('Loaded items:', loadedItems.length);
      setItems(loadedItems);
      
      // Check for expiring items and send notifications
      await checkAndNotifyExpiringItems(loadedItems);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      Toast.show({
        type: 'error',
        message: t('pantry.loadError') || 'Failed to load items',
      });
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      console.log('Pantry screen focused, loading items...');
      loadItems();
    }, [loadItems])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleEditItem = (itemId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    router.push({
      pathname: '/edit-item',
      params: { itemId },
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    Alert.alert(
      t('delete') || 'Delete',
      t('pantry.deleteConfirm') || 'Are you sure you want to delete this item?',
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
              await loadItems();
              Toast.show({
                type: 'success',
                message: t('pantry.itemDeleted') || 'Item deleted',
              });
            } catch (error) {
              console.error('Error deleting item:', error);
              Toast.show({
                type: 'error',
                message: t('error') || 'Error deleting item',
              });
            }
          },
        },
      ]
    );
  };

  const renderPantryItem = (item: PantryItem) => {
    const status = getExpirationStatus(item.expirationDate);
    const expirationText = formatExpirationText(item.expirationDate, t);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.itemCard}
        onPress={() => handleEditItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.category && (
              <Text style={styles.itemCategory}>
                {t(item.category.toLowerCase()) || item.category}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol
              ios_icon_name="trash.fill"
              android_material_icon_name="delete"
              size={20}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="number"
              android_material_icon_name="tag"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.detailText}>
              {item.quantity} {t(item.unit) || item.unit}
            </Text>
          </View>

          {item.expirationDate && (
            <View style={styles.detailRow}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: expirationColors[status] },
                ]}
              />
              <Text
                style={[
                  styles.expirationText,
                  { color: expirationColors[status] },
                ]}
              >
                {expirationText}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('pantry.title') || 'My Pantry'}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/food-search')}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="magnifyingglass"
                android_material_icon_name="search"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-item')}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('pantry.search') || 'Search pantry...'}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Items List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="archivebox"
                android_material_icon_name="inventory_2"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? t('noResults') || 'No results found'
                  : t('pantry.emptyTitle') || 'Your pantry is empty'}
              </Text>
              <Text style={styles.emptyDescription}>
                {searchQuery
                  ? t('tryDifferent') || 'Try a different search term'
                  : t('pantry.emptyDescription') ||
                    'Start by adding items to track your food inventory'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/add-item')}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="plus.circle.fill"
                    android_material_icon_name="add_circle"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.emptyButtonText}>
                    {t('pantry.addFirst') || 'Add your first item'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <React.Fragment>
              {filteredItems.map((item) => renderPantryItem(item))}
            </React.Fragment>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'android' ? 48 : spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.displaySmall,
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0px 4px 8px ${colors.primary}40`,
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
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
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expirationText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  emptyButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
