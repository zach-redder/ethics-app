import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  WelcomeScreen,
  SignUpScreen,
  SignInScreen,
  NameInputScreen,
  GroupChoiceScreen,
  CreateGroupScreen,
  JoinGroupScreen,
  GroupConfirmationScreen,
  DashboardScreen,
  ProfileScreen,
  CreatedGroupDetailScreen,
  ManageMembersScreen,
  ExerciseDetailScreen,
  JoinedGroupDetailScreen,
  JoinedExerciseDetailScreen,
  ReportIssueScreen,
  ReportIssueSuccessModal,
} from './src/screens';
import { authService, userService } from './src/services';
import { clearSession } from './src/services/supabase';
import { COLORS } from './src/constants';

/**
 * Main App Component
 * Handles navigation flow for onboarding and main app
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    console.log('🚀 [App] Component mounted, initializing auth check');
    checkAuthStatus();

    // Listen to auth state changes
    console.log('👂 [App] Setting up auth state change listener');
    let isHandlingAuthChange = false;
    
    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        // Prevent recursive handling
        if (isHandlingAuthChange && event === 'SIGNED_OUT') {
          console.log('⚠️ [App] Skipping duplicate SIGNED_OUT event');
          return;
        }
        
        isHandlingAuthChange = true;
        
        console.log('🔄 [App] Auth state changed:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          timestamp: new Date().toISOString(),
        });
        
        try {
          if (session?.user) {
            console.log('✅ [App] User authenticated:', session.user.id);
            setUser(session.user);
            // Check if user has completed profile setup
            await checkUserProfile(session.user.id);
          } else {
            console.log('👤 [App] No user session, showing welcome screen');
            setUser(null);
            setCurrentScreen('Welcome');
          }
        } catch (error) {
          console.error('❌ [App] Error in auth state change handler:', {
            error: error.message,
            event,
            timestamp: new Date().toISOString(),
          });
        } finally {
          // Reset flag after a short delay
          setTimeout(() => {
            isHandlingAuthChange = false;
          }, 500);
        }
      }
    );

    return () => {
      console.log('🧹 [App] Cleaning up auth listener');
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    const timestamp = new Date().toISOString();
    console.log('🔍 [App] checkAuthStatus called at', timestamp);
    
    try {
      const { data, error } = await authService.getSession();
      
      if (error) {
        console.error('❌ [App] Auth check failed:', {
          errorMessage: error.message,
          errorName: error.name,
          errorType: error.constructor.name,
          timestamp,
        });
        
        // If it's a network error with refresh token, clear the session
        if ((error.message?.includes('Network request failed') || 
             error.message?.includes('fetch') ||
             error.name === 'AuthRetryableFetchError') &&
            error.message?.includes('refresh_token')) {
          console.warn('⚠️ [App] Refresh token network error - clearing corrupted session');
          try {
            await clearSession();
            console.log('✅ [App] Session cleared, user will need to sign in again');
          } catch (clearError) {
            console.error('❌ [App] Error clearing session:', clearError);
          }
        }
        
        // If it's a network error, Supabase might not be configured
        if (error.message?.includes('Network request failed') || 
            error.message?.includes('fetch') ||
            error.name === 'AuthRetryableFetchError') {
          console.error('🌐 [App] Network error detected - troubleshooting:');
          console.error('  1. Check if .env file exists and has correct values');
          console.error('  2. Restart Expo server: npm start -- --clear');
          console.error('  3. Verify Supabase URL is accessible');
          console.error('  4. Check internet connection');
          console.error('  5. Verify Supabase project is active (not paused)');
        }
      } else if (data?.session?.user) {
        console.log('✅ [App] User session found:', data.session.user.id);
        setUser(data.session.user);
        await checkUserProfile(data.session.user.id);
      } else {
        console.log('ℹ️ [App] No active session found');
      }
    } catch (error) {
      console.error('❌ [App] Exception in checkAuthStatus:', {
        errorMessage: error.message,
        errorName: error.name,
        errorType: error.constructor.name,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
        timestamp,
      });
      
      // Handle network errors gracefully
      if (error.message?.includes('Network request failed') || 
          error.message?.includes('fetch') ||
          error.name === 'AuthRetryableFetchError') {
        console.error('🌐 [App] Network error - Make sure you have:');
        console.error('1. Created a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
        console.error('2. Restarted the Expo development server: npm start -- --clear');
        console.error('3. Verified your Supabase project is active');
        
        // Clear session if it's a refresh token error
        if (error.message?.includes('refresh_token')) {
          console.warn('⚠️ [App] Clearing corrupted session due to refresh token error');
          try {
            await clearSession();
          } catch (clearError) {
            // Ignore clear errors
          }
        }
      }
    } finally {
      console.log('🏁 [App] checkAuthStatus completed, setting loading to false');
      setLoading(false);
    }
  };

  const checkUserProfile = async (userId) => {
    try {
      const { data, error } = await userService.getUser(userId);
      if (error) {
        // Handle network errors
        if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
          console.error('⚠️ Network error when checking user profile');
          // Still go to name input screen to allow user to continue
        }
        // User profile not created, go to name input
        setCurrentScreen('NameInput');
      } else if (data) {
        // User profile exists, go to dashboard
        setCurrentScreen('Dashboard');
      } else {
        setCurrentScreen('NameInput');
      }
    } catch (error) {
      console.error('Profile check error:', error);
      // Handle network errors gracefully
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        console.error('⚠️ Network error - Check Supabase configuration');
      }
      setCurrentScreen('NameInput');
    }
  };

  const navigation = {
    navigate: (screen, params = {}) => {
      setCurrentScreen(screen);
      setRouteParams(params);
    },
    goBack: () => {
      // Simple back navigation mapping
      const backMap = {
        'SignUp': 'Welcome',
        'SignIn': 'Welcome',
        'NameInput': 'SignUp',
        'GroupChoice': 'NameInput',
        'CreateGroup': 'GroupChoice',
        'JoinGroup': 'GroupChoice',
        'GroupConfirmation': 'GroupChoice',
        'Dashboard': 'GroupChoice',
        'Profile': 'Dashboard',
        'ReportIssue': 'Profile',
        'CreatedGroupDetail': 'Dashboard',
        'ManageMembers': 'CreatedGroupDetail',
        'ExerciseDetail': 'CreatedGroupDetail',
        'JoinedGroupDetail': 'Dashboard',
        'JoinedExerciseDetail': 'JoinedGroupDetail',
      };
      setCurrentScreen(backMap[currentScreen] || 'Welcome');
    },
  };

  const route = {
    params: routeParams,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Welcome':
        return <WelcomeScreen navigation={navigation} />;
      case 'SignUp':
        return <SignUpScreen navigation={navigation} />;
      case 'SignIn':
        return <SignInScreen navigation={navigation} />;
      case 'NameInput':
        return <NameInputScreen navigation={navigation} />;
      case 'GroupChoice':
        return <GroupChoiceScreen navigation={navigation} />;
      case 'CreateGroup':
        return <CreateGroupScreen navigation={navigation} route={route} />;
      case 'JoinGroup':
        return <JoinGroupScreen navigation={navigation} route={route} />;
      case 'GroupConfirmation':
        return <GroupConfirmationScreen navigation={navigation} route={route} />;
      case 'Dashboard':
        return <DashboardScreen navigation={navigation} route={route} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} />;
      case 'CreatedGroupDetail':
        return <CreatedGroupDetailScreen navigation={navigation} route={route} />;
      case 'ManageMembers':
        return <ManageMembersScreen navigation={navigation} route={route} />;
      case 'ExerciseDetail':
        return <ExerciseDetailScreen navigation={navigation} route={route} />;
      case 'JoinedGroupDetail':
        return <JoinedGroupDetailScreen navigation={navigation} route={route} />;
      case 'JoinedExerciseDetail':
        return <JoinedExerciseDetailScreen navigation={navigation} route={route} />;
      case 'ReportIssue':
        return <ReportIssueScreen navigation={navigation} route={route} />;
      default:
        return <WelcomeScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
