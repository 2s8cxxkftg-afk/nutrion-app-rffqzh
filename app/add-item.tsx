
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { categorizeFoodItem } from '@/utils/categoryHelper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExpirationEstimation, predictExpirationDate } from '@/utils/expirationHelper';
import { IconSymbol } from '@/components/IconSymbol';
import { PantryItem, FOOD_CATEGORIES, UNITS } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
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
  Modal,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey + '30',
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey + '30',
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
    backgroundColor: colors.background,
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
    borderBottomColor: colors.grey + '20',
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
    borderBottomColor: colors.grey + '10',
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
    color: colors.grey,
    marginTop: 6,
    fontStyle: 'italic',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grey + '30',
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
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

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (name.trim()) {
      const suggestedCategory = categorizeFoodItem(name);
      if (suggestedCategory !== 'other') {
        setCategory(suggestedCategory);
      }

      const estimation = getExpirationEstimation(name);
      if (estimation) {
        const predictedDate = predictExpirationDate(name, true);
        setExpirationDate(predictedDate);
        setDateText(predictedDate);
      }
    }
  }, [category, name]);

  const handleNameChange = (text: string) => {
    setName(text);
  };

  const handleQuantityChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setQuantity(cleaned);
  };

  const incrementQuantity = () => {
    const current = parseFloat(quantity) || 0;
    setQuantity((current + 1).toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const decrementQuantity = () => {
    const current = parseFloat(quantity) || 0;
    if (current > 0) {
      setQuantity(Math.max(0, current - 1).toString());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDateChange = (text: string) => {
    setDateText(text);
    const parsed = validateAndParseDate(text);
    if (parsed) {
      setExpirationDate(parsed);
    }
  };

  const validateAndParseDate = (dateText: string): string | null => {
    const cleaned = dateText.replace(/[^\d]/g, '');
    
    if (cleaned.length === 8) {
      const month = cleaned.substring(0, 2);
      const day = cleaned.substring(2, 4);
      const year = cleaned.substring(4, 8);
      
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      const yearNum = parseInt(year);
      
      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31 && yearNum >= 2024) {
        return `${year}-${month}-${day}`;
      }
    }
    
    return null;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ message: 'Please enter an item name', type: 'error' });
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (!quantityNum || quantityNum <= 0) {
      Toast.show({ message: 'Please enter a valid quantity', type: 'error' });
      return;
    }

    if (!expirationDate) {
      Toast.show({ message: 'Please enter a valid expiration date (MM/DD/YYYY)', type: 'error' });
      return;
    }

    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: quantityNum,
      unit,
      category,
      expirationDate,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    await addPantryItem(newItem);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({ message: `${name} added to pantry!`, type: 'success' });
    router.back();
  };

  const closeAllPickers = () => {
    setShowCategoryPicker(false);
    setShowUnitPicker(false);
  };

  const openCategoryPicker = () => {
    Keyboard.dismiss();
    closeAllPickers();
    setShowCategoryPicker(true);
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
              placeholder="e.g., Milk, Apples, Chicken"
              placeholderTextColor={colors.grey}
              value={name}
              onChangeText={handleNameChange}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => quantityInputRef.current?.focus()}
            />
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
                    placeholderTextColor={colors.grey}
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
                <IconSymbol name="chevron.down" size={16} color={colors.grey} />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Type quantity directly or use +/− buttons</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={openCategoryPicker}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerButtonText}>
                {FOOD_CATEGORIES.find(c => c.value === category)?.label || 'Other'}
              </Text>
              <IconSymbol name="chevron.down" size={16} color={colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Expiration Date *</Text>
            <TextInput
              ref={dateInputRef}
              style={[styles.input, focusedInput === 'date' && styles.inputFocused]}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={colors.grey}
              value={dateText}
              onChangeText={handleDateChange}
              onFocus={() => setFocusedInput('date')}
              onBlur={() => setFocusedInput(null)}
              keyboardType="number-pad"
              maxLength={10}
              returnKeyType="done"
            />
            <Text style={styles.hint}>Auto-suggested based on item type</Text>
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
                <IconSymbol name="xmark" size={20} color={colors.text} />
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
                <IconSymbol name="xmark" size={20} color={colors.text} />
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
    </SafeAreaView>
  );
}
