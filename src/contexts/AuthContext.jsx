import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const authInitializedRef = useRef(false); // Track if auth has been initialized

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    // Timeout fallback to ensure loading doesn't hang
    const loadingTimeout = setTimeout(() => {
      if (mounted && !authInitializedRef.current) {
        console.warn('Auth initialization timed out, switching to demo mode');
        setLoading(false);
        authInitializedRef.current = true;
      }
    }, 10000); // 10 second timeout - more generous for network issues

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
      console.log('Running in demo mode - Supabase not configured');
      if (mounted) {
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
      return;
    }

    // Set up auth listener first (this will handle both initial session and state changes)
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          
          console.log('Auth state changed:', event, session);
          console.log('🔍 Auth state change - authInitializedRef.current:', authInitializedRef.current);
          
          setSession(session);
          setUser(session?.user ?? null);
          
          try {
            if (session?.user) {
              console.log('🔍 Fetching user profile for:', session.user.id);
              // Don't await the profile fetch - let it run in background
              fetchUserProfile(session.user.id).then(() => {
                console.log('✅ User profile fetched successfully');
              }).catch((error) => {
                console.warn('Error fetching user profile:', error);
              });
            } else {
              setUserProfile(null);
              console.log('🔍 No user, setting profile to null');
            }
          } catch (error) {
            console.warn('Error in auth state change handler:', error);
          }
          
          // Clear timeout when auth state changes (this handles the case where
          // the initial session fetch is slow but auth state change completes first)
          console.log('🔍 Clearing timeout and checking initialization...');
          clearTimeout(loadingTimeout);
          console.log('🔍 authInitializedRef.current before check:', authInitializedRef.current);
          
          if (!authInitializedRef.current) {
            console.log('🔍 Setting loading to false and marking as initialized');
            setLoading(false);
            authInitializedRef.current = true;
            console.log('✅ Auth state change completed, loading finished');
          } else {
            console.log('🔍 Auth already initialized, skipping');
          }
        }
      );
      subscription = data.subscription;
    } catch (error) {
      console.warn('Could not set up auth listener (running in demo mode):', error);
    }

    // Cleanup function
    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      // Skip profile fetching in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
        console.log('Skipping profile fetch - demo mode');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      
      // Check if Supabase is properly configured
      if (!supabase.supabaseUrl || supabase.supabaseUrl.includes('your-project-ref')) {
        throw new Error('Supabase is not configured. Please set up your environment variables.');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      // Check if Supabase is properly configured
      if (!supabase.supabaseUrl || supabase.supabaseUrl.includes('your-project-ref')) {
        throw new Error('Supabase is not configured. Please set up your environment variables.');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const value = useMemo(() => ({
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchUserProfile
  }), [user, session, userProfile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 