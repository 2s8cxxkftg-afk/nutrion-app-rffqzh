import * as React from "react";
import { createContext, useCallback, useContext } from "react";
import { Platform } from "react-native";

// Safely import ExtensionStorage only on iOS with comprehensive error handling
let ExtensionStorage: any = null;
let storage: any = null;
let isWidgetAvailable = false;

if (Platform.OS === 'ios') {
  try {
    // Try to import apple targets
    const appleTargets = require("@bacons/apple-targets");
    
    if (appleTargets && appleTargets.ExtensionStorage) {
      ExtensionStorage = appleTargets.ExtensionStorage;
      
      // Initialize storage with error handling
      try {
        storage = new ExtensionStorage("group.com.nutrion.app");
        isWidgetAvailable = true;
        console.log('Widget storage initialized successfully');
      } catch (storageError: any) {
        console.warn('Failed to initialize widget storage:', storageError?.message || storageError);
        storage = null;
        isWidgetAvailable = false;
      }
    } else {
      console.warn('ExtensionStorage not found in apple targets');
      isWidgetAvailable = false;
    }
  } catch (importError: any) {
    console.warn('Apple targets not available (this is normal on non-iOS or simulator):', importError?.message || importError);
    isWidgetAvailable = false;
  }
} else {
  console.log('Widget functionality is iOS-only, current platform:', Platform.OS);
}

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Update widget state whenever what we want to show changes
  React.useEffect(() => {
    if (Platform.OS === 'ios' && isWidgetAvailable && ExtensionStorage) {
      try {
        // set widget_state to null if we want to reset the widget
        // storage?.set("widget_state", null);

        // Refresh widget
        ExtensionStorage.reloadWidget();
        console.log('Widget refreshed successfully');
      } catch (error: any) {
        console.warn('Failed to refresh widget:', error?.message || error);
      }
    } else {
      console.log('Widget not available - skipping refresh');
    }
  }, []);

  const refreshWidget = useCallback(() => {
    if (Platform.OS === 'ios' && isWidgetAvailable && ExtensionStorage) {
      try {
        ExtensionStorage.reloadWidget();
        console.log('Widget refresh triggered');
      } catch (error: any) {
        console.warn('Failed to trigger widget refresh:', error?.message || error);
      }
    } else {
      console.log('Widget refresh not available on this platform or not initialized');
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
