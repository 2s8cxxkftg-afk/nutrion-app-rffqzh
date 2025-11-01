
import React, { useState, useEffect, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, expirationColors } from '@/styles/commonStyles';
import { PantryItem } from '@/types/pantry';
import { loadPantryItems, deletePantryItem } from '@/utils/storage';
import { getExpirationStatus, formatExpirationText } from '@/utils/expirationHelper';
import { useTranslation } from 'react-i18next';
import Toast from '@/components/Toast';

export default function PantryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const items = await loadPantryItems();
      console.log('Loaded pantry items:', items.length);
      setPantryItems(items);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      Toast.show({
        type: 'error',
        message: t('error'),
        duration: 2000,
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

  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = pantryItems.find(item => item.id === itemId);
    console.log('Delete requested for item:', itemId, itemToDelete?.name);
    
    Alert.alert(
      t('delete'),
      `${t('deleteConfirm')}\n\n"${itemToDelete?.name}"`,
      [
        { 
          text: t('cancel'), 
          style: 'cancel',
          onPress: () => console.log('Delete cancelled')
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting item with ID:', itemId);
              await deletePantryItem(itemId);
              console.log('Item deleted successfully, reloading items...');
              
              // Show success toast
              Toast.show({
                type: 'success',
                message: t('itemDeleted'),
                duration: 2000,
              });
              
              // Reload items
              await loadItems();
            } catch (error) {
              console.error('Error deleting item:', error);
              Toast.show({
                type: 'error',
                message: 'Failed to delete item',
                duration: 2000,
              });
            }
          },
        },
      ]
    );
  };

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(pantryItems.map(item => item.category)))];

  const renderPantryItem = (item: PantryItem) => {
    const status = getExpirationStatus(item.expirationDate);
    const statusColor = expirationColors[status];

    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                console.log('Delete button pressed for:', item.id, item.name);
                handleDeleteItem(item.id);
              }}
              style={styles.deleteButton}
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <IconSymbol name="trash" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.itemDetails}>
            <View style={styles.detailChip}>
              <IconSymbol name="number" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {item.quantity} {item.unit}
              </Text>
            </View>
            
            <View style={styles.detailChip}>
              <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {new Date(item.dateAdded).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={[styles.expirationBadge, { backgroundColor: statusColor }]}>
            <IconSymbol name="clock" size={14} color="#FFFFFF" />
            <Text style={styles.expirationText}>
              {formatExpirationText(item.expirationDate)}
            </Text>
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('pantryTitle'),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        }}
      />
      
      <View style={commonStyles.container}>
        {/* Search and Actions Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/food-search')}
            activeOpacity={0.7}
          >
            <IconSymbol name="magnifyingglass" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => router.push('/add-item')}
            activeOpacity={0.7}
          >
            <IconSymbol name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                commonStyles.chip,
                filterCategory === category && commonStyles.chipActive,
              ]}
              onPress={() => setFilterCategory(category)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  commonStyles.chipText,
                  filterCategory === category && commonStyles.chipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
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
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <IconSymbol name="archivebox" size={64} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? t('noResults') : t('pantryTitle')}
              </Text>
              <Text style={styles.emptyStateDescription}>
                {searchQuery
                  ? t('tryDifferent')
                  : 'Start adding items to track your food inventory'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => router.push('/food-search')}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="magnifyingglass" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyStateButtonText}>{t('searchForFoods')}</Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: colors.accent,
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(102, 205, 170, 0.3)',
    elevation: 4,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(46, 139, 87, 0.3)',
  },
  categoryScroll: {
    maxHeight: 56,
    marginBottom: 16,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 110,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.06)',
    elevation: 3,
    overflow: 'hidden',
  },
  itemContent: {
    padding: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  itemCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(220, 38, 38, 0.3)',
    elevation: 3,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  expirationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  expirationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    boxShadow: '0px 4px 12px rgba(46, 139, 87, 0.3)',
    elevation: 4,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
