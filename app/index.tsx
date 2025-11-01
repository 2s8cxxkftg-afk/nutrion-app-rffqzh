
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';

const ONBOARDING_KEY = '@nutrion_onboarding_completed';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      // Check onboarding status
      const onboardingValue = await AsyncStorage.getItem(ONBOARDING_KEY);
      console.log('Onboarding status:', onboardingValue);
      const completedOnboarding = onboardingValue === 'true';
      setHasCompletedOnboarding(completedOnboarding);

      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth session:', session ? 'exists' : 'none');
      setIsAuthenticated(!!session);
      
      // Show splash screen with logo for 1.5 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error checking app status:', error);
      setHasCompletedOnboarding(false);
      setIsAuthenticated(false);
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

  // Navigation logic:
  // 1. If onboarding not completed -> go to onboarding
  // 2. If onboarding completed but not authenticated -> go to auth
  // 3. If both completed -> go to app
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
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
