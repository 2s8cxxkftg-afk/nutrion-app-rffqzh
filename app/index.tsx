
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';

const ONBOARDING_KEY = '@nutrion_onboarding_completed';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      console.log('Onboarding status:', value);
      setHasCompletedOnboarding(value === 'true');
      
      // Show splash screen with logo for 1.5 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/pantry" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    width: 200,
    height: 200,
  },
});
