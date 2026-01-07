
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { PantryItem } from '@/types/pantry';
import { colors, commonStyles, expirationColors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { checkAndNotifyExpiringItems } from '@/utils/notificationScheduler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadPantryItems, deletePantryItem } from '@/utils/storage';
import { getExpirationStatus, formatExpirationText } from '@/utils/expirationHelper';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Toast from '@/components/Toast';
import React, { useState, useCallback } from 'react';

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
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    marginLeft: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
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
  itemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemDetails: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  expirationBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  expirationText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold as any,
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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default function PantryScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <PantryScreenContent />
    </>
  );
}

function PantryScreenContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const loadedItems = await loadPantryItems();
      setItems(loadedItems);
      await checkAndNotifyExpiringItems(loadedItems);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      Toast.show(t('pantry.errorLoading'), 'error');
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, [loadItems]);

  const handleEditItem = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/edit-item?itemId=${itemId}`);
  };

  const handleDeleteItem = async (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('pantry.deleteConfirmTitle'),
      t('pantry.deleteConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePantryItem(itemId);
              await loadItems();
              Toast.show(t('pantry.itemDeleted'), 'success');
            } catch (error) {
              console.error('Error deleting item:', error);
              Toast.show(t('pantry.errorDeleting'), 'error');
            }
          },
        },
      ]
    );
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const expiredCount = items.filter(
    (item) => getExpirationStatus(item.expirationDate).status === 'expired'
  ).length;
  const expiringSoonCount = items.filter(
    (item) => getExpirationStatus(item.expirationDate).status === 'expiring'
  ).length;

  const renderPantryItem = (item: PantryItem) => {
    const expirationInfo = getExpirationStatus(item.expirationDate);
    const expirationText = formatExpirationText(item.expirationDate);

    return (
      <View key={item.id} style={styles.itemCard}>
        <IconSymbol
          ios_icon_name="cube.box.fill"
          android_material_icon_name="inventory"
          size={40}
          color={expirationColors[expirationInfo.status]}
        />
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            {item.quantity} {item.unit} • {item.category}
          </Text>
          <View
            style={[
              styles.expirationBadge,
              { backgroundColor: expirationColors[expirationInfo.status] + '20' },
            ]}
          >
            <Text
              style={[
                styles.expirationText,
                { color: expirationColors[expirationInfo.status] },
              ]}
            >
              {expirationText}
            </Text>
          </View>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditItem(item.id)}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={24}
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
          <Text style={styles.title}>{t('pantry.title')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/add-item');
            }}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.addButtonText}>{t('pantry.addItem')}</Text>
          </TouchableOpacity>
        </View>

        {items.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{items.length}</Text>
              <Text style={styles.statLabel}>{t('pantry.totalItems')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: expirationColors.expiring }]}>
                {expiringSoonCount}
              </Text>
              <Text style={styles.statLabel}>{t('pantry.expiringSoon')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: expirationColors.expired }]}>
                {expiredCount}
              </Text>
              <Text style={styles.statLabel}>{t('pantry.expired')}</Text>
            </View>
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.searchContainer}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('pantry.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="cube.box"
              android_material_icon_name="inventory"
              size={80}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              {searchQuery
                ? t('pantry.noResults')
                : t('pantry.emptyMessage')}
            </Text>
          </View>
        ) : (
          filteredItems.map(renderPantryItem)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
