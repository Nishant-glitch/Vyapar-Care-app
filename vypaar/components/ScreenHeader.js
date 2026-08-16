import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

/**
 * Back arrow + centered title. Status bar area apne aap handle ho jaata hai.
 * Default back = navigation.goBack(); `onBack` do to wo override ho jaata hai.
 */
export default function ScreenHeader({ title, onBack }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    console.log('Go Back');
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* title ko sach me center rakhne ke liye back button jitni khaali jagah */}
      <View style={styles.backButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
});
