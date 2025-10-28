
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { PantryItem, FOOD_CATEGORIES, UNITS } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';

export default function AddItemScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(FOOD_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(UNITS[0]);
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!expirationDate) {
      Alert.alert('Error', 'Please enter an expiration date');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(expirationDate)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return;
    }

    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: name.trim(),
      category,
      quantity: parseFloat(quantity) || 1,
      unit,
      dateAdded: new Date().toISOString(),
      expirationDate,
      notes: notes.trim(),
    };

    try {
      await addPantryItem(newItem);
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
      
      <View style={commonStyles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanBarcode}
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
            onChangeText={setName}
          />

          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={[commonStyles.input, styles.picker]}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
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
              {FOOD_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={styles.pickerOption}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
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
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="1"
                placeholderTextColor={colors.textSecondary}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.label}>Unit *</Text>
              <TouchableOpacity
                style={[commonStyles.input, styles.picker]}
                onPress={() => setShowUnitPicker(!showUnitPicker)}
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

          {showUnitPicker && (
            <View style={styles.pickerOptions}>
              {UNITS.map(u => (
                <TouchableOpacity
                  key={u}
                  style={styles.pickerOption}
                  onPress={() => {
                    setUnit(u);
                    setShowUnitPicker(false);
                  }}
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
            </View>
          )}

          <Text style={styles.label}>Expiration Date * (YYYY-MM-DD)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="2024-12-31"
            placeholderTextColor={colors.textSecondary}
            value={expirationDate}
            onChangeText={setExpirationDate}
          />

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[commonStyles.input, styles.notesInput]}
            placeholder="Add any additional notes..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[buttonStyles.primary, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Add to Pantry</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    maxHeight: 200,
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
