
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
import { OpenFoodFactsProduct, PantryItem, FOOD_CATEGORIES } from '@/types/pantry';
import { addPantryItem } from '@/utils/storage';
import Toast from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import { predictExpirationDate, getExpirationEstimation } from '@/utils/expirationHelper';
import { categorizeFoodItem } from '@/utils/categoryHelper';

export default function ScanBarcodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    console.log('=== Barcode Scanner Initialized ===');
    console.log('Camera permission status:', permission);
    console.log('Permission granted:', permission?.granted);
    console.log('Can ask again:', permission?.canAskAgain);
  }, [permission]);

  const fetchProductFromBarcode = async (barcode: string) => {
    try {
      setLoading(true);
      console.log('=== Fetching Product ===');
      console.log('Barcode:', barcode);
      
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Nutrion - Pantry Management App',
          },
        }
      );
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Open Food Facts response status:', data.status);
      console.log('Product found:', data.status === 1);
      
      if (data.status === 1 && data.product) {
        const product: OpenFoodFactsProduct = data.product;
        console.log('Product name:', product.product_name);
        console.log('Product brands:', product.brands);
        
        // Auto-categorize the product
        const autoCategory = categorizeFoodItem(product.product_name || 'Unknown Product');
        console.log('Auto-categorized as:', autoCategory);
        
        // Predict expiration date using AI
        const predictedExpiration = predictExpirationDate(
          product.product_name || 'Unknown Product',
          autoCategory,
          new Date(),
          true
        );
        
        const expirationEstimation = getExpirationEstimation(
          product.product_name || 'Unknown Product',
          true
        );
        
        console.log('Predicted expiration:', predictedExpiration);
        console.log('Expiration estimation:', expirationEstimation);
        
        Alert.alert(
          t('productFound'),
          `${product.product_name || 'Unknown Product'}\n${product.brands ? `Brand: ${product.brands}` : ''}\n\nCategory: ${autoCategory}\n${expirationEstimation ? `\n✨ AI Prediction: ${expirationEstimation}` : ''}\n\nWould you like to add this to your pantry?`,
          [
            {
              text: t('cancel'),
              style: 'cancel',
              onPress: () => {
                console.log('User cancelled adding product');
                setScanned(false);
                setLoading(false);
              },
            },
            {
              text: t('addToPantry'),
              onPress: async () => {
                try {
                  console.log('Adding product to pantry...');
                  const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                  const newItem: PantryItem = {
                    id: uniqueId,
                    name: product.product_name || 'Unknown Product',
                    category: autoCategory,
                    quantity: 1,
                    unit: 'pcs',
                    dateAdded: new Date().toISOString(),
                    expirationDate: predictedExpiration.toISOString().split('T')[0],
                    brandName: product.brands,
                    calories: product.nutriments?.['energy-kcal'] || 0,
                    photo: product.image_url,
                    barcode: barcode,
                    notes: expirationEstimation ? `AI Prediction: ${expirationEstimation}` : '',
                  };

                  await addPantryItem(newItem);
                  console.log('✅ Product successfully added to pantry');

                  Toast.show({
                    message: t('pantry.itemAdded'),
                    type: 'success',
                  });
                  setLoading(false);
                  
                  setTimeout(() => {
                    router.back();
                  }, 1500);
                } catch (error) {
                  console.error('❌ Error adding product to pantry:', error);
                  Alert.alert(t('error'), 'Failed to add product to pantry');
                  setScanned(false);
                  setLoading(false);
                }
              },
            },
          ]
        );
      } else {
        console.log('❌ Product not found in Open Food Facts database');
        Alert.alert(
          t('productNotFound'),
          t('productNotFoundText'),
          [
            {
              text: t('addManually'),
              onPress: () => {
                console.log('User chose to add manually');
                setLoading(false);
                router.back();
                setTimeout(() => {
                  router.push('/add-item');
                }, 100);
              },
            },
            {
              text: t('tryAgain'),
              onPress: () => {
                console.log('User chose to try again');
                setScanned(false);
                setLoading(false);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
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
              setLoading(false);
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
      console.log('⚠️ Already processing a scan, ignoring...');
      return;
    }
    
    console.log('=== Barcode Detected ===');
    console.log('Type:', type);
    console.log('Data:', data);
    console.log('Camera ready:', cameraReady);
    
    setScanned(true);
    fetchProductFromBarcode(data);
  };

  const handleCameraReady = () => {
    console.log('✅ Camera is ready');
    setCameraReady(true);
  };

  if (!permission) {
    console.log('⏳ Waiting for permission status...');
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16 }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    console.log('❌ Camera permission not granted');
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
            onPress={() => {
              console.log('Requesting camera permission...');
              requestPermission();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.permissionButtonText}>{t('grantPermission')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  console.log('✅ Rendering camera view');
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
          onCameraReady={handleCameraReady}
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
              'aztec',
              'datamatrix',
              'pdf417',
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
            {loading 
              ? t('lookingUp') 
              : !cameraReady 
              ? 'Initializing camera...' 
              : t('positionBarcode')}
          </Text>
          
          {loading && (
            <ActivityIndicator 
              size="large" 
              color={colors.primary} 
              style={{ marginTop: 16 }}
            />
          )}
          
          {!cameraReady && !loading && (
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
              console.log('🔄 Resetting scanner');
              setScanned(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.rescanButtonText}>{t('scanAgain')}</Text>
          </TouchableOpacity>
        )}
      </View>
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
});
