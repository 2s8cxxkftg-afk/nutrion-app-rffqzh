
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
import { ShoppingItem, UNITS } from '@/types/pantry';
import NumberInput from '@/components/NumberInput';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: spacing.large,
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
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    fontSize: typography.fontSize.medium,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '500',
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
  },
  actionButton: {
    padding: spacing.small,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.fontSize.large,
    color: colors.textSecondary,
    marginTop: spacing.large,
    textAlign: 'center',
  },
  clearButton: {
    margin: spacing.large,
    backgroundColor: colors.error + '15',
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
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
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.large,
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.textSecondary + '20',
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: typography.fontSize.medium,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextSave: {
    color: '#fff',
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
  const [editUnit, setEditUnit] = useState('item');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

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
    setEditUnit(item.unit || 'item');
  };

  const handleSaveQuantity = async () => {
    if (!editingItem) return;

    try {
      const quantity = parseFloat(editQuantity) || 1;
      const updatedItems = items.map(item =>
        item.id === editingItem.id ? { ...item, quantity, unit: editUnit } : item
      );
      await saveShoppingItems(updatedItems);
      setItems(updatedItems);
      setEditingItem(null);
      setShowUnitPicker(false);
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
            Quantity: {item.quantity} {getUnitLabel(item.unit || 'item')}
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
          <AdBanner />

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
        onRequestClose={() => {
          setEditingItem(null);
          setShowUnitPicker(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setEditingItem(null);
            setShowUnitPicker(false);
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
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
                  onPress={() => setShowUnitPicker(true)}
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
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {showUnitPicker && (
        <Modal
          visible={showUnitPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowUnitPicker(false)}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowUnitPicker(false)}
          >
            <View style={styles.unitPickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Unit</Text>
                <TouchableOpacity
                  style={styles.pickerCloseButton}
                  onPress={() => setShowUnitPicker(false)}
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
    </SafeAreaView>
  );
}

export default ShoppingScreen;
