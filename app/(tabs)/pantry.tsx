
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from '@/components/Toast';
import { colors, commonStyles, expirationColors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { checkAndNotifyExpiringItems } from '@/utils/notificationScheduler';
import { loadPantryItems, deletePantryItem } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import { PantryItem, FOOD_CATEGORIES } from '@/types/pantry';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Platform,
  Modal,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { getExpirationStatus, formatExpirationText } from '@/utils/expirationHelper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: Platform.select({
      ios: 120,
      android: 100,
      default: 100,
    }),
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  quickActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
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
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
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
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  actionButton: {
    padding: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontWeight: '600',
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
    bottom: Platform.select({
      ios: spacing.xl + 100,
      android: spacing.xl + 80,
      default: spacing.xl + 80,
    }),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonDelete: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextDelete: {
    color: '#FFFFFF',
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadItems = useCallback(async () => {
    try {
      console.log('[Pantry] Loading pantry items...');
      const loadedItems = await loadPantryItems();
      setItems(loadedItems);
      console.log('[Pantry] Pantry items loaded:', loadedItems.length);
      await checkAndNotifyExpiringItems(loadedItems);
    } catch (error) {
      console.error('[Pantry] Error loading pantry items:', error);
      Toast.show('Failed to load items', 'error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('[Pantry] Screen focused - loading items');
      loadItems();
    }, [loadItems])
  );

  const onRefresh = useCallback(async () => {
    console.log('[Pantry] User refreshing pantry list');
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, [loadItems]);

  const handleEditItem = useCallback((itemId: string, itemName: string) => {
    console.log('[Pantry] User tapped Edit button for item:', itemName, 'ID:', itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/edit-item?id=${itemId}`);
  }, [router]);

  const handleDeleteItem = useCallback((itemId: string, itemName: string) => {
    console.log('[Pantry] Delete button pressed for item:', itemName, 'ID:', itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Store the item to delete and show modal
    setItemToDelete({ id: itemId, name: itemName });
    setDeleteModalVisible(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) {
      console.log('[Pantry] confirmDelete called but no item to delete');
      return;
    }

    try {
      console.log('[Pantry] User confirmed delete - starting deletion process');
      console.log('[Pantry] Deleting item:', itemToDelete.name, 'ID:', itemToDelete.id);
      
      // Close modal first
      setDeleteModalVisible(false);
      
      // Provide haptic feedback for delete action
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Delete the item from storage
      await deletePantryItem(itemToDelete.id);
      console.log('[Pantry] Item deleted from storage successfully');
      
      // Reload items to update UI
      await loadItems();
      console.log('[Pantry] Items reloaded after delete');
      
      // Show success message
      Toast.show(`${itemToDelete.name} deleted successfully`, 'success');
      console.log('[Pantry] Delete operation completed successfully');
      
      // Clear the item to delete
      setItemToDelete(null);
    } catch (error) {
      console.error('[Pantry] Error deleting item:', error);
      Toast.show('Failed to delete item. Please try again.', 'error');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setItemToDelete(null);
    }
  }, [itemToDelete, loadItems]);

  const cancelDelete = useCallback(() => {
    console.log('[Pantry] User cancelled delete');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeleteModalVisible(false);
    setItemToDelete(null);
  }, []);

  const getCategoryDisplay = (categoryValue: string): string => {
    const categoryObj = FOOD_CATEGORIES.find(c => c.value === categoryValue);
    return categoryObj ? `${categoryObj.icon} ${categoryObj.label}` : '📦 Other';
  };

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
            {item.quantity} {item.unit} • {getCategoryDisplay(item.category)}
          </Text>
          <Text style={[styles.itemExpiration, { color: expirationColor }]}>
            {expirationText}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              console.log('[Pantry] Edit button tapped for:', item.name);
              handleEditItem(item.id, item.name);
            }}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              console.log('[Pantry] Delete button tapped for:', item.name);
              handleDeleteItem(item.id, item.name);
            }}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={22}
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

      <View style={styles.quickActionsContainer}>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              console.log('[Pantry] User tapped Scan Receipt button');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/scan-receipt');
            }}
          >
            <IconSymbol
              ios_icon_name="doc.text.viewfinder"
              android_material_icon_name="receipt"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.quickActionText}>Scan Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              console.log('[Pantry] User tapped AI Recipes button');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/ai-recipes');
            }}
          >
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name="auto-awesome"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.quickActionText}>AI Recipes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
        onPress={() => {
          console.log('[Pantry] User tapped Add Item button');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/add-item');
        }}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Item</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{itemToDelete?.name}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('[Pantry] Cancel button pressed in modal');
                  cancelDelete();
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={() => {
                  console.log('[Pantry] Delete button pressed in modal');
                  confirmDelete();
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextDelete]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default PantryScreen;
