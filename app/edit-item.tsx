
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { categorizeFoodItem } from '@/utils/categoryHelper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExpirationEstimation, predictExpirationDate } from '@/utils/expirationHelper';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { PantryItem, FOOD_CATEGORIES, UNITS, QUANTITY_PRESETS } from '@/types/pantry';
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { updatePantryItem, loadPantryItems } from '@/utils/storage';
import NumberInput from '@/components/NumberInput';
import Toast from '@/components/Toast';

export default function EditItemScreen() {
  const { id: itemId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pieces');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [customQuantityMode, setCustomQuantityMode] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  
  const nameInputRef = useRef<TextInput>(null);
  const dateInputRef = useRef<TextInput>(null);

  // Wrap loadItem with useCallback to stabilize its reference
  const loadItem = useCallback(async () => {
    if (!itemId) return;
    
    try {
      const items = await loadPantryItems();
      const item = items.find(i => i.id === itemId);
      
      if (item) {
        setName(item.name);
        setCategory(item.category);
        setExpirationDate(item.expirationDate);
        setQuantity(item.quantity);
        setUnit(item.unit);
      } else {
        setToast({ visible: true, message: 'Item not found', type: 'error' });
        router.back();
      }
    } catch (error) {
      console.log('Error loading item:', error);
      setToast({ visible: true, message: 'Failed to load item', type: 'error' });
    }
  }, [itemId, router]);

  useEffect(() => {
    loadItem();
  }, [loadItem]); // Fixed: Added loadItem to dependencies

  useEffect(() => {
    if (category && name) {
      const estimation = getExpirationEstimation(name);
      if (estimation && !expirationDate) {
        const predicted = predictExpirationDate(name, category === 'dairy' || category === 'meat');
        setExpirationDate(predicted);
      }
    }
  }, [category, name]);

  const handleNameChange = (text: string) => {
    setName(text);
    if (text.length > 2 && !category) {
      const suggestedCategory = categorizeFoodItem(text);
      if (suggestedCategory) {
        setCategory(suggestedCategory);
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

  const validateAndParseDate = (dateText: string): boolean => {
    const parts = dateText.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 2024 || year > 2100) return false;
    
    return true;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setToast({ visible: true, message: 'Please enter item name', type: 'error' });
      return;
    }

    if (!category) {
      setToast({ visible: true, message: 'Please select a category', type: 'error' });
      return;
    }

    if (!expirationDate || !validateAndParseDate(expirationDate)) {
      setToast({ visible: true, message: 'Please enter a valid date (DD/MM/YYYY)', type: 'error' });
      return;
    }

    if (quantity <= 0) {
      setToast({ visible: true, message: 'Quantity must be greater than 0', type: 'error' });
      return;
    }

    try {
      const updatedItem: PantryItem = {
        id: itemId || '',
        name: name.trim(),
        category,
        expirationDate,
        quantity,
        unit,
        dateAdded: new Date().toISOString(),
      };

      await updatePantryItem(updatedItem);
      setToast({ visible: true, message: 'Item updated successfully!', type: 'success' });
      
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.log('Error updating item:', error);
      setToast({ visible: true, message: 'Failed to update item', type: 'error' });
    }
  };

  const handleQuantityPresetSelect = (value: number) => {
    setQuantity(value);
    setShowQuantityPicker(false);
    setCustomQuantityMode(false);
  };

  const handleCustomQuantityMode = () => {
    setCustomQuantityMode(true);
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

  const getUnitLabel = (unitValue: string): string => {
    const unitObj = UNITS.find(u => u.value === unitValue);
    return unitObj ? unitObj.label : unitValue;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Edit Item',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                ref={nameInputRef}
                style={styles.input}
                value={name}
                onChangeText={handleNameChange}
                placeholder="e.g., Milk, Eggs, Bread"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={openCategoryPicker}
              >
                <Text style={[styles.pickerButtonText, !category && styles.placeholderText]}>
                  {category ? FOOD_CATEGORIES.find(c => c.value === category)?.label : 'Select category'}
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="arrow-drop-down"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expiration Date *</Text>
              <TextInput
                ref={dateInputRef}
                style={styles.input}
                value={expirationDate}
                onChangeText={handleDateChange}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Quantity *</Text>
                {customQuantityMode ? (
                  <NumberInput
                    value={quantity}
                    onChange={setQuantity}
                    min={0.1}
                    max={9999}
                    step={1}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={openQuantityPicker}
                  >
                    <Text style={styles.pickerButtonText}>{quantity}</Text>
                    <IconSymbol
                      ios_icon_name="chevron.down"
                      android_material_icon_name="arrow-drop-down"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Unit *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={openUnitPicker}
                >
                  <Text style={styles.pickerButtonText}>{getUnitLabel(unit)}</Text>
                  <IconSymbol
                    ios_icon_name="chevron.down"
                    android_material_icon_name="arrow-drop-down"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Category Picker Modal */}
        {showCategoryPicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={closeAllPickers}
            />
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Category</Text>
                <TouchableOpacity onPress={closeAllPickers}>
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList}>
                {FOOD_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.pickerItem,
                      category === cat.value && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setCategory(cat.value);
                      closeAllPickers();
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        category === cat.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Unit Picker Modal */}
        {showUnitPicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={closeAllPickers}
            />
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Unit</Text>
                <TouchableOpacity onPress={closeAllPickers}>
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList}>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u.value}
                    style={[
                      styles.pickerItem,
                      unit === u.value && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setUnit(u.value);
                      closeAllPickers();
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        unit === u.value && styles.pickerItemTextSelected,
                      ]}
                    >
                      {u.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Quantity Picker Modal */}
        {showQuantityPicker && (
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdrop}
              activeOpacity={1}
              onPress={closeAllPickers}
            />
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Quantity</Text>
                <TouchableOpacity onPress={closeAllPickers}>
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerList}>
                {QUANTITY_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    style={styles.pickerItem}
                    onPress={() => handleQuantityPresetSelect(preset.value)}
                  >
                    <Text style={styles.pickerItemText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.pickerItem, styles.customOption]}
                  onPress={handleCustomQuantityMode}
                >
                  <Text style={[styles.pickerItemText, styles.customOptionText]}>
                    Custom Amount
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
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
    padding: 16,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  pickerButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  pickerList: {
    maxHeight: 400,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  customOption: {
    backgroundColor: colors.primaryLight,
  },
  customOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
