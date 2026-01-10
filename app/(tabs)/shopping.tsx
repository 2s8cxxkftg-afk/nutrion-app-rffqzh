
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import AdBanner from '@/components/AdBanner';
import { loadShoppingItems, saveShoppingItems, deleteShoppingItem } from '@/utils/storage';
import * as Haptics from 'expo-haptics';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingItem } from '@/types/pantry';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  addItemContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: spacing.lg,
  },
  shoppingItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  itemQuantity: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
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
  clearButton: {
    margin: spacing.lg,
    backgroundColor: colors.error + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.md,
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
    backgroundColor: colors.textSecondary + '20',
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextSave: {
    color: '#fff',
  },
});

function ShoppingScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ShoppingScreenContent />
    </>
  );
}

function ShoppingScreenContent() {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const loadItems = async () => {
    try {
      const loadedItems = await loadShoppingItems();
      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading shopping items:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    try {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        completed: false,
        quantity: 1,
        unit: 'item',
      };

      const updatedItems = [...items, newItem];
      await saveShoppingItems(updatedItems);
      setItems(updatedItems);
      setNewItemName('');
      Keyboard.dismiss();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      await saveShoppingItems(updatedItems);
      setItems(updatedItems);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
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
              await deleteShoppingItem(itemId);
              await loadItems();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting item:', error);
            }
          },
        },
      ]
    );
  };

  const handleEditQuantity = (item: ShoppingItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity?.toString() || '1');
  };

  const handleSaveQuantity = async () => {
    if (!editingItem) return;

    try {
      const quantity = parseInt(editQuantity) || 1;
      const updatedItems = items.map(item =>
        item.id === editingItem.id ? { ...item, quantity } : item
      );
      await saveShoppingItems(updatedItems);
      setItems(updatedItems);
      setEditingItem(null);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleClearCompleted = async () => {
    const completedCount = items.filter(item => item.completed).length;
    if (completedCount === 0) return;

    Alert.alert(
      'Clear Completed',
      `Remove ${completedCount} completed item${completedCount > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedItems = items.filter(item => !item.completed);
              await saveShoppingItems(updatedItems);
              setItems(updatedItems);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error clearing completed items:', error);
            }
          },
        },
      ]
    );
  };

  const renderShoppingItem = (item: ShoppingItem) => (
    <View key={item.id} style={styles.shoppingItem}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        onPress={() => handleToggleItem(item.id)}
      >
        {item.completed && (
          <IconSymbol
            ios_icon_name="checkmark"
            android_material_icon_name="check"
            size={16}
            color="#fff"
          />
        )}
      </TouchableOpacity>
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.completed && styles.itemNameCompleted]}>
          {item.name}
        </Text>
        {item.quantity && item.quantity > 1 && (
          <Text style={styles.itemQuantity}>
            Quantity: {item.quantity} {item.unit || 'items'}
          </Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditQuantity(item)}
        >
          <IconSymbol
            ios_icon_name="number"
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

  const completedCount = items.filter(item => item.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping List</Text>
        </View>

        <View style={styles.addItemContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add item..."
              placeholderTextColor={colors.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AdBanner onUpgradePress={() => router.push('/subscription-management')} />

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol
                ios_icon_name="cart"
                android_material_icon_name="shopping-cart"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>Your shopping list is empty</Text>
            </View>
          ) : (
            <>
              <View style={styles.listContainer}>
                {items.map(renderShoppingItem)}
              </View>
              {completedCount > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearCompleted}
                >
                  <Text style={styles.clearButtonText}>
                    Clear {completedCount} Completed Item{completedCount > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={editingItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditingItem(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Quantity</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Quantity"
                placeholderTextColor={colors.textSecondary}
                value={editQuantity}
                onChangeText={setEditQuantity}
                keyboardType="number-pad"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setEditingItem(null)}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSaveQuantity}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default ShoppingScreen;
