import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

/**
 * Global ScreenHeader Component
 * - Navy #1B2B5E theme by default for seamless status bar + header integration
 * - Left side: Back arrow icon (←) Pressable (hidden when showBack=false)
 * - Center: Centered screen title in bold white text
 * - Right: Balanced placeholder or optional rightElement
 * - Supports showBack prop (default: true)
 */
export default function ScreenHeader({
  title,
  showBack = true,
  onBack,
  rightElement,
  theme = 'navy',
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

  const isLight = theme === 'light';

  return (
    <View
      style={[
        styles.header,
        isLight ? styles.headerLight : styles.headerNavy,
        { paddingTop: Math.max(insets.top, 10) + 6 },
      ]}
    >
      {/* Left Back Button or Placeholder */}
      {showBack ? (
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            isLight ? styles.backButtonLight : styles.backButtonNavy,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleBack}
          hitSlop={12}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[styles.backIcon, isLight ? styles.backIconLight : styles.backIconNavy]}>
            ←
          </Text>
        </Pressable>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      {/* Center Title */}
      <Text
        style={[styles.title, isLight ? styles.titleLight : styles.titleNavy]}
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerNavy: {
    backgroundColor: '#1B2B5E',
    borderBottomColor: '#2A3C72',
  },
  headerLight: {
    backgroundColor: COLORS.white,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonNavy: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  backButtonLight: {
    backgroundColor: '#F1F5F9',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },
  backIcon: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  backIconNavy: {
    color: '#FFFFFF',
  },
  backIconLight: {
    color: '#1B2B5E',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16.5,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  titleNavy: {
    color: '#FFFFFF',
  },
  titleLight: {
    color: '#1B2B5E',
  },
  backButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  rightWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
