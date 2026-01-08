
import { IconSymbol } from '@/components/IconSymbol';
import { ShoppingItem } from '@/types/pantry';
import { loadShoppingItems, saveShoppingItems, deleteShoppingItem } from '@/utils/storage';
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
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Stack, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error + '20',
  },
  clearButtonText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCardCompleted: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    marginLeft: spacing.md,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  itemQuantity: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '80%',
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.surface,
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextSave: {
    color: '#FFFFFF',
  },
});

export default function ShoppingScreen() {
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
  const { t } = useTranslation();
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
    if (!newItemName.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: 1,
      unit: 'pcs',
      completed: false,
      addedAt: new Date().toISOString(),
    };

    const updatedItems = [...items, newItem];
    await saveShoppingItems(updatedItems);
    setItems(updatedItems);
    setNewItemName('');
    Keyboard.dismiss();
  };

  const handleToggleItem = async (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await saveShoppingItems(updatedItems);
    setItems(updatedItems);
  };

  const handleDeleteItem = async (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('shopping.deleteConfirmTitle'),
      t('shopping.deleteConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
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

    const quantity = parseInt(editQuantity) || 1;
    const updatedItems = items.map((item) =>
      item.id === editingItem.id ? { ...item, quantity } : item
    );
    await saveShoppingItems(updatedItems);
    setItems(updatedItems);
    setEditingItem(null);
    setEditQuantity('');
  };

  const handleClearCompleted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('shopping.clearCompletedTitle'),
      t('shopping.clearCompletedMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.clear'),
          style: 'destructive',
          onPress: async () => {
            const updatedItems = items.filter((item) => !item.completed);
            await saveShoppingItems(updatedItems);
            setItems(updatedItems);
          },
        },
      ]
    );
  };

  const completedCount = items.filter((item) => item.completed).length;
  const pendingCount = items.length - completedCount;

  const renderShoppingItem = (item: ShoppingItem) => {
    return (
      <View
        key={item.id}
        style={[styles.itemCard, item.completed && styles.itemCardCompleted]}
      >
        <TouchableOpacity
          style={[styles.checkbox, item.completed && styles.checkboxChecked]}
          onPress={() => handleToggleItem(item.id)}
        >
          {item.completed && (
            <IconSymbol
              ios_icon_name="checkmark"
              android_material_icon_name="check"
              size={16}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemName,
              item.completed && styles.itemNameCompleted,
            ]}
          >
            {item.name}
          </Text>
          <TouchableOpacity onPress={() => handleEditQuantity(item)}>
            <Text style={styles.itemQuantity}>
              {item.quantity} {item.unit}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteItem(item.id)}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={24}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('shopping.title')}</Text>
            {completedCount > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearCompleted}
              >
                <Text style={styles.clearButtonText}>
                  {t('shopping.clearCompleted')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {items.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{items.length}</Text>
                <Text style={styles.statLabel}>{t('shopping.totalItems')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {pendingCount}
                </Text>
                <Text style={styles.statLabel}>{t('shopping.pending')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {completedCount}
                </Text>
                <Text style={styles.statLabel}>{t('shopping.completed')}</Text>
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={24}
              color={colors.primary}
            />
            <TextInput
              style={styles.input}
              placeholder={t('shopping.addItemPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
            {newItemName.trim() && (
              <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                <Text style={styles.addButtonText}>{t('common.add')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol
                ios_icon_name="cart"
                android_material_icon_name="shopping_cart"
                size={80}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                {t('shopping.emptyMessage')}
              </Text>
            </View>
          ) : (
            items.map(renderShoppingItem)
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={editingItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('shopping.editQuantity')}</Text>
            <TextInput
              style={styles.modalInput}
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="numeric"
              placeholder={t('shopping.quantityPlaceholder')}
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditingItem(null)}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextCancel]}
                >
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveQuantity}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextSave]}
                >
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
