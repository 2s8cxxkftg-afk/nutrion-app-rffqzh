
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { categorizeFoodItem } from '@/utils/categoryHelper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { predictExpirationDateWithAI, parseMMDDYYYYToISO, formatDateToMMDDYYYY } from '@/utils/expirationHelper';
import { IconSymbol } from '@/components/IconSymbol';
import { PantryItem, FOOD_CATEGORIES, UNITS } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Toast from '@/components/Toast';
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
  dateInputContainer: {
    position: 'relative',
  },
  clearDateButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    zIndex: 10,
  },
});

export default function AddItemScreen() {
  const nameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const dateInputRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<string>('pieces');
  const [category, setCategory] = useState<string>('other');
  const [expirationDate, setExpirationDate] = useState('');
  const [dateText, setDateText] = useState('');
  const [aiPrediction, setAiPrediction] = useState<{
    isEarliestDate: boolean;
    estimationText: string;
    daysUntilExpiry: number;
  } | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [autoDetectedCategory, setAutoDetectedCategory] = useState(false);

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const router = useRouter();

  const predictExpiration = useCallback(async () => {
    setIsLoadingPrediction(true);
    try {
      const prediction = await predictExpirationDateWithAI(name, category, true);
      console.log('[AddItem] AI Prediction result:', prediction);
      
      setExpirationDate(prediction.expirationDate);
      setDateText(prediction.expirationDate);
      setAiPrediction({
        isEarliestDate: prediction.isEarliestDate,
        estimationText: prediction.estimationText,
        daysUntilExpiry: prediction.daysUntilExpiry,
      });
    } catch (error) {
      console.error('[AddItem] Prediction error:', error);
      setAiPrediction(null);
    } finally {
      setIsLoadingPrediction(false);
    }
  }, [name, category]);

  useEffect(() => {
    if (name.trim().length >= 2) {
      console.log('[AddItem] Name changed, predicting expiration and category for:', name);
      predictExpiration();
      
      // Auto-categorize based on item name
      const suggestedCategory = categorizeFoodItem(name);
      console.log('[AddItem] Auto-detected category:', suggestedCategory);
      setCategory(suggestedCategory);
      setAutoDetectedCategory(suggestedCategory !== 'other');
    } else {
      setAiPrediction(null);
      setExpirationDate('');
      setDateText('');
      setCategory('other');
      setAutoDetectedCategory(false);
    }
  }, [name, predictExpiration]);

  const handleNameChange = (text: string) => {
    setName(text);
  };

  const handleQuantityChange = (text: string) => {
    console.log('[AddItem] User manually entering quantity:', text);
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setQuantity(cleaned);
  };

  const handleDateChange = (text: string) => {
    console.log('[AddItem] Date input changed:', text);
    
    // If user is deleting (text is shorter than current), allow it
    if (text.length < dateText.length) {
      setDateText(text);
      // Clear expiration date if text is empty
      if (text.length === 0) {
        setExpirationDate('');
      }
      return;
    }
    
    // Auto-format as user types: MM/DD/YYYY
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5) {
      cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5, 9);
    }
    
    setDateText(cleaned);
    
    // Validate complete date
    if (cleaned.length === 10) {
      const isoDate = parseMMDDYYYYToISO(cleaned);
      if (isoDate) {
        setExpirationDate(cleaned);
      }
    }
  };

  const handleClearDate = () => {
    console.log('[AddItem] User cleared expiration date');
    setDateText('');
    setExpirationDate('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    console.log('[AddItem] Save button pressed');
    
    if (!name.trim()) {
      Toast.show('Please enter an item name', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (!quantityNum || quantityNum <= 0) {
      Toast.show('Please enter a valid quantity', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!expirationDate || expirationDate.length !== 10) {
      Toast.show('Please enter a valid expiration date (MM/DD/YYYY)', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const isoDate = parseMMDDYYYYToISO(expirationDate);
    if (!isoDate) {
      Toast.show('Invalid date format. Please use MM/DD/YYYY', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: quantityNum,
      unit,
      category,
      expirationDate: isoDate,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    console.log('[AddItem] Adding item to pantry:', newItem);
    
    try {
      await addPantryItem(newItem);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show(`${name} added to pantry!`, 'success');
      router.back();
    } catch (error) {
      console.error('[AddItem] Error adding item:', error);
      Toast.show('Failed to add item. Please try again.', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const closeAllPickers = () => {
    setShowCategoryPicker(false);
    setShowUnitPicker(false);
  };

  const openCategoryPicker = () => {
    Keyboard.dismiss();
    closeAllPickers();
    setShowCategoryPicker(true);
    setAutoDetectedCategory(false); // User is manually changing category
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openUnitPicker = () => {
    Keyboard.dismiss();
    closeAllPickers();
    setShowUnitPicker(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getUnitLabel = (unitValue: string): string => {
    const unitObj = UNITS.find(u => u.value === unitValue);
    return unitObj ? unitObj.label : unitValue;
  };

  const getCategoryDisplay = (): string => {
    const categoryObj = FOOD_CATEGORIES.find(c => c.value === category);
    return categoryObj ? `${categoryObj.icon} ${categoryObj.label}` : '📦 Other';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Add Item', headerShown: true }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              ref={nameInputRef}
              style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
              placeholder="e.g., Grapes, Salmon, Milk"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={handleNameChange}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => quantityInputRef.current?.focus()}
            />
            
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
                <TextInput
                  ref={quantityInputRef}
                  style={[styles.input, focusedInput === 'quantity' && styles.inputFocused]}
                  value={quantity}
                  onChangeText={handleQuantityChange}
                  onFocus={() => setFocusedInput('quantity')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="next"
                  onSubmitEditing={() => dateInputRef.current?.focus()}
                />
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
            <Text style={styles.hint}>Enter quantity manually</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={openCategoryPicker}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerButtonText}>
                {getCategoryDisplay()}
              </Text>
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
            <View style={styles.dateInputContainer}>
              <TextInput
                ref={dateInputRef}
                style={[styles.input, focusedInput === 'date' && styles.inputFocused]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.textSecondary}
                value={dateText}
                onChangeText={handleDateChange}
                onFocus={() => setFocusedInput('date')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="done"
              />
              {dateText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={handleClearDate}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            
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
                ? 'AI-suggested date (tap X to clear and enter your own)' 
                : 'Enter date in MM/DD/YYYY format'}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Add to Pantry</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={[styles.modalOverlay, { pointerEvents: 'box-none' }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowCategoryPicker(false)}
          />
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
                    console.log('[AddItem] User manually selected category:', cat.value);
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
        </View>
      </Modal>

      {/* Unit Picker Modal */}
      <Modal
        visible={showUnitPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <View style={[styles.modalOverlay, { pointerEvents: 'box-none' }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowUnitPicker(false)}
          />
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
        </View>
      </Modal>
    </SafeAreaView>
  );
}
