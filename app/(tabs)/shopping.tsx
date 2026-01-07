
import { ShoppingItem } from '@/types/pantry';
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
import { Stack, useFocusEffect } from 'expo-router';
import { loadShoppingItems, saveShoppingItems, deleteShoppingItem } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { SubscriptionGate } from '@/components/SubscriptionGate';

export default function ShoppingScreen() {
  return (
    <SubscriptionGate>
      <ShoppingScreenContent />
    </SubscriptionGate>
  );
}

function ShoppingScreenContent() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [])
  );

  const loadItems = async () => {
    try {
      const loadedItems = await loadShoppingItems();
      setItems(loadedItems);
      console.log('Loaded shopping items:', loadedItems.length);
    } catch (error) {
      console.error('Error loading shopping items:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      return;
    }

    const quantity = parseFloat(newItemQuantity) || 1;
    if (quantity <= 0) {
      Alert.alert(t('error'), t('shopping.enterValidQuantity'));
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    const newItem: ShoppingItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim(),
      quantity: quantity,
      unit: 'pcs',
      category: 'Other',
      checked: false,
    };

    const updatedItems = [...items, newItem];
    await saveShoppingItems(updatedItems);
    setItems(updatedItems);
    setNewItemName('');
    setNewItemQuantity('1');
    Keyboard.dismiss();
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
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

    const itemToDelete = items.find(item => item.id === itemId);
    const itemName = itemToDelete?.name || 'this item';

    Alert.alert(
      t('delete'),
      `${t('shopping.deleteConfirm')} "${itemName}"?`,
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
              console.log('Deleting shopping item:', itemId);
              
              // Delete from storage first
              await deleteShoppingItem(itemId);
              
              // Then update UI
              const updatedItems = items.filter(item => item.id !== itemId);
              setItems(updatedItems);
              
              console.log('Shopping item deleted successfully');
            } catch (error: any) {
              console.error('Error deleting shopping item:', error);
              
              // Reload items to restore state if deletion failed
              await loadItems();
              
              Alert.alert(
                t('error'),
                error?.message || t('shopping.deleteItemError') || 'Failed to delete item'
              );
            }
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

    const quantity = parseFloat(editQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert(t('error'), t('shopping.enterValidQuantity'));
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
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
    const completedItems = items.filter(item => item.checked);
    const completedCount = completedItems.length;
    
    if (completedCount === 0) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    Alert.alert(
      t('shopping.clearCompleted'),
      t('shopping.clearCompletedConfirm') || `Remove ${completedCount} completed items?`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('shopping.clear') || 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Clearing completed items, count:', completedCount);
              
              // Filter out checked items
              const updatedItems = items.filter(item => !item.checked);
              
              // Save to storage first
              await saveShoppingItems(updatedItems);
              
              // Then update UI
              setItems(updatedItems);
              
              console.log('✅ Completed items cleared successfully');
              console.log('Remaining items:', updatedItems.length);
            } catch (error: any) {
              console.error('Error clearing completed items:', error);
              
              // Reload items to restore state if clearing failed
              await loadItems();
              
              Alert.alert(
                t('error'),
                error?.message || t('shopping.clearCompletedError') || 'Failed to clear completed items'
              );
            }
          },
        },
      ]
    );
  };

  const renderShoppingItem = (item: ShoppingItem) => (
    <View key={item.id} style={styles.itemCard}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleToggleItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          item.checked && styles.checkboxChecked
        ]}>
          {item.checked && (
            <IconSymbol 
              ios_icon_name="checkmark" 
              android_material_icon_name="check"
              size={18} 
              color="#FFFFFF" 
            />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <Text style={[
          styles.itemName,
          item.checked && styles.itemNameChecked
        ]}>
          {item.name}
        </Text>
        <TouchableOpacity 
          onPress={() => handleEditQuantity(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.itemDetails}>
            {item.quantity} {item.unit} • {t('edit')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e?.stopPropagation?.();
          handleDeleteItem(item.id);
        }}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <IconSymbol 
          ios_icon_name="trash" 
          android_material_icon_name="delete"
          size={20} 
          color={colors.error} 
        />
      </TouchableOpacity>
    </View>
  );

  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[commonStyles.container, Platform.OS === 'android' && { paddingTop: 24 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('shopping.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {uncheckedItems.length} {t('shopping.itemsRemaining')}
            </Text>
          </View>

          {/* Add Item Input */}
          <View style={styles.addItemContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.addItemInput}
                placeholder={t('shopping.addItemPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={newItemName}
                onChangeText={setNewItemName}
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
              />
              <TextInput
                style={styles.quantityInput}
                placeholder={t('shopping.qty')}
                placeholderTextColor={colors.textSecondary}
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.addButton,
                !newItemName.trim() && styles.addButtonDisabled
              ]}
              onPress={handleAddItem}
              disabled={!newItemName.trim()}
              activeOpacity={0.7}
            >
              <IconSymbol 
                ios_icon_name="plus" 
                android_material_icon_name="add"
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>

          {/* Clear Completed Button */}
          {checkedItems.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCompleted}
              activeOpacity={0.7}
            >
              <IconSymbol 
                ios_icon_name="trash" 
                android_material_icon_name="delete"
                size={18} 
                color={colors.error} 
              />
              <Text style={styles.clearButtonText}>
                {t('shopping.clearCompleted')} ({checkedItems.length})
              </Text>
            </TouchableOpacity>
          )}

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
            {items.length === 0 ? (
              <View style={commonStyles.emptyState}>
                <View style={commonStyles.emptyStateIcon}>
                  <IconSymbol 
                    ios_icon_name="cart" 
                    android_material_icon_name="shopping_cart"
                    size={64} 
                    color={colors.textTertiary} 
                  />
                </View>
                <Text style={commonStyles.emptyStateTitle}>
                  {t('shopping.emptyTitle')}
                </Text>
                <Text style={commonStyles.emptyStateDescription}>
                  {t('shopping.emptyDescription')}
                </Text>
              </View>
            ) : (
              <React.Fragment>
                {/* Unchecked Items */}
                {uncheckedItems.map(renderShoppingItem)}

                {/* Checked Items */}
                {checkedItems.length > 0 && (
                  <React.Fragment>
                    <View style={styles.sectionDivider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.sectionTitle}>
                        {t('shopping.completed')} ({checkedItems.length})
                      </Text>
                      <View style={styles.dividerLine} />
                    </View>
                    {checkedItems.map(renderShoppingItem)}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Edit Quantity Modal */}
      <Modal
        visible={editingItem !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditingItem(null)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>{t('shopping.quantity')}</Text>
            <Text style={styles.modalSubtitle}>{editingItem?.name}</Text>
            
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={editQuantity}
                onChangeText={setEditQuantity}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
              <Text style={styles.modalUnit}>{editingItem?.unit || 'pcs'}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditingItem(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextCancel}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveQuantity}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonTextSave}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  addItemContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityInput: {
    width: 70,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0px 2px 8px ${colors.primary}40`,
      },
    }),
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  clearButtonText: {
    ...typography.label,
    color: colors.error,
    fontWeight: '600',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
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
        boxShadow: `0px 2px 8px ${colors.shadow}`,
      },
    }),
  },
  checkboxContainer: {
    padding: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  itemDetails: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  modalInput: {
    flex: 1,
    ...typography.displaySmall,
    color: colors.text,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  modalUnit: {
    ...typography.h3,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonTextCancel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  modalButtonTextSave: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
