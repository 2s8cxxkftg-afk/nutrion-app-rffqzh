
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';

const ONBOARDING_KEY = '@nutrion_onboarding_completed';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      console.log('=== Checking App Status ===');

      // Check onboarding status
      const onboardingValue = await AsyncStorage.getItem(ONBOARDING_KEY);
      const completedOnboarding = onboardingValue === 'true';
      console.log('Onboarding completed:', completedOnboarding);
      setHasCompletedOnboarding(completedOnboarding);

      // Check authentication status with timeout
      let authenticated = false;
      
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        }
        
        authenticated = !!session;
        console.log('Authenticated:', authenticated);
        setIsAuthenticated(authenticated);
      } catch (authError: any) {
        console.error('Auth check error:', authError.message);
        setIsAuthenticated(false);
      }
      
      // Show splash screen for 1 second
      setTimeout(() => {
        console.log('Navigation ready');
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Error checking app status:', error);
      setError(error.message || 'Failed to initialize');
      // On error, assume nothing completed
      setHasCompletedOnboarding(false);
      setIsAuthenticated(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  if (isLoading || hasCompletedOnboarding === null) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/575cb505-3519-4304-a96f-a07004583fb2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Nutrion</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }

  // Navigation logic
  console.log('=== Navigation Decision ===');
  console.log('Onboarding:', hasCompletedOnboarding);
  console.log('Authenticated:', isAuthenticated);

  if (!hasCompletedOnboarding) {
    console.log('→ /introduction');
    return <Redirect href="/introduction" />;
  }

  if (!isAuthenticated) {
    console.log('→ /auth');
    return <Redirect href="/auth" />;
  }

  console.log('→ /(tabs)/pantry');
  return <Redirect href="/(tabs)/pantry" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F1E8',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1F5F4E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F5F4E',
    marginTop: 24,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 32,
  },
  errorText: {
    marginTop: 20,
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
