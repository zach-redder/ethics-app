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
    checkAuthStatus();

    // Listen to auth state changes
    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Check if user has completed profile setup
          await checkUserProfile(session.user.id);
        } else {
          setUser(null);
          setCurrentScreen('Welcome');
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data } = await authService.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        await checkUserProfile(data.session.user.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfile = async (userId) => {
    try {
      const { data, error } = await userService.getUser(userId);
      if (error || !data) {
        // User profile not created, go to name input
        setCurrentScreen('NameInput');
      } else {
        // User profile exists, go to dashboard
        setCurrentScreen('Dashboard');
      }
    } catch (error) {
      console.error('Profile check error:', error);
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
