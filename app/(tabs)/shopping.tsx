
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { loadShoppingItems, saveShoppingItems, deleteShoppingItem } from '@/utils/storage';
import * as Haptics from 'expo-haptics';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingItem, UNITS } from '@/types/pantry';
import NumberInput from '@/components/NumberInput';
import Toast from '@/components/Toast';

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
  header: {
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  addItemContainer: {
    padding: spacing.large,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    fontSize: typography.fontSize.medium,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  quantityInputContainer: {
    flex: 1,
  },
  unitPickerButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPickerText: {
    fontSize: typography.fontSize.medium,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.small,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.medium,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.large,
  },
  shoppingItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    marginBottom: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...commonStyles.shadow,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.medium,
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
    fontSize: typography.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  itemQuantity: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.small,
    marginLeft: spacing.small,
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
    fontSize: typography.fontSize.large,
    color: colors.text,
    marginTop: spacing.large,
    textAlign: 'center',
    fontWeight: '600',
  },
  clearButton: {
    margin: spacing.large,
    backgroundColor: colors.error + '15',
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  clearButtonText: {
    color: colors.error,
    fontSize: typography.fontSize.medium,
    fontWeight: '600',
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
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.fontSize.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  modalInputRow: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  modalQuantityInput: {
    flex: 1,
  },
  modalUnitPicker: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalUnitText: {
    fontSize: typography.fontSize.medium,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  modalButton: {
    flex: 1,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonDelete: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    fontSize: typography.fontSize.medium,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextSave: {
    color: '#FFFFFF',
  },
  modalButtonTextDelete: {
    color: '#FFFFFF',
  },
  unitPickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  pickerCloseButton: {
    padding: 4,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  labelText: {
    fontSize: typography.fontSize.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
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
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('pieces');
  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('pieces');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showAddUnitPicker, setShowAddUnitPicker] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [clearCompletedModalVisible, setClearCompletedModalVisible] = useState(false);

  const loadItems = async () => {
    try {
      console.log('[Shopping] Loading shopping items...');
      const loadedItems = await loadShoppingItems();
      setItems(loadedItems);
      console.log('[Shopping] Shopping items loaded:', loadedItems.length);
    } catch (error) {
      console.error('[Shopping] Error loading shopping items:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('[Shopping] Screen focused - loading items');
      loadItems();
    }, [])
  );

  const onRefresh = async () => {
    console.log('[Shopping] User refreshing shopping list');
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      console.log('[Shopping] Cannot add item - name is empty');
      return;
    }

    try {
      const quantity = parseFloat(newItemQuantity) || 1;
      console.log('[Shopping] User adding shopping item:', newItemName, 'Quantity:', quantity, newItemUnit);

      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        completed: false,
        quantity: quantity,
        unit: newItemUnit,
      };

      const updatedItems = [...items, newItem];
      await saveShoppingItems(updatedItems);
      setItems(updatedItems);
      setNewItemName('');
      setNewItemQuantity('1');
      setNewItemUnit('pieces');
      Keyboard.dismiss();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show(`${newItem.name} added`, 'success');
      console.log('[Shopping] Shopping item added successfully');
    } catch (error) {
      console.error('[Shopping] Error adding shopping item:', error);
      Toast.show('Failed to add item', 'error');
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      console.log('[Shopping] User toggling shopping item:', itemId);
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      await saveShoppingItems(updatedItems);
      setItems(updatedItems);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('[Shopping] Error toggling shopping item:', error);
    }
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    console.log('[Shopping] Delete button pressed for item:', itemName, 'ID:', itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Store the item to delete and show modal
    setItemToDelete({ id: itemId, name: itemName });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) {
      console.log('[Shopping] confirmDelete called but no item to delete');
      return;
    }

    try {
      console.log('[Shopping] User confirmed delete - starting deletion process');
      console.log('[Shopping] Deleting shopping item:', itemToDelete.name, 'ID:', itemToDelete.id);
      
      // Close modal first
      setDeleteModalVisible(false);
      
      // Provide haptic feedback for delete action
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Delete the item from storage
      await deleteShoppingItem(itemToDelete.id);
      console.log('[Shopping] Item deleted from storage');
      
      // Reload items to update UI
      await loadItems();
      console.log('[Shopping] Items reloaded after delete');
      
      // Show success message
      Toast.show(`${itemToDelete.name} deleted`, 'success');
      console.log('[Shopping] Delete operation completed successfully');
      
      // Clear the item to delete
      setItemToDelete(null);
    } catch (error) {
      console.error('[Shopping] Error deleting shopping item:', error);
      Toast.show('Failed to delete item', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('[Shopping] User cancelled delete');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleEditQuantity = (item: ShoppingItem) => {
    console.log('[Shopping] User tapped Edit button for:', item.name);
    setEditingItem(item);
    setEditQuantity(item.quantity?.toString() || '1');
    setEditUnit(item.unit || 'pieces');
  };

  const handleSaveQuantity = async () => {
    if (!editingItem) return;

    try {
      const quantity = parseFloat(editQuantity) || 1;
      console.log('[Shopping] Saving quantity update:', editingItem.name, 'New quantity:', quantity, editUnit);
      const updatedItems = items.map(item =>
        item.id === editingItem.id ? { ...item, quantity, unit: editUnit } : item
      );
      await saveShoppingItems(updatedItems);
      setItems(updatedItems);
      setEditingItem(null);
      setShowUnitPicker(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show('Quantity updated', 'success');
      console.log('[Shopping] Quantity updated successfully');
    } catch (error) {
      console.error('[Shopping] Error updating quantity:', error);
      Toast.show('Failed to update quantity', 'error');
    }
  };

  const handleClearCompleted = () => {
    const completedCount = items.filter(item => item.completed).length;
    if (completedCount === 0) return;

    console.log('[Shopping] User tapped clear completed items button');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setClearCompletedModalVisible(true);
  };

  const confirmClearCompleted = async () => {
    const completedCount = items.filter(item => item.completed).length;
    
    try {
      console.log('[Shopping] User confirmed clear completed items');
      setClearCompletedModalVisible(false);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      console.log('[Shopping] Clearing completed shopping items');
      const updatedItems = items.filter(item => !item.completed);
      await saveShoppingItems(updatedItems);
      setItems(updatedItems);
      
      Toast.show(`${completedCount} item${completedCount > 1 ? 's' : ''} cleared`, 'success');
      console.log('[Shopping] Completed items cleared successfully');
    } catch (error) {
      console.error('[Shopping] Error clearing completed items:', error);
      Toast.show('Failed to clear items', 'error');
    }
  };

  const cancelClearCompleted = () => {
    console.log('[Shopping] User cancelled clear completed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setClearCompletedModalVisible(false);
  };

  const getUnitLabel = (unitValue: string): string => {
    const unitObj = UNITS.find(u => u.value === unitValue);
    return unitObj ? unitObj.label : unitValue;
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
        {item.quantity && item.quantity > 0 && (
          <Text style={styles.itemQuantity}>
            Quantity: {item.quantity} {getUnitLabel(item.unit || 'pieces')}
          </Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditQuantity(item)}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="number"
            android_material_icon_name="edit"
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteItem(item.id, item.name)}
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
          <Text style={styles.labelText}>Item Name</Text>
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
          </View>

          <Text style={styles.labelText}>Quantity & Unit</Text>
          <View style={styles.quantityRow}>
            <View style={styles.quantityInputContainer}>
              <NumberInput
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                min={0}
                max={9999}
                step={1}
                placeholder="1"
              />
            </View>
            <TouchableOpacity
              style={styles.unitPickerButton}
              onPress={() => {
                console.log('[Shopping] User tapped unit picker for new item');
                setShowAddUnitPicker(true);
              }}
            >
              <Text style={styles.unitPickerText}>{getUnitLabel(newItemUnit)}</Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={20}
              color="#fff"
            />
            <Text style={styles.addButtonText}>Add to List</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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

      {/* Edit Quantity Modal */}
      <Modal
        visible={editingItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log('[Shopping] User closed edit modal');
          setEditingItem(null);
          setShowUnitPicker(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Quantity & Unit</Text>
            
            <Text style={styles.modalLabel}>Quantity</Text>
            <View style={styles.modalInputRow}>
              <View style={styles.modalQuantityInput}>
                <NumberInput
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  min={0}
                  max={9999}
                  step={1}
                  placeholder="1"
                />
              </View>
              <TouchableOpacity
                style={styles.modalUnitPicker}
                onPress={() => {
                  console.log('[Shopping] User tapped unit picker in edit modal');
                  setShowUnitPicker(true);
                }}
              >
                <Text style={styles.modalUnitText}>{getUnitLabel(editUnit)}</Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="arrow-drop-down"
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('[Shopping] User cancelled edit');
                  setEditingItem(null);
                  setShowUnitPicker(false);
                }}
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
        </View>
      </Modal>

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
                  console.log('[Shopping] Cancel button pressed in delete modal');
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
                  console.log('[Shopping] Delete button pressed in delete modal');
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

      {/* Clear Completed Confirmation Modal */}
      <Modal
        visible={clearCompletedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelClearCompleted}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clear Completed Items</Text>
            <Text style={styles.modalMessage}>
              Remove {completedCount} completed item{completedCount > 1 ? 's' : ''}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('[Shopping] Cancel button pressed in clear completed modal');
                  cancelClearCompleted();
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={() => {
                  console.log('[Shopping] Clear button pressed in clear completed modal');
                  confirmClearCompleted();
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextDelete]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Unit Picker Modal */}
      {showUnitPicker && (
        <Modal
          visible={showUnitPicker}
          transparent
          animationType="slide"
          onRequestClose={() => {
            console.log('[Shopping] User closed unit picker');
            setShowUnitPicker(false);
          }}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              console.log('[Shopping] User tapped outside unit picker to close');
              setShowUnitPicker(false);
            }}
          >
            <View style={styles.unitPickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Unit</Text>
                <TouchableOpacity
                  style={styles.pickerCloseButton}
                  onPress={() => {
                    console.log('[Shopping] User tapped close button on unit picker');
                    setShowUnitPicker(false);
                  }}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      console.log('[Shopping] User selected unit:', u.label);
                      setEditUnit(u.value);
                      setShowUnitPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{u.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Add Unit Picker Modal */}
      {showAddUnitPicker && (
        <Modal
          visible={showAddUnitPicker}
          transparent
          animationType="slide"
          onRequestClose={() => {
            console.log('[Shopping] User closed add unit picker');
            setShowAddUnitPicker(false);
          }}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              console.log('[Shopping] User tapped outside add unit picker to close');
              setShowAddUnitPicker(false);
            }}
          >
            <View style={styles.unitPickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Unit</Text>
                <TouchableOpacity
                  style={styles.pickerCloseButton}
                  onPress={() => {
                    console.log('[Shopping] User tapped close button on add unit picker');
                    setShowAddUnitPicker(false);
                  }}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      console.log('[Shopping] User selected unit for new item:', u.label);
                      setNewItemUnit(u.value);
                      setShowAddUnitPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{u.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

export default ShoppingScreen;
