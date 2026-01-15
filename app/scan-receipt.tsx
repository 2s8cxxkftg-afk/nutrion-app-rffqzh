
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
  itemHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  deleteButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
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

  const requestCameraPermission = async () => {
    console.log('User tapped Camera button - requesting camera permission');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Camera permission denied by user');
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to scan receipts. You can enable this in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                // On iOS, we can't directly open settings, but the user can do it manually
                Alert.alert('Open Settings', 'Go to Settings > Nutrion > Camera to enable camera access.');
              }
            }
          }
        ]
      );
      return false;
    }
    
    console.log('Camera permission granted');
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    console.log('User tapped Gallery button - requesting media library permission');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Media library permission denied by user');
      Alert.alert(
        'Photo Library Permission Required',
        'Please allow photo library access to select images. You can enable this in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                // On iOS, we can't directly open settings, but the user can do it manually
                Alert.alert('Open Settings', 'Go to Settings > Nutrion > Photos to enable photo library access.');
              }
            }
          }
        ]
      );
      return false;
    }
    
    console.log('Media library permission granted');
    return true;
  };

  const handleTakePhoto = async () => {
    console.log('User initiated take photo action');
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log('Cannot take photo - camera permission not granted');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Launching camera for receipt scanning');

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('Photo captured successfully, scanning receipt');
      const items = await scanReceipt(result.assets[0].uri);
      if (items && items.length > 0) {
        console.log(`Receipt scanned: ${items.length} items found`);
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
      } else {
        console.log('No items found on receipt');
      }
    } else {
      console.log('Photo capture cancelled by user');
    }
  };

  const handlePickImage = async () => {
    console.log('User initiated pick image from gallery action');
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      console.log('Cannot pick image - media library permission not granted');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Launching image picker for receipt scanning');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('Image selected successfully, scanning receipt');
      const items = await scanReceipt(result.assets[0].uri);
      if (items && items.length > 0) {
        console.log(`Receipt scanned: ${items.length} items found`);
        setScannedItems(items);
        const allIndices = new Set(items.map((_, idx) => idx));
        setSelectedItems(allIndices);
        
        const dates: { [key: number]: string } = {};
        items.forEach((item, idx) => {
          dates[idx] = predictExpirationDate(item.name, true);
        });
        setExpirationDates(dates);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.log('No items found on receipt');
      }
    } else {
      console.log('Image selection cancelled by user');
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

  const handleDeleteItem = (index: number, itemName: string) => {
    console.log(`User tapped delete button for item: ${itemName} at index ${index}`);
    
    Alert.alert(
      'Delete Item',
      `Remove "${itemName}" from the scanned list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled by user'),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log(`Deleting item: ${itemName} at index ${index}`);
            
            // Remove the item from scannedItems
            const newScannedItems = scannedItems.filter((_, idx) => idx !== index);
            setScannedItems(newScannedItems);
            
            // Update selectedItems - need to rebuild the set with adjusted indices
            const newSelectedItems = new Set<number>();
            selectedItems.forEach(selectedIdx => {
              if (selectedIdx < index) {
                newSelectedItems.add(selectedIdx);
              } else if (selectedIdx > index) {
                newSelectedItems.add(selectedIdx - 1);
              }
              // Skip if selectedIdx === index (the deleted item)
            });
            setSelectedItems(newSelectedItems);
            
            // Update expirationDates - rebuild with adjusted indices
            const newExpirationDates: { [key: number]: string } = {};
            Object.keys(expirationDates).forEach(key => {
              const idx = parseInt(key);
              if (idx < index) {
                newExpirationDates[idx] = expirationDates[idx];
              } else if (idx > index) {
                newExpirationDates[idx - 1] = expirationDates[idx];
              }
              // Skip if idx === index (the deleted item)
            });
            setExpirationDates(newExpirationDates);
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({ message: `${itemName} removed`, type: 'success' });
            console.log(`Successfully deleted item: ${itemName}`);
          },
        },
      ]
    );
  };

  const handleExpirationDateChange = (index: number, text: string) => {
    setExpirationDates(prev => ({ ...prev, [index]: text }));
  };

  const handleAddToPantry = async () => {
    if (selectedItems.size === 0) {
      Toast.show({ message: 'Please select at least one item', type: 'error' });
      return;
    }

    console.log(`User adding ${selectedItems.size} items to pantry`);
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
      console.log(`Successfully added ${addedCount} items to pantry`);
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
            <View
              key={index}
              style={[
                styles.itemCard,
                selectedItems.has(index) && styles.itemCardSelected,
              ]}
            >
              <View style={styles.itemHeader}>
                <TouchableOpacity
                  style={styles.itemHeaderLeft}
                  onPress={() => toggleItemSelection(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} {item.unit}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(index, item.name)}
                  activeOpacity={0.6}
                >
                  <IconSymbol
                    ios_icon_name="trash"
                    android_material_icon_name="delete"
                    size={20}
                    color="#FF3B30"
                  />
                </TouchableOpacity>
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
            </View>
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
