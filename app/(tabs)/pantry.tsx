
import { useTranslation } from 'react-i18next';
import { colors, commonStyles, expirationColors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import Toast from '@/components/Toast';
import React, { useState, useCallback } from 'react';
import { PantryItem } from '@/types/pantry';
import { loadPantryItems, deletePantryItem } from '@/utils/storage';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { getExpirationStatus, formatExpirationText } from '@/utils/expirationHelper';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item.id)}
          >
            <IconSymbol name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('pantry.quantity') || 'Quantity'}:</Text>
            <Text style={styles.detailValue}>
              {item.quantity} {item.unit}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('pantry.expires') || 'Expires'}:</Text>
            <Text style={[styles.detailValue, { color: statusColor }]}>
              {formatExpirationText(item.expirationDate)}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {status === 'expired'
              ? t('pantry.expired') || 'Expired'
              : status === 'nearExpiry'
              ? t('pantry.nearExpiry') || 'Near Expiry'
              : t('pantry.fresh') || 'Fresh'}
          </Text>
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
          <Text style={commonStyles.title}>{t('pantry.title') || 'My Pantry'}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-item')}
          >
            <IconSymbol name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
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
        </View>

        {/* Items List */}
        <ScrollView
          style={styles.itemsList}
          contentContainerStyle={styles.itemsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="archivebox" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? t('pantry.noResults') || 'No items found'
                  : t('pantry.empty') || 'Your pantry is empty'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => router.push('/add-item')}
                >
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(46, 139, 87, 0.3)',
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  itemDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
