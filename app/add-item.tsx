
import React, { useState, useRef } from 'react';
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
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { PantryItem, FOOD_CATEGORIES, UNITS, QUANTITY_PRESETS } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export default function AddItemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState(FOOD_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(UNITS[0]);
  const [expirationDate, setExpirationDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), 'Please enter an item name');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert(t('error'), 'Please enter a valid quantity');
      return;
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const formattedDate = expirationDate.toISOString().split('T')[0];

    const newItem: PantryItem = {
      id: uniqueId,
      name: name.trim(),
      category,
      quantity: quantityNum,
      unit,
      dateAdded: new Date().toISOString(),
      expirationDate: formattedDate,
      notes: notes.trim(),
    };

    try {
      await addPantryItem(newItem);
      console.log('Item added successfully:', newItem);
      
      setToastMessage(t('itemAdded'));
      setShowToast(true);
      
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      Alert.alert(t('error'), 'Failed to add item');
      console.error('Error adding item:', error);
    }
  };

  const handleScanBarcode = () => {
    Keyboard.dismiss();
    closeAllPickers();
    router.push('/scan-barcode');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker event:', event.type, selectedDate);
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      
      if (event.type === 'set' && selectedDate) {
        setExpirationDate(selectedDate);
        console.log('Date updated to:', selectedDate);
      }
    } else if (Platform.OS === 'ios') {
      if (selectedDate) {
        setExpirationDate(selectedDate);
      }
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
    setShowDatePicker(false);
  };

  const dismissKeyboardAndPickers = () => {
    Keyboard.dismiss();
    closeAllPickers();
  };

  const openCategoryPicker = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      closeAllPickers();
      setTimeout(() => {
        setShowCategoryPicker(true);
      }, 100);
    }, 100);
  };

  const openUnitPicker = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      closeAllPickers();
      setTimeout(() => {
        setShowUnitPicker(true);
      }, 100);
    }, 100);
  };

  const openQuantityPicker = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      closeAllPickers();
      setTimeout(() => {
        setShowQuantityPicker(true);
      }, 100);
    }, 100);
  };

  const openDatePicker = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      closeAllPickers();
      setTimeout(() => {
        setShowDatePicker(true);
      }, 100);
    }, 100);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('addItem'),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          presentation: 'modal',
        }}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboardAndPickers}>
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              scrollEventThrottle={16}
            >
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScanBarcode}
                activeOpacity={0.7}
              >
                <IconSymbol name="barcode.viewfinder" size={24} color={colors.text} />
                <Text style={styles.scanButtonText}>{t('scanBarcode')}</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <Text style={styles.label}>{t('itemName')} *</Text>
              <TextInput
                ref={nameInputRef}
                style={commonStyles.input}
                placeholder="e.g., Milk, Eggs, Bread"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                autoCorrect={false}
                clearButtonMode="while-editing"
                onFocus={closeAllPickers}
                onSubmitEditing={() => {
                  closeAllPickers();
                  quantityInputRef.current?.focus();
                }}
              />

              <Text style={styles.label}>{t('category')} *</Text>
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
                  <Text style={styles.label}>{t('quantity')} *</Text>
                  <View style={styles.quantityContainer}>
                    <TextInput
                      ref={quantityInputRef}
                      style={[commonStyles.input, { flex: 1 }]}
                      placeholder="1"
                      placeholderTextColor={colors.textSecondary}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      clearButtonMode="while-editing"
                      onFocus={closeAllPickers}
                      onSubmitEditing={() => {
                        Keyboard.dismiss();
                        closeAllPickers();
                      }}
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
                  <Text style={styles.label}>{t('unit')} *</Text>
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

              <Text style={styles.label}>{t('expirationDate')} *</Text>
              <TouchableOpacity
                style={[commonStyles.input, styles.picker]}
                onPress={openDatePicker}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.text }}>
                  {expirationDate.toLocaleDateString()}
                </Text>
                <IconSymbol name="calendar" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={expirationDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                    textColor={colors.text}
                    themeVariant="light"
                    style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.datePickerDoneButton}
                      onPress={closeDatePicker}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <Text style={styles.label}>{t('notes')} (Optional)</Text>
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
              />

              <TouchableOpacity
                style={[buttonStyles.primary, styles.saveButton]}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>{t('addToPantry')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Toast
        visible={showToast}
        message={toastMessage}
        type="success"
        duration={2000}
        onHide={() => setShowToast(false)}
      />
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
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.textSecondary + '30',
    marginVertical: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
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
  datePickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    padding: Platform.OS === 'ios' ? 16 : 0,
    borderWidth: 1,
    borderColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  iosDatePicker: {
    height: 200,
  },
  datePickerDoneButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  notesInput: {
    height: 80,
    paddingTop: 12,
  },
  saveButton: {
    marginTop: 32,
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
