
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useReceiptScanner, ScannedItem } from '@/hooks/useReceiptScanner';
import * as ImagePicker from 'expo-image-picker';
import { addPantryItem } from '@/utils/storage';
import Toast from '@/components/Toast';
import * as Haptics from 'expo-haptics';
import { isPremiumUser } from '@/utils/subscription';

export default function ScanReceiptScreen() {
  const router = useRouter();
  const { scanReceipt, scanning, error, scannedItems, reset } = useReceiptScanner();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);

  useFocusEffect(
    useCallback(() => {
      checkPremiumStatus();
    }, [])
  );

  const checkPremiumStatus = async () => {
    setCheckingPremium(true);
    const premium = await isPremiumUser();
    setIsPremium(premium);
    setCheckingPremium(false);
  };

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
    // Check premium status
    if (!isPremium) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Toast.show({
        type: 'error',
        text1: 'Premium Feature',
        text2: 'Subscribe to Premium to use Receipt Scanner',
      });
      router.push('/subscription-management');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      await scanReceipt(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    // Check premium status
    if (!isPremium) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Toast.show({
        type: 'error',
        text1: 'Premium Feature',
        text2: 'Subscribe to Premium to use Receipt Scanner',
      });
      router.push('/subscription-management');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      await scanReceipt(result.assets[0].uri);
    }
  };

  const toggleItemSelection = (index: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleAddToPantry = async () => {
    if (!scannedItems || selectedItems.size === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let addedCount = 0;
    for (const index of selectedItems) {
      const item = scannedItems[index];
      try {
        await addPantryItem({
          id: Date.now().toString() + Math.random(),
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category || 'Other',
          expirationDate: item.expirationDate || '',
          dateAdded: new Date().toISOString(),
        });
        addedCount++;
      } catch (err) {
        console.error('Failed to add item:', err);
      }
    }

    Toast.show({
      type: 'success',
      text1: 'Items Added!',
      text2: `${addedCount} items added to your pantry`,
    });

    router.back();
  };

  const selectAll = () => {
    if (scannedItems) {
      setSelectedItems(new Set(scannedItems.map((_, idx) => idx)));
    }
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  if (checkingPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Scan Receipt',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Scan Receipt',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol
                  ios_icon_name="chevron.left"
                  android_material_icon_name="arrow-back"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.premiumGateContainer}>
          <View style={styles.premiumGateIcon}>
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="star"
              size={64}
              color="#FFD700"
            />
          </View>
          <Text style={styles.premiumGateTitle}>Premium Feature</Text>
          <Text style={styles.premiumGateDescription}>
            Receipt Scanner is a premium feature. Subscribe to unlock:
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>AI-powered receipt scanning</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Automatic item extraction</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Quick pantry updates</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>AI Recipe Generator included</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.featureText}>Ad-free experience</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/subscription-management');
            }}
          >
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="star"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonAlt}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonAltText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Scan Receipt',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="doc.text.viewfinder"
            android_material_icon_name="receipt"
            size={32}
            color={colors.primary}
          />
          <Text style={styles.infoTitle}>AI Receipt Scanner</Text>
          <Text style={styles.infoText}>
            Take a photo of your receipt and our AI will extract all food items automatically. Accuracy: 85-92% depending on receipt quality.
          </Text>
          <Text style={styles.tipText}>
            💡 Tip: Ensure good lighting and the receipt is flat for best results
          </Text>
        </View>

        {/* Action Buttons */}
        {!scannedItems && !scanning && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <IconSymbol
                ios_icon_name="camera"
                android_material_icon_name="camera"
                size={24}
                color="#fff"
              />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handlePickImage}
            >
              <IconSymbol
                ios_icon_name="photo"
                android_material_icon_name="image"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scanning State */}
        {scanning && (
          <View style={styles.scanningCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.scanningText}>Analyzing receipt...</Text>
            <Text style={styles.scanningSubtext}>This may take a few seconds</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorCard}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="warning"
              size={24}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                reset();
                setImageUri(null);
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scanned Items */}
        {scannedItems && scannedItems.length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Found {scannedItems.length} items
              </Text>
              <View style={styles.selectionButtons}>
                <TouchableOpacity onPress={selectAll} style={styles.selectionButton}>
                  <Text style={styles.selectionButtonText}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deselectAll} style={styles.selectionButton}>
                  <Text style={styles.selectionButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            {scannedItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.itemCard,
                  selectedItems.has(index) && styles.itemCardSelected,
                ]}
                onPress={() => toggleItemSelection(index)}
              >
                <View style={styles.checkbox}>
                  {selectedItems.has(index) && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={16}
                      color="#fff"
                    />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} {item.unit}
                    {item.category && ` • ${item.category}`}
                    {item.price && ` • $${item.price.toFixed(2)}`}
                  </Text>
                  {item.expirationDate && (
                    <Text style={styles.itemExpiry}>
                      Expires: {new Date(item.expirationDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.addButton,
                selectedItems.size === 0 && styles.addButtonDisabled,
              ]}
              onPress={handleAddToPantry}
              disabled={selectedItems.size === 0}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={20}
                color="#fff"
              />
              <Text style={styles.addButtonText}>
                Add {selectedItems.size} items to Pantry
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => {
                reset();
                setImageUri(null);
                setSelectedItems(new Set());
              }}
            >
              <Text style={styles.scanAgainButtonText}>Scan Another Receipt</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  premiumGateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  premiumGateIcon: {
    marginBottom: spacing.lg,
  },
  premiumGateTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  premiumGateDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  upgradeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButtonAlt: {
    paddingVertical: spacing.sm,
  },
  backButtonAltText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...commonStyles.shadow,
  },
  infoTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButtons: {
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...commonStyles.shadow,
  },
  actionButtonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: typography.sizes.md,
    color: '#fff',
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: colors.primary,
  },
  scanningCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  scanningText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  scanningSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    fontSize: typography.sizes.sm,
    color: '#fff',
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectionButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...commonStyles.shadow,
  },
  itemCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAlt,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.grey,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  itemDetails: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  itemExpiry: {
    fontSize: typography.sizes.xs,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...commonStyles.shadow,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    color: '#fff',
    fontWeight: '600',
  },
  scanAgainButton: {
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  scanAgainButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: '600',
  },
});
