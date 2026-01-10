
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import Toast from '@/components/Toast';
import AdBanner from '@/components/AdBanner';
import { loadPantryItems, deletePantryItem } from '@/utils/storage';
import { getExpirationStatus, formatExpirationText } from '@/utils/expirationHelper';
import { PantryItem } from '@/types/pantry';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkAndNotifyExpiringItems } from '@/utils/notificationScheduler';
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
import React, { useState, useCallback } from 'react';
import { colors, commonStyles, expirationColors, spacing, borderRadius, typography } from '@/styles/commonStyles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
  },
  pantryItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemDetails: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  itemExpiration: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl + 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

function PantryScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PantryScreenContent />
    </>
  );
}

function PantryScreenContent() {
  const router = useRouter();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const loadedItems = await loadPantryItems();
      setItems(loadedItems);
      await checkAndNotifyExpiringItems(loadedItems);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      Toast.show('Failed to load items', 'error');
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

  const handleEditItem = (itemId: string) => {
    router.push(`/edit-item?itemId=${itemId}`);
  };

  const handleDeleteItem = useCallback(async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await deletePantryItem(itemId);
              await loadItems();
              Toast.show('Item deleted', 'success');
            } catch (error) {
              console.error('Error deleting item:', error);
              Toast.show('Failed to delete item', 'error');
            }
          },
        },
      ]
    );
  }, [loadItems]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPantryItem = (item: PantryItem) => {
    const expirationStatus = getExpirationStatus(item.expirationDate);
    const expirationText = formatExpirationText(item.expirationDate);
    const expirationColor = expirationColors[expirationStatus];

    return (
      <View key={item.id} style={styles.pantryItem}>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            {item.quantity} {item.unit} • {item.category}
          </Text>
          <Text style={[styles.itemExpiration, { color: expirationColor }]}>
            {expirationText}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditItem(item.id)}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteItem(item.id)}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={20}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pantry items..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <AdBanner onUpgradePress={() => router.push('/subscription-management')} />

        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="tray"
              android_material_icon_name="inventory"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No items found' : 'Your pantry is empty'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Add items to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredItems.map(renderPantryItem)}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-item')}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color="#fff"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default PantryScreen;
