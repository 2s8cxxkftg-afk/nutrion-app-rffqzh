
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router, Stack } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';

export default function Modal() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
              <IconSymbol 
                ios_icon_name="chevron.left" 
                android_material_icon_name="arrow-back" 
                color={theme.colors.primary} 
                size={24}
              />
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Standard Modal</Text>
        <Text style={[styles.text, { color: theme.colors.text }]}>This is a modal presentation.</Text>

        <Pressable onPress={() => router.back()}>
          <GlassView style={styles.button} glassEffectStyle="clear">
            <Text style={[styles.buttonText, { color: theme.colors.primary }]}>Close Modal</Text>
          </GlassView>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
