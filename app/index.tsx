
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';
import { getSubscription, hasActiveAccess } from '@/utils/subscription';

const LANGUAGE_SELECTED_KEY = '@nutrion_language_selected';
const ONBOARDING_KEY = '@nutrion_onboarding_completed';
const SUBSCRIPTION_INTRO_KEY = '@nutrion_subscription_intro_completed';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [hasSeenSubscriptionIntro, setHasSeenSubscriptionIntro] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      console.log('=== Checking App Status ===');
      
      // Check language selection status
      const languageValue = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
      const selectedLanguage = languageValue === 'true';
      console.log('Language selected:', selectedLanguage);
      setHasSelectedLanguage(selectedLanguage);

      // Check onboarding status
      const onboardingValue = await AsyncStorage.getItem(ONBOARDING_KEY);
      const completedOnboarding = onboardingValue === 'true';
      console.log('Onboarding completed:', completedOnboarding);
      setHasCompletedOnboarding(completedOnboarding);

      // Check authentication status with timeout
      let authenticated = false;
      let premiumAccess = false;
      
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

        // Check subscription status if authenticated
        if (session) {
          try {
            premiumAccess = await hasActiveAccess();
            console.log('Premium access:', premiumAccess);
            setHasPremium(premiumAccess);
          } catch (error) {
            console.error('Error checking subscription:', error);
          }
        }
      } catch (authError: any) {
        console.error('Auth check error:', authError.message);
        setIsAuthenticated(false);
        setHasPremium(false);
      }

      // Check subscription intro status
      const subscriptionIntroValue = await AsyncStorage.getItem(SUBSCRIPTION_INTRO_KEY);
      const seenSubscriptionIntro = subscriptionIntroValue === 'true';
      console.log('Seen subscription intro:', seenSubscriptionIntro);
      setHasSeenSubscriptionIntro(seenSubscriptionIntro);
      
      // Show splash screen for 1 second
      setTimeout(() => {
        console.log('Navigation ready');
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Error checking app status:', error);
      setError(error.message || 'Failed to initialize');
      // On error, assume nothing completed
      setHasSelectedLanguage(false);
      setHasCompletedOnboarding(false);
      setHasSeenSubscriptionIntro(false);
      setIsAuthenticated(false);
      setHasPremium(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  if (isLoading || hasSelectedLanguage === null || hasCompletedOnboarding === null || hasSeenSubscriptionIntro === null) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/images/609a5e99-cd5d-4fbc-a55d-088a645e292c.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }

  // Navigation logic
  console.log('=== Navigation Decision ===');
  console.log('Language:', hasSelectedLanguage);
  console.log('Onboarding:', hasCompletedOnboarding);
  console.log('Authenticated:', isAuthenticated);
  console.log('Premium:', hasPremium);
  console.log('Seen intro:', hasSeenSubscriptionIntro);
  
  if (!hasSelectedLanguage) {
    console.log('→ /language-selection');
    return <Redirect href="/language-selection" />;
  }

  if (!hasCompletedOnboarding) {
    console.log('→ /onboarding');
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    console.log('→ /auth');
    return <Redirect href="/auth" />;
  }

  // Only show subscription intro if user doesn't have premium and hasn't seen it
  if (!hasSeenSubscriptionIntro && !hasPremium) {
    console.log('→ /subscription-intro');
    return <Redirect href="/subscription-intro" />;
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
  logo: {
    width: 200,
    height: 200,
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
});
