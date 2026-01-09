
import { categorizeFoodItem } from '@/utils/categoryHelper';
import { IconSymbol } from '@/components/IconSymbol';
import { PantryItem, FOOD_CATEGORIES, UNITS, QUANTITY_PRESETS } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';
import Toast from '@/components/Toast';
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { getExpirationEstimation, predictExpirationDate } from '@/utils/expirationHelper';
import { Stack, useRouter } from 'expo-router';

export default function AddItemScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [category, setCategory] = useState('other');
  const [expirationDate, setExpirationDate] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (category && name) {
      const estimation = getExpirationEstimation(name, category);
      if (estimation && !expirationDate) {
        const predicted = predictExpirationDate(name, category);
        if (predicted) {
          setExpirationDate(predicted);
        }
      }
    }
  }, [category, name]);

  const handleNameChange = (text: string) => {
    setName(text);
    if (text.length > 2) {
      const detectedCategory = categorizeFoodItem(text);
      if (detectedCategory !== 'other') {
        setCategory(detectedCategory);
      }
    }
  };

  const handleDateChange = (text: string) => {
    let formatted = text.replace(/[^0-9]/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }
    setExpirationDate(formatted);
  };

  const validateAndParseDate = (dateText: string): Date | null => {
    const parts = dateText.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2024) return null;

    return new Date(year, month - 1, day);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    const parsedDate = validateAndParseDate(expirationDate);
    if (!parsedDate) {
      Alert.alert('Error', 'Please enter valid date (DD/MM/YYYY)');
      return;
    }

    setLoading(true);

    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit,
      category,
      expirationDate: parsedDate.toISOString(),
      dateAdded: new Date().toISOString(),
    };

    try {
      await addPantryItem(newItem);
      Toast.show({ message: 'Item added successfully', type: 'success' });
      router.back();
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityPresetSelect = (value: number) => {
    setQuantity(value.toString());
    setShowQuantityPicker(false);
  };

  const closeAllPickers = () => {
    setShowCategoryPicker(false);
    setShowUnitPicker(false);
    setShowQuantityPicker(false);
    Keyboard.dismiss();
  };

  const openCategoryPicker = () => {
    closeAllPickers();
    setShowCategoryPicker(true);
  };

  const openUnitPicker = () => {
    closeAllPickers();
    setShowUnitPicker(true);
  };

  const openQuantityPicker = () => {
    closeAllPickers();
    setShowQuantityPicker(true);
  };

  const getCategoryTranslation = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const getUnitTranslation = (unitValue: string) => {
    return unitValue;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Add Item',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter item name"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={openCategoryPicker}>
              <Text style={styles.pickerButtonText}>{getCategoryTranslation(category)}</Text>
              <IconSymbol 
                ios_icon_name="chevron.down" 
                android_material_icon_name="expand_more" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={styles.label}>Quantity</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={openQuantityPicker}>
                <Text style={styles.pickerButtonText}>{quantity}</Text>
                <IconSymbol 
                  ios_icon_name="chevron.down" 
                  android_material_icon_name="expand_more" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={styles.label}>Unit</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={openUnitPicker}>
                <Text style={styles.pickerButtonText}>{getUnitTranslation(unit)}</Text>
                <IconSymbol 
                  ios_icon_name="chevron.down" 
                  android_material_icon_name="expand_more" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Expiration Date</Text>
            <TextInput
              style={styles.input}
              value={expirationDate}
              onChangeText={handleDateChange}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Item'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {showCategoryPicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity 
              style={styles.pickerOverlayTouchable} 
              activeOpacity={1} 
              onPress={closeAllPickers}
            >
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Category</Text>
                  <TouchableOpacity onPress={closeAllPickers} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <IconSymbol 
                      ios_icon_name="xmark" 
                      android_material_icon_name="close" 
                      size={24} 
                      color={colors.text} 
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerScroll}>
                  {FOOD_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.pickerOption, category === cat && styles.pickerOptionSelected]}
                      onPress={() => {
                        setCategory(cat);
                        closeAllPickers();
                      }}
                    >
                      <Text style={[styles.pickerOptionText, category === cat && styles.pickerOptionTextSelected]}>
                        {getCategoryTranslation(cat)}
                      </Text>
                      {category === cat && (
                        <IconSymbol 
                          ios_icon_name="checkmark" 
                          android_material_icon_name="check" 
                          size={20} 
                          color={colors.primary} 
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {showUnitPicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity 
              style={styles.pickerOverlayTouchable} 
              activeOpacity={1} 
              onPress={closeAllPickers}
            >
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Unit</Text>
                  <TouchableOpacity onPress={closeAllPickers} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <IconSymbol 
                      ios_icon_name="xmark" 
                      android_material_icon_name="close" 
                      size={24} 
                      color={colors.text} 
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerScroll}>
                  {UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.pickerOption, unit === u && styles.pickerOptionSelected]}
                      onPress={() => {
                        setUnit(u);
                        closeAllPickers();
                      }}
                    >
                      <Text style={[styles.pickerOptionText, unit === u && styles.pickerOptionTextSelected]}>
                        {getUnitTranslation(u)}
                      </Text>
                      {unit === u && (
                        <IconSymbol 
                          ios_icon_name="checkmark" 
                          android_material_icon_name="check" 
                          size={20} 
                          color={colors.primary} 
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {showQuantityPicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity 
              style={styles.pickerOverlayTouchable} 
              activeOpacity={1} 
              onPress={closeAllPickers}
            >
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Quantity</Text>
                  <TouchableOpacity onPress={closeAllPickers} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <IconSymbol 
                      ios_icon_name="xmark" 
                      android_material_icon_name="close" 
                      size={24} 
                      color={colors.text} 
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerScroll}>
                  {QUANTITY_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={styles.pickerOption}
                      onPress={() => handleQuantityPresetSelect(preset)}
                    >
                      <Text style={styles.pickerOptionText}>{preset}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
  },
  pickerButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 54,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.2,
  },
  pickerScroll: {
    maxHeight: 400,
  },
  pickerOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary + '10',
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  pickerOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
