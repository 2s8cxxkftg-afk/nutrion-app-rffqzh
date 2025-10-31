
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { OpenFoodFactsProduct, PantryItem } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export default function ScanBarcodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    console.log('Camera permission status:', permission);
  }, [permission]);

  const fetchProductFromBarcode = async (barcode: string) => {
    try {
      setLoading(true);
      console.log('Fetching product for barcode:', barcode);
      
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Nutrion - Pantry Management App',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Open Food Facts response status:', data.status);
      
      if (data.status === 1 && data.product) {
        const product: OpenFoodFactsProduct = data.product;
        console.log('Product found:', product.product_name);
        
        Alert.alert(
          t('productFound'),
          `${product.product_name || 'Unknown Product'}\n${product.brands ? `Brand: ${product.brands}` : ''}\n\nWould you like to add this to your pantry?`,
          [
            {
              text: t('cancel'),
              style: 'cancel',
              onPress: () => {
                setScanned(false);
                setLoading(false);
              },
            },
            {
              text: t('addToPantry'),
              onPress: async () => {
                try {
                  const productNameLower = (product.product_name || '').toLowerCase();
                  let category = 'Other';
                  
                  if (productNameLower.includes('milk') || productNameLower.includes('cheese') || productNameLower.includes('yogurt')) {
                    category = 'Dairy';
                  } else if (productNameLower.includes('chicken') || productNameLower.includes('beef') || productNameLower.includes('pork') || productNameLower.includes('meat')) {
                    category = 'Meat';
                  } else if (productNameLower.includes('bread') || productNameLower.includes('rice') || productNameLower.includes('pasta')) {
                    category = 'Grains';
                  } else if (productNameLower.includes('juice') || productNameLower.includes('soda') || productNameLower.includes('water')) {
                    category = 'Beverages';
                  } else if (productNameLower.includes('chips') || productNameLower.includes('cookie') || productNameLower.includes('candy')) {
                    category = 'Snacks';
                  } else if (productNameLower.includes('sauce') || productNameLower.includes('ketchup') || productNameLower.includes('mayo')) {
                    category = 'Condiments';
                  }

                  const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                  const newItem: PantryItem = {
                    id: uniqueId,
                    name: product.product_name || 'Unknown Product',
                    category: category,
                    quantity: 1,
                    unit: 'pcs',
                    dateAdded: new Date().toISOString(),
                    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    brandName: product.brands,
                    calories: product.nutriments?.['energy-kcal'] || 0,
                    photo: product.image_url,
                    barcode: barcode,
                    notes: '',
                  };

                  await addPantryItem(newItem);
                  console.log('Product added to pantry:', newItem);

                  // Show toast notification
                  setToastMessage(t('itemAdded'));
                  setShowToast(true);
                  setLoading(false);
                  
                  // Navigate back after a short delay
                  setTimeout(() => {
                    router.back();
                  }, 1500);
                } catch (error) {
                  console.error('Error adding product to pantry:', error);
                  Alert.alert(t('error'), 'Failed to add product to pantry');
                  setScanned(false);
                  setLoading(false);
                }
              },
            },
          ]
        );
      } else {
        console.log('Product not found in database');
        Alert.alert(
          t('productNotFound'),
          t('productNotFoundText'),
          [
            {
              text: t('addManually'),
              onPress: () => {
                router.back();
                setTimeout(() => {
                  router.push('/add-item');
                }, 100);
              },
            },
            {
              text: t('tryAgain'),
              onPress: () => {
                setScanned(false);
                setLoading(false);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert(
        t('error'),
        'Failed to fetch product information. Please check your internet connection and try again.',
        [
          {
            text: t('tryAgain'),
            onPress: () => {
              setScanned(false);
              setLoading(false);
            },
          },
          {
            text: t('addManually'),
            onPress: () => {
              router.back();
              setTimeout(() => {
                router.push('/add-item');
              }, 100);
            },
          },
        ]
      );
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || loading) {
      console.log('Already processing a scan, ignoring...');
      return;
    }
    
    console.log('Barcode scanned - Type:', type, 'Data:', data);
    setScanned(true);
    
    fetchProductFromBarcode(data);
  };

  if (!permission) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: t('scanBarcodeTitle'),
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            presentation: 'modal',
          }}
        />
        <View style={[commonStyles.container, styles.permissionContainer]}>
          <IconSymbol name="camera.fill" size={64} color={colors.textSecondary} />
          <Text style={[commonStyles.title, { textAlign: 'center', marginTop: 16 }]}>
            {t('cameraPermission')}
          </Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }]}>
            {t('cameraPermissionText')}
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.7}
          >
            <Text style={styles.permissionButtonText}>{t('grantPermission')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.safeArea, { backgroundColor: '#000' }]} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('scanBarcodeTitle'),
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#FFFFFF',
          presentation: 'modal',
        }}
      />
      
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'qr',
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code128',
              'code39',
              'code93',
              'codabar',
              'itf14',
            ],
          }}
        />
        
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          <Text style={styles.instructionText}>
            {loading ? t('lookingUp') : t('positionBarcode')}
          </Text>
          
          {loading && (
            <ActivityIndicator 
              size="large" 
              color={colors.primary} 
              style={{ marginTop: 16 }}
            />
          )}
        </View>

        {scanned && !loading && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => {
              console.log('Resetting scanner');
              setScanned(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.rescanButtonText}>{t('scanAgain')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast
        visible={showToast}
        message={toastMessage}
        type="success"
        duration={2000}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 32,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  rescanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
