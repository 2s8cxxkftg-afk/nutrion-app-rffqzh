
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.grey,
    overflow: 'hidden',
  },
  input: {
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
});
