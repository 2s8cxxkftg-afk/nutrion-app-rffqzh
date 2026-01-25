import * as React from "react";
import { createContext, useCallback, useContext } from "react";
import { Platform } from "react-native";

// Safely import ExtensionStorage only on iOS
let ExtensionStorage: any = null;
let storage: any = null;

if (Platform.OS === 'ios') {
  try {
    const appleTargets = require("@bacons/apple-targets");
    ExtensionStorage = appleTargets.ExtensionStorage;
    
    // Initialize storage with error handling
    try {
      storage = new ExtensionStorage("group.com.nutrion.app");
      console.log('Widget storage initialized successfully');
    } catch (storageError) {
      console.warn('Failed to initialize widget storage:', storageError);
      storage = null;
    }
  } catch (importError) {
    console.warn('Apple targets not available:', importError);
  }
}

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Update widget state whenever what we want to show changes
  React.useEffect(() => {
    if (Platform.OS === 'ios' && ExtensionStorage) {
      try {
        // set widget_state to null if we want to reset the widget
        // storage?.set("widget_state", null);

        // Refresh widget
        ExtensionStorage.reloadWidget();
        console.log('Widget refreshed successfully');
      } catch (error) {
        console.warn('Failed to refresh widget:', error);
      }
    }
  }, []);

  const refreshWidget = useCallback(() => {
    if (Platform.OS === 'ios' && ExtensionStorage) {
      try {
        ExtensionStorage.reloadWidget();
        console.log('Widget refresh triggered');
      } catch (error) {
        console.warn('Failed to trigger widget refresh:', error);
      }
    } else {
      console.log('Widget refresh not available on this platform');
    }
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
