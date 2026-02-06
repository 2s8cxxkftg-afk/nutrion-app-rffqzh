
/**
 * Authentication Context for Nutrion
 *
 * Provides authentication state and methods throughout the app using Supabase.
 * This is a simplified context that wraps Supabase auth.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/utils/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    console.log('[AuthProvider] Initializing on platform:', Platform.OS);

    // Get initial session with error handling and timeout
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Getting initial session...');
        
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
        );
        
        const result = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!isMounted) {
          console.log('[AuthProvider] Component unmounted during auth init');
          return;
        }
        
        if (result && result.data) {
          const { session, error } = result.data;
          
          if (error) {
            console.error('[AuthProvider] Error getting initial session:', error.message);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          console.log('[AuthProvider] Auth initialized, user:', session?.user?.email || 'none');
        } else {
          console.log('[AuthProvider] No session data returned');
          setSession(null);
          setUser(null);
        }
      } catch (error: any) {
        console.error('[AuthProvider] Failed to initialize auth:', error?.message || error);
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes with error handling
    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) {
          console.log('[AuthProvider] Component unmounted, ignoring auth change');
          return;
        }
        
        console.log('[AuthProvider] Auth state changed:', _event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = authSubscription;
    } catch (error: any) {
      console.error('[AuthProvider] Failed to set up auth listener:', error?.message || error);
      // Don't crash the app if auth listener fails
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      try {
        if (subscription) {
          subscription.unsubscribe();
        }
      } catch (error: any) {
        console.error('[AuthProvider] Error unsubscribing from auth:', error?.message || error);
      }
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('[AuthProvider] Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthProvider] Sign out error:', error);
        throw error;
      }
      setUser(null);
      setSession(null);
      console.log('[AuthProvider] Sign out successful');
    } catch (error) {
      console.error('[AuthProvider] Error signing out:', error);
      // Clear local state even if API call fails
      setUser(null);
      setSession(null);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      console.log('[AuthProvider] Refreshing session');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[AuthProvider] Refresh session error:', error);
        throw error;
      }
      setSession(session);
      setUser(session?.user ?? null);
      console.log('[AuthProvider] Session refreshed');
    } catch (error) {
      console.error('[AuthProvider] Error refreshing session:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
