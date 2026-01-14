
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { predictExpirationDateWithAI, parseMMDDYYYYToISO, parseISOToMMDDYYYY } from '@/utils/expirationHelper';
import { PantryItem, FOOD_CATEGORIES, UNITS, QUANTITY_PRESETS } from '@/types/pantry';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Toast from '@/components/Toast';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { updatePantryItem, loadPantryItems } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import { categorizeFoodItem } from '@/utils/categoryHelper';
import NumberInput from '@/components/NumberInput';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerModal: {
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
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
  },
  unitButton: {
    flex: 1,
  },
  quantityPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  aiPredictionBox: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  aiPredictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiPredictionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  aiPredictionText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  earliestDateBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  earliestDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  autoCategoryBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 4,
  },
});

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [category, setCategory] = useState('other');
  const [expirationDate, setExpirationDate] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{
    isEarliestDate: boolean;
    estimationText: string;
    daysUntilExpiry: number;
  } | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [autoDetectedCategory, setAutoDetectedCategory] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Wrap loadItem with useCallback to stabilize its reference
  const loadItem = useCallback(async () => {
    try {
      console.log('[EditItem] Loading item with id:', id);
      const items = await loadPantryItems();
      const item = items.find((i) => i.id === id);
      
      if (item) {
        console.log('[EditItem] Item found:', item);
        setName(item.name);
        setQuantity(item.quantity.toString());
        setUnit(item.unit);
        setCategory(item.category);
        
        // Convert ISO date to MM/DD/YYYY
        const formattedDate = parseISOToMMDDYYYY(item.expirationDate);
        setExpirationDate(formattedDate);
      } else {
        Toast.show({ message: 'Item not found', type: 'error' });
        router.back();
      }
    } catch (error) {
      console.error('[EditItem] Error loading item:', error);
      Toast.show({ message: 'Failed to load item', type: 'error' });
      router.back();
    }
  }, [id, router]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  function handleNameChange(text: string) {
    setName(text);
    
    // Auto-categorize when name changes
    if (text.trim().length >= 2) {
      const suggestedCategory = categorizeFoodItem(text);
      console.log('[EditItem] Auto-detected category:', suggestedCategory);
      setCategory(suggestedCategory);
      setAutoDetectedCategory(suggestedCategory !== 'other');
    } else {
      setCategory('other');
      setAutoDetectedCategory(false);
    }
  }

  const predictExpiration = async () => {
    if (name.trim().length < 2) return;
    
    setIsLoadingPrediction(true);
    try {
      console.log('[EditItem] Predicting expiration for:', name);
      const prediction = await predictExpirationDateWithAI(name, category, true);
      console.log('[EditItem] AI Prediction result:', prediction);
      
      setExpirationDate(prediction.expirationDate);
      setAiPrediction({
        isEarliestDate: prediction.isEarliestDate,
        estimationText: prediction.estimationText,
        daysUntilExpiry: prediction.daysUntilExpiry,
      });
      
      // Also update category when re-predicting
      const suggestedCategory = categorizeFoodItem(name);
      console.log('[EditItem] Auto-detected category during prediction:', suggestedCategory);
      setCategory(suggestedCategory);
      setAutoDetectedCategory(suggestedCategory !== 'other');
    } catch (error) {
      console.error('[EditItem] Prediction error:', error);
      setAiPrediction(null);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  function handleDateChange(text: string) {
    // Auto-format as user types: MM/DD/YYYY
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5) {
      cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5, 9);
    }
    
    setExpirationDate(cleaned);
  }

  async function handleSave() {
    console.log('[EditItem] Save button pressed');
    
    if (!name.trim()) {
      Toast.show({ message: 'Please enter an item name', type: 'error' });
      return;
    }

    if (!expirationDate.trim() || expirationDate.length !== 10) {
      Toast.show({ message: 'Please enter a valid expiration date (MM/DD/YYYY)', type: 'error' });
      return;
    }

    const isoDate = parseMMDDYYYYToISO(expirationDate);
    if (!isoDate) {
      Toast.show({ message: 'Invalid date format. Please use MM/DD/YYYY', type: 'error' });
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Toast.show({ message: 'Please enter a valid quantity', type: 'error' });
      return;
    }

    try {
      const updatedItem: PantryItem = {
        id: id || '',
        name: name.trim(),
        quantity: quantityNum,
        unit,
        category,
        expirationDate: isoDate,
        dateAdded: new Date().toISOString().split('T')[0],
      };

      console.log('[EditItem] Updating item:', updatedItem);
      await updatePantryItem(updatedItem);
      Toast.show({ message: 'Item updated successfully', type: 'success' });
      router.back();
    } catch (error) {
      console.error('[EditItem] Error updating item:', error);
      Toast.show({ message: 'Failed to update item', type: 'error' });
    }
  }

  function handleQuantityPresetSelect(value: number) {
    setQuantity(value.toString());
    setShowQuantityPicker(false);
  }

  function handleCustomQuantityMode() {
    setShowQuantityPicker(false);
  }

  function closeAllPickers() {
    setShowCategoryPicker(false);
    setShowUnitPicker(false);
    setShowQuantityPicker(false);
    Keyboard.dismiss();
  }

  function openCategoryPicker() {
    closeAllPickers();
    setShowCategoryPicker(true);
    setAutoDetectedCategory(false); // User is manually changing category
  }

  function openUnitPicker() {
    closeAllPickers();
    setShowUnitPicker(true);
  }

  function openQuantityPicker() {
    closeAllPickers();
    setShowQuantityPicker(true);
  }

  function getUnitLabel(unitValue: string): string {
    const unitObj = UNITS.find(u => u.value === unitValue);
    return unitObj ? unitObj.label : unitValue;
  }

  const getCategoryDisplay = (): string => {
    const categoryObj = FOOD_CATEGORIES.find(c => c.value === category);
    return categoryObj ? `${categoryObj.icon} ${categoryObj.label}` : '📦 Other';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Edit Item',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : 16 }}
            >
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow-back"
                size={24} 
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ),
        }} 
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleNameChange}
              placeholder="e.g., Grapes, Salmon, Milk"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            
            <TouchableOpacity 
              style={[styles.presetButton, { marginTop: 8, alignSelf: 'flex-start' }]}
              onPress={predictExpiration}
            >
              <Text style={styles.presetButtonText}>🤖 Re-predict Expiration with AI</Text>
            </TouchableOpacity>
            
            {isLoadingPrediction && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>AI is predicting expiration date...</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Quantity & Unit</Text>
            <View style={styles.quantityRow}>
              <View style={styles.quantityInput}>
                <NumberInput
                  value={quantity}
                  onChangeText={setQuantity}
                  min={0}
                  max={9999}
                  step={1}
                  placeholder="1"
                />
              </View>
              <TouchableOpacity
                style={[styles.pickerButton, styles.unitButton]}
                onPress={openUnitPicker}
              >
                <Text style={styles.pickerButtonText}>{getUnitLabel(unit)}</Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="arrow-drop-down"
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.quantityPresets}>
              {QUANTITY_PRESETS.slice(0, 10).map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  style={styles.presetButton}
                  onPress={() => setQuantity(preset.value.toString())}
                >
                  <Text style={styles.presetButtonText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={openCategoryPicker}
            >
              <Text style={styles.pickerButtonText}>{getCategoryDisplay()}</Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
            
            {autoDetectedCategory && (
              <View style={styles.autoCategoryBadge}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check-circle" 
                  size={14} 
                  color={colors.success} 
                />
                <Text style={styles.autoCategoryText}>Auto-detected from item name</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Expiration Date (MM/DD/YYYY)</Text>
            <TextInput
              style={styles.input}
              value={expirationDate}
              onChangeText={handleDateChange}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={10}
            />
            
            {aiPrediction && (
              <View style={styles.aiPredictionBox}>
                <View style={styles.aiPredictionHeader}>
                  <IconSymbol 
                    ios_icon_name="sparkles" 
                    android_material_icon_name="auto-awesome" 
                    size={16} 
                    color={colors.primary} 
                  />
                  <Text style={styles.aiPredictionTitle}>AI Prediction</Text>
                </View>
                <Text style={styles.aiPredictionText}>{aiPrediction.estimationText}</Text>
                {aiPrediction.isEarliestDate && (
                  <View style={styles.earliestDateBadge}>
                    <Text style={styles.earliestDateText}>Earliest Possible Expiry Date</Text>
                  </View>
                )}
              </View>
            )}
            
            <Text style={styles.hint}>
              {aiPrediction 
                ? 'AI-suggested date (you can edit it)' 
                : 'Enter date in MM/DD/YYYY format'}
            </Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>

        {showCategoryPicker && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeAllPickers}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Category</Text>
                <TouchableOpacity
                  style={styles.pickerCloseButton}
                  onPress={closeAllPickers}
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
                {FOOD_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      console.log('[EditItem] User manually selected category:', cat.value);
                      setCategory(cat.value);
                      closeAllPickers();
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{cat.icon} {cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        )}

        {showUnitPicker && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeAllPickers}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Unit</Text>
                <TouchableOpacity
                  style={styles.pickerCloseButton}
                  onPress={closeAllPickers}
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
                      setUnit(u.value);
                      closeAllPickers();
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{u.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
