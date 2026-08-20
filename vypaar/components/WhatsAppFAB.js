import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WhatsAppFAB({ message = 'Hello Vyapar Care, I need assistance with business registration and compliance.' }) {
  const insets = useSafeAreaInsets();

  const handleWhatsApp = async () => {
    const phone = '919999999999'; // Vyapar Care official desk
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encoded}`;

    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn('Could not open WhatsApp:', err);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fabContainer,
        { bottom: Math.max(insets.bottom, 10) + 68 },
        pressed && styles.fabPressed,
      ]}
      onPress={handleWhatsApp}
    >
      <View style={styles.fabCircle}>
        <Text style={styles.fabIcon}>💬</Text>
      </View>
      <View style={styles.helpPill}>
        <Text style={styles.helpText}>Need Help?</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  fabCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fabIcon: {
    fontSize: 26,
  },
  helpPill: {
    backgroundColor: '#1B2B5E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    right: 48,
    borderWidth: 1,
    borderColor: '#C5991A',
  },
  helpText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
});
