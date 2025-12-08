import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';
import { HomeIcon, ProfileIcon } from './icons';

/**
 * Bottom Tab Bar Component
 * Shared bottom navigation bar for Dashboard and Profile
 */
export const BottomTabBar = ({ navigation, activeScreen = 'Dashboard' }) => {
  const isDashboardActive = activeScreen === 'Dashboard';
  const isProfileActive = activeScreen === 'Profile';

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          if (!isDashboardActive) {
            navigation.navigate('Dashboard');
          }
        }}
        activeOpacity={0.85}
      >
        <HomeIcon 
          size={24} 
          color={isDashboardActive ? COLORS.black : COLORS.gray} 
          filled={isDashboardActive} 
        />
        <Text style={[styles.navLabel, !isDashboardActive && styles.navLabelInactive]}>
          Dashboard
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          if (!isProfileActive) {
            navigation.navigate('Profile');
          }
        }}
        activeOpacity={0.85}
      >
        <ProfileIcon 
          size={24} 
          color={isProfileActive ? COLORS.black : COLORS.gray} 
          filled={isProfileActive} 
        />
        <Text style={[styles.navLabel, !isProfileActive && styles.navLabelInactive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '500',
    marginTop: 4,
  },
  navLabelInactive: {
    color: COLORS.gray,
  },
});

