import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

/**
 * Global ScreenHeader Component
 * - Left side: Back arrow icon (←) Pressable (hidden when showBack=false)
 * - Center: Centered screen title
 * - Right: Balanced placeholder or optional rightElement
 * - Supports showBack prop (default: true)
 */
export default function ScreenHeader({
  title,
  showBack = true,
  onBack,
  rightElement,
  theme = 'light',
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    console.log(`ScreenHeader Go Back: [${title}]`);
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Dashboard');
    }
  };

  const isNavy = theme === 'navy';

  return (
    <View
      style={[
        styles.header,
        isNavy && styles.headerNavy,
        { paddingTop: Math.max(insets.top, 12) + 6 },
      ]}
    >
      {/* Left Back Button or Placeholder */}
      {showBack ? (
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            isNavy && styles.backButtonNavy,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleBack}
          hitSlop={12}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[styles.backIcon, isNavy && styles.backIconNavy]}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      {/* Center Title */}
      <Text
        style={[styles.title, isNavy && styles.titleNavy]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Right Element or Spacing Placeholder */}
      {rightElement ? (
        <View style={styles.rightWrap}>{rightElement}</View>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerNavy: {
    backgroundColor: '#1B2B5E',
    borderBottomColor: '#2A3C72',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonNavy: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  backIcon: {
    fontSize: 22,
    lineHeight: 24,
    color: '#1B2B5E',
    fontWeight: 'bold',
  },
  backIconNavy: {
    color: '#FFFFFF',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B2B5E',
    paddingHorizontal: 8,
  },
  titleNavy: {
    color: '#FFFFFF',
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  rightWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
