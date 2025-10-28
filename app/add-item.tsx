
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { PantryItem, FOOD_CATEGORIES, UNITS, QUANTITY_PRESETS } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';

export default function AddItemScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(FOOD_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(UNITS[0]);
  const [expirationDate, setExpirationDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // Format date as YYYY-MM-DD
    const formattedDate = expirationDate.toISOString().split('T')[0];

    const newItem: PantryItem = {
      id: Date.now().toString(),
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
      Alert.alert('Success', 'Item added to pantry', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
      console.error('Error adding item:', error);
    }
  };

  const handleScanBarcode = () => {
    router.push('/scan-barcode');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker event:', event.type, selectedDate);
    
    // On Android, always close the picker after selection or dismissal
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    // Update the date if user selected one (not cancelled)
    if (event.type === 'set' && selectedDate) {
      setExpirationDate(selectedDate);
      console.log('Date updated to:', selectedDate);
      
      // On iOS, close the picker after selection
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      // User cancelled the picker
      console.log('Date picker dismissed');
    }
  };

  const handleQuantityPresetSelect = (value: number) => {
    setQuantity(value.toString());
    setShowQuantityPicker(false);
    console.log('Quantity preset selected:', value);
  };

  return (
    <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Add Item',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          presentation: 'modal',
        }}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanBarcode}
            activeOpacity={0.7}
          >
            <IconSymbol name="barcode.viewfinder" size={24} color={colors.text} />
            <Text style={styles.scanButtonText}>Scan Barcode</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g., Milk, Eggs, Bread"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={(text) => {
              console.log('Name input changed:', text);
              setName(text);
            }}
            autoCapitalize="words"
            returnKeyType="next"
            editable={true}
            selectTextOnFocus={true}
            autoCorrect={false}
          />

          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={[commonStyles.input, styles.picker]}
            onPress={() => {
              setShowCategoryPicker(!showCategoryPicker);
              setShowUnitPicker(false);
              setShowQuantityPicker(false);
            }}
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
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
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
                  style={[commonStyles.input, { flex: 1 }]}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  value={quantity}
                  onChangeText={(text) => {
                    console.log('Quantity input changed:', text);
                    setQuantity(text);
                  }}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  editable={true}
                  selectTextOnFocus={true}
                />
                <TouchableOpacity
                  style={styles.quantityPresetButton}
                  onPress={() => {
                    setShowQuantityPicker(!showQuantityPicker);
                    setShowCategoryPicker(false);
                    setShowUnitPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="list.bullet" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Unit *</Text>
              <TouchableOpacity
                style={[commonStyles.input, styles.picker]}
                onPress={() => {
                  setShowUnitPicker(!showUnitPicker);
                  setShowCategoryPicker(false);
                  setShowQuantityPicker(false);
                }}
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
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
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
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
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

          <Text style={styles.label}>Expiration Date *</Text>
          <TouchableOpacity
            style={[commonStyles.input, styles.picker]}
            onPress={() => {
              setShowDatePicker(true);
              setShowCategoryPicker(false);
              setShowUnitPicker(false);
              setShowQuantityPicker(false);
              console.log('Opening date picker');
            }}
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
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
                textColor={colors.text}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.datePickerDoneButton}
                  onPress={() => setShowDatePicker(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[commonStyles.input, styles.notesInput]}
            placeholder="Add any additional notes..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={(text) => {
              console.log('Notes input changed:', text);
              setNotes(text);
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="default"
            editable={true}
            selectTextOnFocus={true}
          />

          <TouchableOpacity
            style={[buttonStyles.primary, styles.saveButton]}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>Add to Pantry</Text>
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
    paddingBottom: 32,
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
    borderColor: colors.primary,
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
    borderWidth: 1,
    borderColor: colors.textSecondary + '40',
    overflow: 'hidden',
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
    color: colors.primary,
  },
  datePickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 8,
    padding: Platform.OS === 'ios' ? 12 : 0,
    borderWidth: 1,
    borderColor: colors.textSecondary + '40',
  },
  datePickerDoneButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notesInput: {
    height: 80,
    paddingTop: 12,
  },
  saveButton: {
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
