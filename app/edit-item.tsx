
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
  aiHint: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiHintText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
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
});

export default function EditItemScreen() {
  const { itemId } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [category, setCategory] = useState('Other');
  const [expirationDate, setExpirationDate] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    loadItem();
  }, [itemId]);

  useEffect(() => {
    if (name.length > 2) {
      const detectedCategory = categorizeFoodItem(name);
      if (detectedCategory !== category) {
        setCategory(detectedCategory);
        const predictedDate = predictExpirationDate(detectedCategory);
        const formattedDate = `${String(predictedDate.getMonth() + 1).padStart(2, '0')}/${String(predictedDate.getDate()).padStart(2, '0')}/${predictedDate.getFullYear()}`;
        setExpirationDate(formattedDate);
        
        const estimation = getExpirationEstimation(detectedCategory);
        setAiHint(`AI suggests: ${estimation.label} (${estimation.days} days)`);
      }
    } else {
      setAiHint('');
    }
  }, [category, name]);

  async function loadItem() {
    try {
      const items = await loadPantryItems();
      const item = items.find(i => i.id === itemId);
      if (item) {
        setName(item.name);
        setQuantity(item.quantity.toString());
        setUnit(item.unit);
        setCategory(item.category);
        const date = new Date(item.expirationDate);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
        setExpirationDate(formattedDate);
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Toast.show('Failed to load item', 'error');
    }
  }

  function handleNameChange(text: string) {
    setName(text);
  }

  function handleDateChange(text: string) {
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5) {
      cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5, 9);
    }
    
    setExpirationDate(cleaned);
  }

  function validateAndParseDate(dateText: string): Date | null {
    const parts = dateText.split('/');
    if (parts.length !== 3) return null;
    
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2024) {
      return null;
    }
    
    return new Date(year, month - 1, day);
  }

  async function handleSave() {
    if (!name.trim()) {
      Toast.show('Please enter an item name', 'error');
      return;
    }

    if (!expirationDate.trim()) {
      Toast.show('Please enter an expiration date', 'error');
      return;
    }

    const parsedDate = validateAndParseDate(expirationDate);
    if (!parsedDate) {
      Toast.show('Please enter a valid date (MM/DD/YYYY)', 'error');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Toast.show('Please enter a valid quantity', 'error');
      return;
    }

    try {
      const updatedItem: PantryItem = {
        id: itemId as string,
        name: name.trim(),
        quantity: quantityNum,
        unit,
        category,
        expirationDate: parsedDate.toISOString().split('T')[0],
        dateAdded: new Date().toISOString().split('T')[0],
      };

      await updatePantryItem(updatedItem);
      Toast.show('Item updated successfully', 'success');
      router.back();
    } catch (error) {
      console.error('Error updating item:', error);
      Toast.show('Failed to update item', 'error');
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
              placeholder="e.g., Milk, Eggs, Chicken"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            {aiHint ? (
              <View style={styles.aiHint}>
                <IconSymbol
                  ios_icon_name="sparkles"
                  android_material_icon_name="auto-awesome"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.aiHintText}>{aiHint}</Text>
              </View>
            ) : null}
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
              {QUANTITY_PRESETS.map((preset) => (
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
              <Text style={styles.pickerButtonText}>{category}</Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="arrow-drop-down"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
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
                    key={cat}
                    style={styles.pickerOption}
                    onPress={() => {
                      setCategory(cat);
                      const predictedDate = predictExpirationDate(cat);
                      const formattedDate = `${String(predictedDate.getMonth() + 1).padStart(2, '0')}/${String(predictedDate.getDate()).padStart(2, '0')}/${predictedDate.getFullYear()}`;
                      setExpirationDate(formattedDate);
                      closeAllPickers();
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{cat}</Text>
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
