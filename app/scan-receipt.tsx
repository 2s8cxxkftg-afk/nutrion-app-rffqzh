
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useReceiptScanner, ScannedItem } from '@/hooks/useReceiptScanner';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { addPantryItem } from '@/utils/storage';
import { predictExpirationDate } from '@/utils/expirationHelper';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { isPremiumUser } from '@/utils/subscription';
import React, { useState, useCallback } from 'react';
import Toast from '@/components/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: colors.text,
  },
  resultsContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.grey,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  itemCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '10',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.grey,
    marginLeft: 8,
  },
  dateInputContainer: {
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: colors.grey,
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  selectAllButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  selectAllButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
});

export default function ScanReceiptScreen() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [expirationDates, setExpirationDates] = useState<{ [key: number]: string }>({});
  const { scanReceipt, isLoading } = useReceiptScanner();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const checkPremium = async () => {
        const premium = await isPremiumUser();
        if (!premium) {
          router.replace('/subscription-management');
        }
      };
      checkPremium();
    }, [router])
  );

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to scan receipts.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const items = await scanReceipt(result.assets[0].uri);
      if (items && items.length > 0) {
        setScannedItems(items);
        // Auto-select all items and set predicted expiration dates
        const allIndices = new Set(items.map((_, idx) => idx));
        setSelectedItems(allIndices);
        
        const dates: { [key: number]: string } = {};
        items.forEach((item, idx) => {
          dates[idx] = predictExpirationDate(item.name, true);
        });
        setExpirationDates(dates);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const items = await scanReceipt(result.assets[0].uri);
      if (items && items.length > 0) {
        setScannedItems(items);
        const allIndices = new Set(items.map((_, idx) => idx));
        setSelectedItems(allIndices);
        
        const dates: { [key: number]: string } = {};
        items.forEach((item, idx) => {
          dates[idx] = predictExpirationDate(item.name, true);
        });
        setExpirationDates(dates);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExpirationDateChange = (index: number, text: string) => {
    setExpirationDates(prev => ({ ...prev, [index]: text }));
  };

  const handleAddToPantry = async () => {
    if (selectedItems.size === 0) {
      Toast.show({ message: 'Please select at least one item', type: 'error' });
      return;
    }

    let addedCount = 0;
    for (const index of selectedItems) {
      const item = scannedItems[index];
      const expirationDate = expirationDates[index];

      if (!expirationDate) {
        Toast.show({ message: `Please set expiration date for ${item.name}`, type: 'error' });
        continue;
      }

      await addPantryItem({
        id: Date.now().toString() + index,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'pieces',
        category: item.category || 'other',
        expirationDate,
        dateAdded: new Date().toISOString().split('T')[0],
      });
      addedCount++;
    }

    if (addedCount > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ message: `${addedCount} items added to pantry!`, type: 'success' });
      router.back();
    }
  };

  const selectAll = () => {
    const allIndices = new Set(scannedItems.map((_, idx) => idx));
    setSelectedItems(allIndices);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Scan Receipt', headerShown: true }} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Scanning receipt...</Text>
        </View>
      ) : scannedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <IconSymbol 
              ios_icon_name="doc.text.viewfinder" 
              android_material_icon_name="description" 
              size={80} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.emptyTitle}>Scan Your Receipt</Text>
          <Text style={styles.emptyDescription}>
            Take a photo of your grocery receipt and we&apos;ll automatically extract items with quantities
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <IconSymbol 
                ios_icon_name="camera" 
                android_material_icon_name="camera" 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <IconSymbol 
                ios_icon_name="photo" 
                android_material_icon_name="photo" 
                size={20} 
                color={colors.text} 
              />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {scannedItems.length} Items Found
            </Text>
            <Text style={styles.headerSubtitle}>
              Select items and set expiration dates
            </Text>
          </View>

          {scannedItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.itemCard,
                selectedItems.has(index) && styles.itemCardSelected,
              ]}
              onPress={() => toggleItemSelection(index)}
              activeOpacity={0.7}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>
                  {item.quantity} {item.unit}
                </Text>
              </View>

              {selectedItems.has(index) && (
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Expiration Date (MM/DD/YYYY)</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={expirationDates[index] || ''}
                    onChangeText={(text) => handleExpirationDateChange(index, text)}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor={colors.grey}
                    keyboardType="default"
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={selectedItems.size === scannedItems.length ? deselectAll : selectAll}
              activeOpacity={0.7}
            >
              <Text style={styles.selectAllButtonText}>
                {selectedItems.size === scannedItems.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addButton,
                selectedItems.size === 0 && styles.addButtonDisabled,
              ]}
              onPress={handleAddToPantry}
              disabled={selectedItems.size === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>
                Add {selectedItems.size} to Pantry
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
