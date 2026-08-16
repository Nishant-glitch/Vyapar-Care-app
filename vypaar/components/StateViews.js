import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

/** Center me spinner — jab tak data aa raha hai */
export function LoadingState({ style }) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size="large" color={COLORS.primaryDark} />
    </View>
  );
}

/** Error + retry — fetch fail hone pe */
export function ErrorState({ onRetry, message = 'Something went wrong', style }) {
  return (
    <View style={[styles.center, style]}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.85 }]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    height: 42,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
