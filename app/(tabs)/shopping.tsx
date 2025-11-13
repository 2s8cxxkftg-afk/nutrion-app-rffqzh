
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
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { loadShoppingItems, saveShoppingItems } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function ShoppingScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    const newItem: ShoppingItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim(),
      quantity: 1,
      unit: 'pcs',
      category: 'Other',
      checked: false,
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

    Alert.alert(
      t('delete'),
      t('shopping.deleteConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const updatedItems = items.filter(item => item.id !== itemId);
            await saveShoppingItems(updatedItems);
            setItems(updatedItems);
          },
        },
      ]
    );
  };

  const handleClearCompleted = async () => {
    const completedCount = items.filter(item => item.checked).length;
    
    if (completedCount === 0) {
      return;
    }

    Alert.alert(
      t('shopping.clearCompleted'),
      t('shopping.clearCompletedConfirm', { count: completedCount }),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('shopping.clear'),
          style: 'destructive',
          onPress: async () => {
            const updatedItems = items.filter(item => !item.checked);
            await saveShoppingItems(updatedItems);
            setItems(updatedItems);
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
        <Text style={styles.itemDetails}>
          {item.quantity} {item.unit}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteItem(item.id)}
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
            <TextInput
              style={styles.addItemInput}
              placeholder={t('shopping.addItemPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
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
                    android_material_icon_name="shopping-cart"
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
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px 2px 8px ${colors.primary}40`,
    elevation: 2,
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
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
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
    color: colors.textSecondary,
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
});
