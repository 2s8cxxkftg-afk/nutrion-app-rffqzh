
import * as React from "react";
import { createContext, useCallback, useContext } from "react";
import { Platform } from "react-native";

// Widget functionality is iOS-only and optional
// We wrap everything in try-catch to prevent crashes
let isWidgetAvailable = false;

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Simplified widget provider that doesn't crash on iOS
  // Widget functionality is disabled to prevent iOS crashes
  
  React.useEffect(() => {
    console.log('[WidgetProvider] Widget functionality disabled for stability');
  }, []);

  const refreshWidget = useCallback(() => {
    console.log('[WidgetProvider] Widget refresh called (no-op)');
  }, []);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
