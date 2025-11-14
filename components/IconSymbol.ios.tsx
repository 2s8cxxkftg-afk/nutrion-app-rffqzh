
import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle, OpaqueColorValue } from "react-native";

/**
 * An icon component that uses native SFSymbols on iOS.
 * 
 * Usage:
 * <IconSymbol ios_icon_name="house.fill" size={24} color={colors.text} />
 * OR (legacy support):
 * <IconSymbol name="house.fill" size={24} color={colors.text} />
 */
export function IconSymbol({
  name,
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color,
  style,
  weight = "regular",
}: {
  name?: SymbolViewProps["name"];
  ios_icon_name?: SymbolViewProps["name"];
  android_material_icon_name?: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Support both old and new prop names for backward compatibility
  const iconName = ios_icon_name || name;
  
  if (!iconName) {
    console.warn('IconSymbol: No icon name provided');
    return null;
  }
  
  return (
    <SymbolView
      weight={weight}
      tintColor={color as any}
      resizeMode="scaleAspectFit"
      name={iconName}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
