
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { getExpirationEstimation, predictExpirationDate } from '@/utils/expirationHelper';
import { PantryItem, FOOD_CATEGORIES, UNITS, QUANTITY_PRESETS } from '@/types/pantry';
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
import React, { useState, useRef, useEffect } from 'react';
import Toast from '@/components/Toast';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { categorizeFoodItem } from '@/utils/categoryHelper';
import { updatePantryItem, loadPantryItems } from '@/utils/storage';

export default function EditItemScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [category, setCategory] = useState('Other');
  const [expirationDate, setExpirationDate] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [customQuantityMode, setCustomQuantityMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const quantityInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const items = await loadPantryItems();
      const item = items.find(i => i.id === itemId);
      
      if (item) {
        setName(item.name);
        setQuantity(item.quantity.toString());
        setUnit(item.unit);
        setCategory(item.category);
        
        const date = new Date(item.expirationDate);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        setExpirationDate(`${month}/${day}/${year}`);
      } else {
        Toast.show({ message: 'Item not found', type: 'error' });
        router.back();
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Toast.show({ message: 'Failed to load item', type: 'error' });
      router.back();
    }
  };

  useEffect(() => {
    if (category && name && name.length > 2) {
      const estimation = getExpirationEstimation(name, category);
      setAiSuggestion(estimation);
    } else {
      setAiSuggestion('');
    }
  }, [category, name]);

  const handleNameChange = (text: string) => {
    setName(text);
    if (text.length > 2) {
      const detectedCategory = categorizeFoodItem(text);
      if (detectedCategory !== 'Other') {
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

    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2024) return null;

    return new Date(year, month - 1, day);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ message: 'Please enter item name', type: 'error' });
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      Toast.show({ message: 'Please enter a valid quantity', type: 'error' });
      return;
    }

    const parsedDate = validateAndParseDate(expirationDate);
    if (!parsedDate) {
      Toast.show({ message: 'Please enter valid date (MM/DD/YYYY)', type: 'error' });
      return;
    }

    setLoading(true);

    const updatedItem: PantryItem = {
      id: itemId as string,
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      category,
      expirationDate: parsedDate.toISOString(),
      dateAdded: new Date().toISOString(),
    };

    try {
      await updatePantryItem(updatedItem);
      Toast.show({ message: 'Item updated successfully! ✅', type: 'success' });
      router.back();
    } catch (error) {
      console.error('Error updating item:', error);
      Toast.show({ message: 'Failed to update item', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityPresetSelect = (value: number) => {
    setQuantity(value.toString());
    setShowQuantityPicker(false);
    setCustomQuantityMode(false);
  };

  const handleCustomQuantityMode = () => {
    setCustomQuantityMode(true);
    setShowQuantityPicker(false);
    setTimeout(() => {
      quantityInputRef.current?.focus();
    }, 100);
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
    setCustomQuantityMode(false);
    setShowQuantityPicker(true);
  };

  const getUnitLabel = (unitValue: string) => {
    const unit = UNITS.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Edit Item',
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
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleNameChange}
              placeholder="e.g., Milk, Salmon, Apples, Bread"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {aiSuggestion ? (
              <View style={styles.aiSuggestionBox}>
                <IconSymbol 
                  ios_icon_name="sparkles" 
                  android_material_icon_name="auto-awesome" 
                  size={16} 
                  color={colors.primary} 
                />
                <Text style={styles.aiSuggestionText}>
                  🤖 AI Tip: {aiSuggestion}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={openCategoryPicker}>
              <Text style={styles.pickerButtonText}>{category}</Text>
              <IconSymbol 
                ios_icon_name="chevron.down" 
                android_material_icon_name="arrow-drop-down" 
                size={24} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={styles.label}>Quantity *</Text>
              {customQuantityMode ? (
                <TextInput
                  ref={quantityInputRef}
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="Enter quantity"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                  onBlur={() => {
                    if (!quantity || parseFloat(quantity) <= 0) {
                      setQuantity('1');
                    }
                  }}
                />
              ) : (
                <TouchableOpacity style={styles.pickerButton} onPress={openQuantityPicker}>
                  <Text style={styles.pickerButtonText}>{quantity}</Text>
                  <IconSymbol 
                    ios_icon_name="chevron.down" 
                    android_material_icon_name="arrow-drop-down" 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={styles.label}>Unit *</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={openUnitPicker}>
                <Text style={styles.pickerButtonText} numberOfLines={1}>
                  {getUnitLabel(unit)}
                </Text>
                <IconSymbol 
                  ios_icon_name="chevron.down" 
                  android_material_icon_name="arrow-drop-down" 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Expiration Date *</Text>
            <TextInput
              style={styles.input}
              value={expirationDate}
              onChangeText={handleDateChange}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.helperText}>
              Format: Month/Day/Year (e.g., 12/25/2024)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <>
                <IconSymbol 
                  ios_icon_name="checkmark" 
                  android_material_icon_name="check" 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.saveButtonText}>Update Item</Text>
              </>
            )}
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
                        {cat}
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
                      key={u.value}
                      style={[styles.pickerOption, unit === u.value && styles.pickerOptionSelected]}
                      onPress={() => {
                        setUnit(u.value);
                        closeAllPickers();
                      }}
                    >
                      <Text style={[styles.pickerOptionText, unit === u.value && styles.pickerOptionTextSelected]}>
                        {u.label}
                      </Text>
                      {unit === u.value && (
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
                  <TouchableOpacity
                    style={styles.customQuantityButton}
                    onPress={handleCustomQuantityMode}
                  >
                    <IconSymbol 
                      ios_icon_name="pencil" 
                      android_material_icon_name="edit" 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.customQuantityButtonText}>Enter Custom Quantity</Text>
                  </TouchableOpacity>
                  {QUANTITY_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset.value}
                      style={styles.pickerOption}
                      onPress={() => handleQuantityPresetSelect(preset.value)}
                    >
                      <Text style={styles.pickerOptionText}>{preset.label}</Text>
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
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  aiSuggestionBox: {
    marginTop: 10,
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  aiSuggestionText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
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
    flexDirection: 'row',
    gap: 8,
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
  customQuantityButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primary + '08',
  },
  customQuantityButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
