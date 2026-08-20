import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export const TABS = [
  { key: 'Tax/Acc/Company', icon: '💼', label: 'Tax/Acc/Company', route: 'TaxCompany' },
  { key: 'Insurance', icon: '🛡️', label: 'Insurance', route: 'Insurance' },
  { key: 'Marketing', icon: '📢', label: 'Marketing', route: 'Marketing' },
  { key: 'Web Service', icon: '🌐', label: 'Web Service', route: 'WebService' },
];

export default function BottomNav({ activeTab = 'Tax/Acc/Company', onTabPress }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handlePress = (tab) => {
    console.log(`BottomNav Press: ${tab.key} -> Route: ${tab.route}`);

    if (onTabPress) {
      onTabPress(tab.key);
      return;
    }
    if (!tab.route || tab.key === activeTab) return;

    navigation.navigate(tab.route);
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => handlePress(tab)}
          >
            {/* Top gold indicator line when active */}
            <View style={[styles.topLine, active && styles.topLineActive]} />

            <Text style={[styles.tabIcon, !active && styles.tabIconInactive]}>
              {tab.icon}
            </Text>

            <Text
              style={[styles.tabLabel, active && styles.tabLabelActive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
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
    borderTopColor: '#E2E8F0',
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  topLine: {
    width: '100%',
    height: 3,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  topLineActive: {
    backgroundColor: '#C5991A',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconInactive: {
    opacity: 0.55,
  },
  tabLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#1B2B5E',
    fontWeight: 'bold',
  },
});
