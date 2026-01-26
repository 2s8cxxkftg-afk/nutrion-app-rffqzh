
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

interface NumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export default function NumberInput({
  value,
  onChangeText,
  min = 0,
  max = 9999,
  step = 1,
  placeholder = '0',
}: NumberInputProps) {
  const handleTextChange = (text: string) => {
    console.log('[NumberInput] User manually entering value:', text);
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    onChangeText(cleaned);
  };

  const handleIncrement = () => {
    console.log('[NumberInput] User tapped increment button');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.min(currentValue + step, max);
    const newValueString = newValue.toString();
    
    onChangeText(newValueString);
  };

  const handleDecrement = () => {
    console.log('[NumberInput] User tapped decrement button');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(currentValue - step, min);
    const newValueString = newValue.toString();
    
    onChangeText(newValueString);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType="decimal-pad"
      />
      <View style={styles.arrowContainer}>
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={handleIncrement}
          activeOpacity={0.7}
        >
          <IconSymbol 
            ios_icon_name="chevron.up" 
            android_material_icon_name="arrow-drop-up" 
            size={20} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <View style={styles.arrowDivider} />
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={handleDecrement}
          activeOpacity={0.7}
        >
          <IconSymbol 
            ios_icon_name="chevron.down" 
            android_material_icon_name="arrow-drop-down" 
            size={20} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.grey,
    overflow: 'hidden',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  arrowContainer: {
    borderLeftWidth: 1,
    borderLeftColor: colors.grey,
    backgroundColor: colors.backgroundAlt,
  },
  arrowButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  arrowDivider: {
    height: 1,
    backgroundColor: colors.grey,
  },
});
