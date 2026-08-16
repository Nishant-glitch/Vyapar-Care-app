import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

// tab -> stack route. Profile ka screen abhi banaya nahi hai (route: null)
export const TABS = [
  { key: 'Home', icon: '🏠', label: 'Home', route: 'Home' },
  { key: 'My Work', icon: '📋', label: 'My Work', route: 'Services' },
  { key: 'Payment', icon: '💳', label: 'Payment', route: 'PaymentHistory' },
  { key: 'Documents', icon: '📄', label: 'Documents', route: 'UploadDocuments' },
  { key: 'Profile', icon: '👤', label: 'Profile', route: null },
];

export default function BottomNav({ activeTab = 'Home', onTabPress }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handlePress = (tab) => {
    console.log(`Navigate to ${tab.key}`);

    // custom handler ho to wahi chalega, warna default routing
    if (onTabPress) {
      onTabPress(tab.key);
      return;
    }
    if (!tab.route || tab.key === activeTab) return;

    // Home stack ka base hai — uspe wapas jaate waqt naya entry mat banao
    if (tab.route === 'Home') {
      navigation.navigate('Home');
    } else {
      navigation.navigate(tab.route);
    }
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => handlePress(tab)}>
            {/* indicator hamesha render hota hai taaki tabs shift na hon */}
            <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
            <Text style={[styles.tabIcon, !active && styles.tabIconInactive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  tabIndicatorActive: {
    backgroundColor: COLORS.primaryDark,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconInactive: {
    opacity: 0.55,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.grayText,
    marginTop: 3,
  },
  tabLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
});
