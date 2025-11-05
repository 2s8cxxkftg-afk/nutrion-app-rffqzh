
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/utils/supabase';

const LANGUAGE_SELECTED_KEY = '@nutrion_language_selected';
const ONBOARDING_KEY = '@nutrion_onboarding_completed';
const SUBSCRIPTION_INTRO_KEY = '@nutrion_subscription_intro_completed';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [hasSeenSubscriptionIntro, setHasSeenSubscriptionIntro] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      console.log('=== Checking App Status ===');
      
      // Check language selection status
      const languageValue = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
      console.log('Language selected value from AsyncStorage:', languageValue);
      const selectedLanguage = languageValue === 'true';
      console.log('Has selected language:', selectedLanguage);
      setHasSelectedLanguage(selectedLanguage);

      // Check onboarding status
      const onboardingValue = await AsyncStorage.getItem(ONBOARDING_KEY);
      console.log('Onboarding value from AsyncStorage:', onboardingValue);
      const completedOnboarding = onboardingValue === 'true';
      console.log('Has completed onboarding:', completedOnboarding);
      setHasCompletedOnboarding(completedOnboarding);

      // Check subscription intro status
      const subscriptionIntroValue = await AsyncStorage.getItem(SUBSCRIPTION_INTRO_KEY);
      console.log('Subscription intro value from AsyncStorage:', subscriptionIntroValue);
      const seenSubscriptionIntro = subscriptionIntroValue === 'true';
      console.log('Has seen subscription intro:', seenSubscriptionIntro);
      setHasSeenSubscriptionIntro(seenSubscriptionIntro);

      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth session exists:', !!session);
      setIsAuthenticated(!!session);
      
      // Show splash screen with logo for 1.5 seconds
      setTimeout(() => {
        console.log('Splash screen complete, navigating...');
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error checking app status:', error);
      // On error, assume nothing completed
      setHasSelectedLanguage(false);
      setHasCompletedOnboarding(false);
      setHasSeenSubscriptionIntro(false);
      setIsAuthenticated(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
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
      </View>
    );
  }

  // Navigation logic:
  // 1. If language not selected -> go to language selection
  // 2. If language selected but onboarding not completed -> go to onboarding
  // 3. If onboarding completed but not authenticated -> go to auth
  // 4. If authenticated but hasn't seen subscription intro -> go to subscription intro
  // 5. If all completed -> go to app
  console.log('=== Navigation Decision ===');
  console.log('Language selected:', hasSelectedLanguage);
  console.log('Onboarding completed:', hasCompletedOnboarding);
  console.log('Authenticated:', isAuthenticated);
  console.log('Seen subscription intro:', hasSeenSubscriptionIntro);
  
  if (!hasSelectedLanguage) {
    console.log('Redirecting to: /language-selection');
    return <Redirect href="/language-selection" />;
  }

  if (!hasCompletedOnboarding) {
    console.log('Redirecting to: /onboarding');
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    console.log('Redirecting to: /auth');
    return <Redirect href="/auth" />;
  }

  if (!hasSeenSubscriptionIntro) {
    console.log('Redirecting to: /subscription-intro');
    return <Redirect href="/subscription-intro" />;
  }

  console.log('Redirecting to: /(tabs)/pantry');
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
