
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export interface BiometricCapabilities {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

export const checkBiometricCapabilities = async (): Promise<BiometricCapabilities> => {
  try {
    console.log('🔐 Checking biometric capabilities...');
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    console.log('Has biometric hardware:', hasHardware);
    
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    console.log('Is biometric enrolled:', isEnrolled);
    
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    console.log('Supported biometric types:', supportedTypes);

    return {
      isAvailable: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      supportedTypes,
    };
  } catch (error) {
    console.error('Error checking biometric capabilities:', error);
    return {
      isAvailable: false,
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
    };
  }
};

export const getBiometricTypeName = (types: LocalAuthentication.AuthenticationType[]): string => {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris Recognition';
  }
  return 'Biometric Authentication';
};

export const authenticateWithBiometrics = async (
  promptMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔐 Starting biometric authentication...');
    const capabilities = await checkBiometricCapabilities();

    if (!capabilities.isAvailable) {
      console.log('❌ Biometric authentication not available');
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    const biometricName = getBiometricTypeName(capabilities.supportedTypes);
    console.log('Using biometric type:', biometricName);

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || `Authenticate with ${biometricName}`,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use passcode',
    });

    console.log('Biometric authentication result:', result);

    if (result.success) {
      console.log('✅ Biometric authentication successful');
      return { success: true };
    } else {
      console.log('❌ Biometric authentication failed:', result.error);
      return {
        success: false,
        error: result.error || 'Authentication failed',
      };
    }
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during authentication',
    };
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    console.log('Biometric enabled status:', enabled);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric enabled status:', error);
    return false;
  }
};

export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  try {
    console.log('Setting biometric enabled to:', enabled);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    console.log('✅ Biometric enabled status saved');
  } catch (error) {
    console.error('Error setting biometric enabled status:', error);
    throw error;
  }
};

export const saveBiometricCredentials = async (
  email: string,
  userId: string
): Promise<void> => {
  try {
    console.log('Saving biometric credentials for user:', email);
    const credentials = JSON.stringify({ email, userId });
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
    console.log('✅ Biometric credentials saved');
  } catch (error) {
    console.error('Error saving biometric credentials:', error);
    throw error;
  }
};

export const getBiometricCredentials = async (): Promise<{
  email: string;
  userId: string;
} | null> => {
  try {
    const credentials = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (credentials) {
      console.log('✅ Biometric credentials found');
      return JSON.parse(credentials);
    }
    console.log('⚠️ No biometric credentials found');
    return null;
  } catch (error) {
    console.error('Error getting biometric credentials:', error);
    return null;
  }
};

export const clearBiometricCredentials = async (): Promise<void> => {
  try {
    console.log('Clearing biometric credentials...');
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    console.log('✅ Biometric credentials cleared');
  } catch (error) {
    console.error('Error clearing biometric credentials:', error);
    throw error;
  }
};
