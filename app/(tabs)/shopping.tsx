
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { ShoppingItem } from '@/types/pantry';
import { loadShoppingItems, saveShoppingItems } from '@/utils/storage';
import * as Haptics from 'expo-haptics';

export default function ShoppingScreen() {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [])
  );

  const loadItems = async () => {
    try {
      const items = await loadShoppingItems();
      setShoppingItems(items);
      console.log('Loaded shopping items:', items.length);
    } catch (error) {
      console.error('Error loading shopping items:', error);
      Alert.alert('Error', 'Failed to load shopping items');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const quantityNum = parseFloat(newItemQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const newItem: ShoppingItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim(),
      quantity: quantityNum,
      unit: 'pcs',
      category: 'Other',
      checked: false,
    };

    try {
      const updatedItems = [...shoppingItems, newItem];
      await saveShoppingItems(updatedItems);
      setShoppingItems(updatedItems);
      setNewItemName('');
      setNewItemQuantity('1');
      setShowAddForm(false);
      Keyboard.dismiss();
      
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    try {
      const updatedItems = shoppingItems.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      await saveShoppingItems(updatedItems);
      setShoppingItems(updatedItems);
    } catch (error) {
      console.error('Error toggling item:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = shoppingItems.filter(item => item.id !== itemId);
      await saveShoppingItems(updatedItems);
      setShoppingItems(updatedItems);
      
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleClearCompleted = async () => {
    Alert.alert(
      'Clear Completed',
      'Remove all checked items from the list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedItems = shoppingItems.filter(item => !item.checked);
              await saveShoppingItems(updatedItems);
              setShoppingItems(updatedItems);
            } catch (error) {
              console.error('Error clearing completed items:', error);
              Alert.alert('Error', 'Failed to clear completed items');
            }
          },
        },
      ]
    );
  };

  const uncheckedItems = shoppingItems.filter(item => !item.checked);
  const checkedItems = shoppingItems.filter(item => item.checked);

  const renderShoppingItem = (item: ShoppingItem) => (
    <View key={item.id} style={styles.itemCard}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => handleToggleItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          item.checked && styles.checkboxChecked
        ]}>
          {item.checked && (
            <IconSymbol name="checkmark" size={18} color="#FFFFFF" />
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={[
            styles.itemName,
            item.checked && styles.itemNameChecked
          ]}>
            {item.name}
          </Text>
          <Text style={styles.itemQuantity}>
            Qty: {item.quantity} {item.unit}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDeleteItem(item.id)}
        style={styles.deleteButton}
        activeOpacity={0.7}
      >
        <IconSymbol name="trash" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <KeyboardAvoidingView 
        style={commonStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Shopping List</Text>
            <Text style={styles.headerSubtitle}>
              {uncheckedItems.length} {uncheckedItems.length === 1 ? 'item' : 'items'} to buy
            </Text>
          </View>
          {checkedItems.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearCompleted} 
              activeOpacity={0.7}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <View style={styles.addInputContainer}>
              <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
              <TextInput
                style={styles.addInput}
                placeholder="Item name"
                placeholderTextColor={colors.textSecondary}
                value={newItemName}
                onChangeText={setNewItemName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => {}}
              />
            </View>
            
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityInputContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => {
                    const current = parseFloat(newItemQuantity) || 1;
                    if (current > 1) {
                      setNewItemQuantity((current - 1).toString());
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="minus" size={18} color={colors.text} />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.quantityInput}
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => {
                    const current = parseFloat(newItemQuantity) || 1;
                    setNewItemQuantity((current + 1).toString());
                  }}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="plus" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddForm(false);
                  setNewItemName('');
                  setNewItemQuantity('1');
                  Keyboard.dismiss();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddItem}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Items List */}
        <ScrollView
          style={styles.itemsList}
          contentContainerStyle={styles.itemsListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {uncheckedItems.length === 0 && checkedItems.length === 0 ? (
            <View style={commonStyles.emptyState}>
              <View style={commonStyles.emptyStateIcon}>
                <IconSymbol name="cart" size={64} color={colors.textTertiary} />
              </View>
              <Text style={commonStyles.emptyStateTitle}>Shopping list is empty</Text>
              <Text style={commonStyles.emptyStateDescription}>
                Add items you need to buy from the store
              </Text>
            </View>
          ) : (
            <>
              {/* Unchecked Items */}
              {uncheckedItems.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>To Buy</Text>
                  {uncheckedItems.map(renderShoppingItem)}
                </View>
              )}
              
              {/* Checked Items */}
              {checkedItems.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Completed</Text>
                  {checkedItems.map(renderShoppingItem)}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* FAB */}
        {!showAddForm && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowAddForm(true)}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.md,
  },
  clearText: {
    ...typography.label,
    color: colors.error,
  },
  addForm: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  addInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: `0px 4px 12px ${colors.primary}20`,
    elevation: 3,
  },
  addInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: spacing.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    minWidth: 60,
    paddingHorizontal: spacing.sm,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.h4,
    color: colors.text,
  },
  addButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
    boxShadow: `0px 4px 12px ${colors.primary}40`,
    elevation: 4,
  },
  addButtonText: {
    ...typography.h4,
    color: '#FFFFFF',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemInfo: {
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
  itemQuantity: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 100,
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 8px 24px ${colors.primary}60`,
    elevation: 8,
  },
});
