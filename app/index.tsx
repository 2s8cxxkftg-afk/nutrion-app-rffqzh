
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import { shouldShowPaywall } from '@/utils/subscription';

const ONBOARDING_KEY = '@nutrion_onboarding_completed';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

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

        // Check if should show paywall
        if (authenticated) {
          const needsPaywall = await shouldShowPaywall();
          console.log('Needs paywall:', needsPaywall);
          setShowPaywall(needsPaywall);
        }
      } catch (authError: any) {
        console.error('Auth check error:', authError.message);
        setIsAuthenticated(false);
        setShowPaywall(false);
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
      setShowPaywall(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleSkipToApp = async () => {
    try {
      // Mark everything as completed
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      
      // Reload the app state
      checkAppStatus();
    } catch (error) {
      console.error('Error skipping to app:', error);
    }
  };

  const handleResetApp = async () => {
    try {
      // Clear all onboarding flags
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      
      // Reload the app state
      checkAppStatus();
    } catch (error) {
      console.error('Error resetting app:', error);
    }
  };

  if (isLoading || hasCompletedOnboarding === null) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {/* Debug button - long press logo to show */}
        <TouchableOpacity 
          style={styles.debugTrigger}
          onLongPress={() => setShowDebug(true)}
          delayLongPress={3000}
        >
          <View style={{ height: 100, width: 100 }} />
        </TouchableOpacity>

        {showDebug && (
          <View style={styles.debugContainer}>
            <TouchableOpacity style={styles.debugButton} onPress={handleSkipToApp}>
              <Text style={styles.debugButtonText}>Skip to App</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.debugButton, styles.debugButtonSecondary]} onPress={handleResetApp}>
              <Text style={styles.debugButtonText}>Reset Onboarding</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Navigation logic
  console.log('=== Navigation Decision ===');
  console.log('Onboarding:', hasCompletedOnboarding);
  console.log('Authenticated:', isAuthenticated);
  console.log('Show paywall:', showPaywall);

  if (!hasCompletedOnboarding) {
    console.log('→ /introduction');
    return <Redirect href="/introduction" />;
  }

  if (!isAuthenticated) {
    console.log('→ /auth');
    return <Redirect href="/auth" />;
  }

  // Check if user needs to see paywall
  if (showPaywall) {
    console.log('→ /paywall');
    return <Redirect href="/paywall" />;
  }

  console.log('→ /(tabs)/pantry');
  return <Redirect href="/(tabs)/pantry" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 160,
    height: 160,
    opacity: 0.95,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 20,
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  debugTrigger: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  debugContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    gap: 12,
  },
  debugButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  debugButtonSecondary: {
    backgroundColor: '#6c757d',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
