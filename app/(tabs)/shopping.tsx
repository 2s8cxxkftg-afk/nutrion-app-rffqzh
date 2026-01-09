
import { Stack, useFocusEffect } from 'expo-router';
import { loadShoppingItems, saveShoppingItems, deleteShoppingItem } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { ShoppingItem } from '@/types/pantry';
import * as Haptics from 'expo-haptics';

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
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  headerStats: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addItemContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error + '20',
  },
  clearButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  itemQuantity: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 24,
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
    padding: spacing.lg,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ShoppingScreenContent />
    </>
  );
}

function ShoppingScreenContent() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const loadItems = React.useCallback(async () => {
    try {
      const loadedItems = await loadShoppingItems();
      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading shopping items:', error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, [loadItems]);

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: 1,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedItems = [...items, newItem];
    await saveShoppingItems(updatedItems);
    setItems(updatedItems);
    setNewItemName('');
    Keyboard.dismiss();
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await saveShoppingItems(updatedItems);
    setItems(updatedItems);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteShoppingItem(itemId);
            await loadItems();
          },
        },
      ]
    );
  };

  const handleEditQuantity = (item: ShoppingItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity.toString());
  };

  const handleSaveQuantity = async () => {
    if (!editingItem) return;

    const quantity = parseInt(editQuantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    const updatedItems = items.map(item =>
      item.id === editingItem.id ? { ...item, quantity } : item
    );
    await saveShoppingItems(updatedItems);
    setItems(updatedItems);
    setEditingItem(null);
    setEditQuantity('');
  };

  const handleClearCompleted = async () => {
    const completedCount = items.filter(item => item.completed).length;
    if (completedCount === 0) return;

    Alert.alert(
      'Clear Completed',
      `Remove all ${completedCount} checked items from the list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const updatedItems = items.filter(item => !item.completed);
            await saveShoppingItems(updatedItems);
            setItems(updatedItems);
          },
        },
      ]
    );
  };

  const pendingItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  const renderShoppingItem = (item: ShoppingItem) => (
    <View key={item.id} style={styles.itemCard}>
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
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.completed && styles.itemNameCompleted]}>
          {item.name}
        </Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditQuantity(item)}
        >
          <IconSymbol
            ios_icon_name="pencil"
            android_material_icon_name="edit"
            size={18}
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
            size={18}
            color={colors.error}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛒 Shopping List</Text>
          <Text style={styles.headerStats}>
            {pendingItems.length === 0 ? '🎉 All done!' : `⚡ ${pendingItems.length} ${pendingItems.length === 1 ? 'item' : 'items'} to grab!`}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.input}
            placeholder="✨ Add item to your list..."
            placeholderTextColor={colors.textSecondary}
            value={newItemName}
            onChangeText={setNewItemName}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol
                ios_icon_name="cart"
                android_material_icon_name="shopping_cart"
                size={80}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>🚀 Ready to Shop!</Text>
              <Text style={styles.emptyDescription}>
                Start adding items you need to buy and make grocery shopping a breeze!
              </Text>
            </View>
          ) : (
            <>
              {pendingItems.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>⚡ To Buy</Text>
                  </View>
                  {pendingItems.map(renderShoppingItem)}
                </>
              )}

              {completedItems.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>✅ Completed</Text>
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClearCompleted}
                    >
                      <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                  {completedItems.map(renderShoppingItem)}
                </>
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
                placeholder="Enter quantity"
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
