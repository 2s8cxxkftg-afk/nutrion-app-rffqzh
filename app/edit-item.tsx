
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { predictExpirationDateWithAI, parseMMDDYYYYToISO, parseISOToMMDDYYYY } from '@/utils/expirationHelper';
import { PantryItem, FOOD_CATEGORIES, UNITS } from '@/types/pantry';
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
  Modal,
} from 'react-native';
import Toast from '@/components/Toast';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { updatePantryItem, loadPantryItems } from '@/utils/storage';
import { IconSymbol } from '@/components/IconSymbol';
import { categorizeFoodItem } from '@/utils/categoryHelper';
import * as Haptics from 'expo-haptics';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  optionButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary + '20',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  numberInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  numberButton: {
    padding: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
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
  repredictButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  repredictButtonText: {
    fontSize: 14,
    color: colors.text,
  },
});

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const dateInputRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [category, setCategory] = useState('other');
  const [expirationDate, setExpirationDate] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{
    isEarliestDate: boolean;
    estimationText: string;
    daysUntilExpiry: number;
  } | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [autoDetectedCategory, setAutoDetectedCategory] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
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

  const handleQuantityChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setQuantity(cleaned);
  };

  const incrementQuantity = () => {
    console.log('[EditItem] Increment quantity button pressed');
    const current = parseFloat(quantity) || 0;
    setQuantity((current + 1).toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const decrementQuantity = () => {
    console.log('[EditItem] Decrement quantity button pressed');
    const current = parseFloat(quantity) || 0;
    if (current > 0) {
      setQuantity(Math.max(0, current - 1).toString());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

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
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[EditItem] Prediction error:', error);
      setAiPrediction(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!expirationDate.trim() || expirationDate.length !== 10) {
      Toast.show({ message: 'Please enter a valid expiration date (MM/DD/YYYY)', type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const isoDate = parseMMDDYYYYToISO(expirationDate);
    if (!isoDate) {
      Toast.show({ message: 'Invalid date format. Please use MM/DD/YYYY', type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Toast.show({ message: 'Please enter a valid quantity', type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ message: 'Item updated successfully', type: 'success' });
      router.back();
    } catch (error) {
      console.error('[EditItem] Error updating item:', error);
      Toast.show({ message: 'Failed to update item', type: 'error' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function closeAllPickers() {
    setShowCategoryPicker(false);
    setShowUnitPicker(false);
    Keyboard.dismiss();
  }

  function openCategoryPicker() {
    Keyboard.dismiss();
    closeAllPickers();
    setShowCategoryPicker(true);
    setAutoDetectedCategory(false); // User is manually changing category
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function openUnitPicker() {
    Keyboard.dismiss();
    closeAllPickers();
    setShowUnitPicker(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              ref={nameInputRef}
              style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
              value={name}
              onChangeText={handleNameChange}
              placeholder="e.g., Grapes, Salmon, Milk"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="next"
              onSubmitEditing={() => quantityInputRef.current?.focus()}
            />
            
            <TouchableOpacity 
              style={styles.repredictButton}
              onPress={predictExpiration}
              activeOpacity={0.7}
            >
              <Text style={styles.repredictButtonText}>🤖 Re-predict Expiration with AI</Text>
            </TouchableOpacity>
            
            {isLoadingPrediction && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>AI is predicting expiration date...</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Quantity & Unit *</Text>
            <View style={styles.row}>
              <View style={[styles.flex1, { flex: 1.2 }]}>
                <View style={styles.numberInputContainer}>
                  <TouchableOpacity 
                    style={styles.numberButton}
                    onPress={decrementQuantity}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.numberButtonText}>−</Text>
                  </TouchableOpacity>
                  
                  <TextInput
                    ref={quantityInputRef}
                    style={styles.numberInput}
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    returnKeyType="next"
                    onSubmitEditing={() => dateInputRef.current?.focus()}
                  />
                  
                  <TouchableOpacity 
                    style={styles.numberButton}
                    onPress={incrementQuantity}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.numberButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.pickerButton, styles.flex1]}
                onPress={openUnitPicker}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerButtonText}>{getUnitLabel(unit)}</Text>
                <IconSymbol 
                  ios_icon_name="chevron.down" 
                  android_material_icon_name="arrow-drop-down" 
                  size={16} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Use +/− buttons or type quantity directly</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={openCategoryPicker}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerButtonText}>{getCategoryDisplay()}</Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={16}
                color={colors.textSecondary}
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
            <Text style={styles.label}>Expiration Date *</Text>
            <TextInput
              ref={dateInputRef}
              style={[styles.input, focusedInput === 'date' && styles.inputFocused]}
              value={expirationDate}
              onChangeText={handleDateChange}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={10}
              onFocus={() => setFocusedInput('date')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="done"
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

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCategoryPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowCategoryPicker(false)}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {FOOD_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.optionButton,
                      category === cat.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      console.log('[EditItem] User manually selected category:', cat.value);
                      setCategory(cat.value);
                      setShowCategoryPicker(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      category === cat.value && styles.optionTextSelected,
                    ]}>
                      {cat.icon} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Unit Picker Modal */}
        <Modal
          visible={showUnitPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowUnitPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowUnitPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Unit</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowUnitPicker(false)}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u.value}
                    style={[
                      styles.optionButton,
                      unit === u.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      setUnit(u.value);
                      setShowUnitPicker(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      unit === u.value && styles.optionTextSelected,
                    ]}>
                      {u.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
