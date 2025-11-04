
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { PantryItem, FOOD_CATEGORIES, UNITS, QUANTITY_PRESETS } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';
import { getExpirationEstimation, predictExpirationDate } from '@/utils/expirationHelper';
import { categorizeFoodItem } from '@/utils/categoryHelper';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export default function AddItemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const dateInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState(FOOD_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(UNITS[0]);
  const [expirationDateText, setExpirationDateText] = useState('');
  const [notes, setNotes] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [dateError, setDateError] = useState('');
  const [aiEstimation, setAiEstimation] = useState<string | null>(null);
  const [autoCategory, setAutoCategory] = useState<string | null>(null);

  // Update AI estimation and auto-category when name changes
  const handleNameChange = (text: string) => {
    setName(text);
    
    // Get AI estimation for the food item
    if (text.trim().length > 0) {
      // Auto-categorize
      const detectedCategory = categorizeFoodItem(text);
      setAutoCategory(detectedCategory);
      setCategory(detectedCategory);
      
      // Get expiration estimation
      const estimation = getExpirationEstimation(text, true);
      setAiEstimation(estimation);
      
      // Auto-fill expiration date with EARLIEST predicted date
      if (estimation && !expirationDateText) {
        const predictedDate = predictExpirationDate(text, detectedCategory, new Date(), true);
        const formattedDate = `${String(predictedDate.getMonth() + 1).padStart(2, '0')}/${String(predictedDate.getDate()).padStart(2, '0')}/${predictedDate.getFullYear()}`;
        setExpirationDateText(formattedDate);
      }
    } else {
      setAiEstimation(null);
      setAutoCategory(null);
    }
  };

  // Update expiration date when category changes (for better accuracy)
  useEffect(() => {
    if (name.trim().length > 0 && category) {
      const predictedDate = predictExpirationDate(name, category, new Date(), true);
      const formattedDate = `${String(predictedDate.getMonth() + 1).padStart(2, '0')}/${String(predictedDate.getDate()).padStart(2, '0')}/${predictedDate.getFullYear()}`;
      setExpirationDateText(formattedDate);
      
      // Update estimation text
      const estimation = getExpirationEstimation(name, true);
      setAiEstimation(estimation);
    }
  }, [category]);

  // Format date input as user types (MM/DD/YYYY)
  const handleDateChange = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    let formatted = '';
    if (cleaned.length > 0) {
      // Add first part (month)
      formatted = cleaned.substring(0, 2);
      
      if (cleaned.length >= 3) {
        // Add slash and day
        formatted += '/' + cleaned.substring(2, 4);
      }
      
      if (cleaned.length >= 5) {
        // Add slash and year
        formatted += '/' + cleaned.substring(4, 8);
      }
    }
    
    setExpirationDateText(formatted);
    setDateError('');
  };

  // Validate date format and create Date object
  const validateAndParseDate = (dateText: string): Date | null => {
    // Check format MM/DD/YYYY
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(\d{4})$/;
    
    if (!dateRegex.test(dateText)) {
      return null;
    }

    const parts = dateText.split('/');
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Create date object
    const date = new Date(year, month - 1, day);

    // Verify the date is valid (handles invalid dates like 02/30/2024)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  const handleSave = async () => {
    console.log('=== Save Button Pressed ===');
    console.log('Name:', name);
    console.log('Category:', category);
    console.log('Quantity:', quantity);
    console.log('Expiration Date:', expirationDateText);
    
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // Validate expiration date
    if (!expirationDateText.trim()) {
      setDateError('Please enter an expiration date');
      Alert.alert('Error', 'Please enter an expiration date in MM/DD/YYYY format');
      return;
    }

    const parsedDate = validateAndParseDate(expirationDateText);
    if (!parsedDate) {
      setDateError('Invalid date format. Use MM/DD/YYYY');
      Alert.alert('Error', 'Invalid date format. Please use MM/DD/YYYY (e.g., 10/25/2025)');
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      setDateError('Date cannot be in the past');
      Alert.alert('Error', 'Expiration date cannot be in the past');
      return;
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const formattedDate = parsedDate.toISOString().split('T')[0];

    const newItem: PantryItem = {
      id: uniqueId,
      name: name.trim(),
      category,
      quantity: quantityNum,
      unit,
      dateAdded: new Date().toISOString(),
      expirationDate: formattedDate,
      notes: notes.trim() || (aiEstimation ? `AI Prediction: ${aiEstimation}` : ''),
    };

    try {
      console.log('Adding item to pantry:', newItem);
      await addPantryItem(newItem);
      console.log('Item added successfully');
      
      Toast.show({
        message: `${name} added to pantry! 🎉`,
        type: 'success',
      });
      
      setTimeout(() => {
        console.log('Navigating back to pantry');
        router.back();
      }, 1000);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleQuantityPresetSelect = (value: number) => {
    setQuantity(value.toString());
    setShowQuantityPicker(false);
    console.log('Quantity preset selected:', value);
  };

  const closeAllPickers = () => {
    setShowCategoryPicker(false);
    setShowUnitPicker(false);
    setShowQuantityPicker(false);
  };

  const openCategoryPicker = () => {
    Keyboard.dismiss();
    closeAllPickers();
    setTimeout(() => {
      setShowCategoryPicker(true);
    }, 150);
  };

  const openUnitPicker = () => {
    Keyboard.dismiss();
    closeAllPickers();
    setTimeout(() => {
      setShowUnitPicker(true);
    }, 150);
  };

  const openQuantityPicker = () => {
    Keyboard.dismiss();
    closeAllPickers();
    setTimeout(() => {
      setShowQuantityPicker(true);
    }, 150);
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Add Item',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          presentation: 'card',
        }}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          scrollEventThrottle={16}
        >
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            ref={nameInputRef}
            style={commonStyles.input}
            placeholder="e.g., Milk, Eggs, Bread, Butter"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={handleNameChange}
            autoCapitalize="words"
            returnKeyType="next"
            autoCorrect={false}
            clearButtonMode="while-editing"
            onFocus={closeAllPickers}
            onSubmitEditing={() => {
              quantityInputRef.current?.focus();
            }}
            editable={true}
            selectTextOnFocus={true}
          />

          {(aiEstimation || autoCategory) && (
            <View style={styles.aiEstimationBanner}>
              <View style={styles.aiEstimationIcon}>
                <IconSymbol name="sparkles" size={16} color={colors.primary} />
              </View>
              <View style={styles.aiEstimationContent}>
                <Text style={styles.aiEstimationTitle}>✨ AI Prediction</Text>
                {autoCategory && (
                  <Text style={styles.aiEstimationText}>
                    Category: {autoCategory}
                  </Text>
                )}
                {aiEstimation && (
                  <Text style={styles.aiEstimationText}>
                    {aiEstimation}
                  </Text>
                )}
                <Text style={styles.aiEstimationSubtext}>
                  Earliest expiration date auto-filled
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.label}>Category * {autoCategory && '(Auto-detected)'}</Text>
          <TouchableOpacity
            style={[commonStyles.input, styles.picker]}
            onPress={openCategoryPicker}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.text }}>{category}</Text>
            <IconSymbol 
              name={showCategoryPicker ? "chevron.up" : "chevron.down"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          {showCategoryPicker && (
            <View style={styles.pickerOptions}>
              <ScrollView 
                style={{ maxHeight: 200 }} 
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {FOOD_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.pickerOption}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                      console.log('Category selected:', cat);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      category === cat && styles.pickerOptionTextSelected
                    ]}>
                      {cat}
                    </Text>
                    {category === cat && (
                      <IconSymbol name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Quantity *</Text>
              <View style={styles.quantityContainer}>
                <TextInput
                  ref={quantityInputRef}
                  style={[commonStyles.input, { flex: 1 }]}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                  clearButtonMode="while-editing"
                  onFocus={closeAllPickers}
                  onSubmitEditing={() => {
                    dateInputRef.current?.focus();
                  }}
                  editable={true}
                  selectTextOnFocus={true}
                />
                <TouchableOpacity
                  style={styles.quantityPresetButton}
                  onPress={openQuantityPicker}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="list.bullet" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Unit *</Text>
              <TouchableOpacity
                style={[commonStyles.input, styles.picker]}
                onPress={openUnitPicker}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.text }}>{unit}</Text>
                <IconSymbol 
                  name={showUnitPicker ? "chevron.up" : "chevron.down"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {showQuantityPicker && (
            <View style={styles.pickerOptions}>
              <ScrollView 
                style={{ maxHeight: 200 }} 
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {QUANTITY_PRESETS.map(preset => (
                  <TouchableOpacity
                    key={preset.label}
                    style={styles.pickerOption}
                    onPress={() => handleQuantityPresetSelect(preset.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerOptionText}>
                      {preset.label}
                    </Text>
                    {parseFloat(quantity) === preset.value && (
                      <IconSymbol name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {showUnitPicker && (
            <View style={styles.pickerOptions}>
              <ScrollView 
                style={{ maxHeight: 200 }} 
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {UNITS.map(u => (
                  <TouchableOpacity
                    key={u}
                    style={styles.pickerOption}
                    onPress={() => {
                      setUnit(u);
                      setShowUnitPicker(false);
                      console.log('Unit selected:', u);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      unit === u && styles.pickerOptionTextSelected
                    ]}>
                      {u}
                    </Text>
                    {unit === u && (
                      <IconSymbol name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.label}>Expiration Date * (Earliest Predicted)</Text>
          <View>
            <TextInput
              ref={dateInputRef}
              style={[
                commonStyles.input,
                dateError ? styles.inputError : null
              ]}
              placeholder="MM/DD/YYYY (e.g., 10/25/2025)"
              placeholderTextColor={colors.textSecondary}
              value={expirationDateText}
              onChangeText={handleDateChange}
              keyboardType="number-pad"
              returnKeyType="next"
              maxLength={10}
              clearButtonMode="while-editing"
              onFocus={closeAllPickers}
              onSubmitEditing={() => {
                notesInputRef.current?.focus();
              }}
              editable={true}
              selectTextOnFocus={true}
            />
            {dateError ? (
              <Text style={styles.errorText}>{dateError}</Text>
            ) : (
              <Text style={styles.helperText}>
                {aiEstimation 
                  ? '✨ AI predicted the earliest expiration date. You can edit if needed.'
                  : 'Enter date in MM/DD/YYYY format (e.g., 10/25/2025)'}
              </Text>
            )}
          </View>

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            ref={notesInputRef}
            style={[commonStyles.input, styles.notesInput]}
            placeholder="Add any additional notes..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="default"
            clearButtonMode="while-editing"
            onFocus={closeAllPickers}
            editable={true}
            selectTextOnFocus={true}
          />

          <TouchableOpacity
            style={[buttonStyles.primary, styles.saveButton]}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={buttonStyles.primaryText}>Add to Pantry</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  aiEstimationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: 12,
  },
  aiEstimationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiEstimationContent: {
    flex: 1,
  },
  aiEstimationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  aiEstimationText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  aiEstimationSubtext: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
  },
  quantityContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  quantityPresetButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerOptions: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + '20',
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
    color: colors.text,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 4,
  },
  notesInput: {
    height: 80,
    paddingTop: 12,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 20,
  },
});
