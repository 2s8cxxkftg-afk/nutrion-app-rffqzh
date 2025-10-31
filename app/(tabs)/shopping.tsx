
import React, { useState, useEffect } from 'react';
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
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { ShoppingItem } from '@/types/pantry';
import { loadShoppingItems, saveShoppingItems } from '@/utils/storage';

export default function ShoppingScreen() {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
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

    const newItem: ShoppingItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim(),
      quantity: 1,
      unit: 'pcs',
      category: 'Other',
      checked: false,
    };

    try {
      const updatedItems = [...shoppingItems, newItem];
      await saveShoppingItems(updatedItems);
      setShoppingItems(updatedItems);
      setNewItemName('');
      setShowAddForm(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleToggleItem = async (itemId: string) => {
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
    <View key={item.id} style={[commonStyles.card, styles.itemCard]}>
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
            <IconSymbol name="checkmark" size={16} color={colors.text} />
          )}
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.itemName,
            item.checked && styles.itemNameChecked
          ]}>
            {item.name}
          </Text>
          <Text style={commonStyles.textSecondary}>
            {item.quantity} {item.unit}
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
          headerShown: true,
          title: 'Shopping List',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      
      <KeyboardAvoidingView 
        style={commonStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.header}>
          <View style={styles.statsRow}>
            <Text style={commonStyles.text}>
              {uncheckedItems.length} items to buy
            </Text>
            {checkedItems.length > 0 && (
              <TouchableOpacity onPress={handleClearCompleted} activeOpacity={0.7}>
                <Text style={styles.clearText}>Clear completed</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={commonStyles.input}
              placeholder="Item name"
              placeholderTextColor={colors.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddItem}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddForm(false);
                  setNewItemName('');
                  Keyboard.dismiss();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.addFormButton]}
                onPress={handleAddItem}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
            <View style={styles.emptyState}>
              <IconSymbol name="cart" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>Shopping list is empty</Text>
              <Text style={commonStyles.textSecondary}>
                Add items you need to buy
              </Text>
            </View>
          ) : (
            <>
              {uncheckedItems.map(renderShoppingItem)}
              {checkedItems.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Completed</Text>
                  {checkedItems.map(renderShoppingItem)}
                </>
              )}
            </>
          )}
        </ScrollView>

        {!showAddForm && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowAddForm(true)}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={28} color={colors.text} />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  addForm: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.textSecondary + '40',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addFormButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
});
