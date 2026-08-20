import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { COLORS } from '../constants/theme';
import { formatINR } from '../utils/currency';

const METHODS = [
  { key: 'upi', name: 'UPI / QR', icon: '📱', apps: 'GPay  PhonePe  Paytm' },
  { key: 'netbanking', name: 'Net Banking', icon: '🏦' },
  { key: 'card', name: 'Debit / Credit Card', icon: '💳' },
  { key: 'wallet', name: 'Wallets', icon: '👛' },
  { key: 'paylater', name: 'Pay Later (Selected Partners)', icon: '🕐' },
];

export default function PaymentGatewayScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null); // default: kuch bhi selected nahi

  const { amount = 5000, payFlow = 'advance', service } = route.params || {};

  const handleSelect = (method) => {
    console.log(`Selected: ${method.name}`);
    setSelected(method.key);
    // asli gateway integrate hone tak: method chunte hi payment success
    navigation.navigate('PaymentSuccess', { amount, payFlow, service, method: method.name });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="Secure Payment" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- amount ---------- */}
        <View style={styles.amountBlock}>
          <Text style={styles.payLabel}>Pay</Text>
          <Text style={styles.amount}>{formatINR(amount)}</Text>
        </View>

        {/* ---------- methods ---------- */}
        <View style={styles.methodList}>
          {METHODS.map((method) => {
            const active = selected === method.key;
            return (
              <Pressable
                key={method.key}
                style={({ pressed }) => [
                  styles.methodRow,
                  active && styles.methodRowActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleSelect(method)}
              >
                <Text style={styles.methodIcon}>{method.icon}</Text>

                <Text style={styles.methodName} numberOfLines={1}>
                  {method.name}
                </Text>

                {method.apps ? <Text style={styles.methodApps}>{method.apps}</Text> : null}

                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* ---------- fixed bottom ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.secureText}>100% Secure &amp; Encrypted</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  pressed: {
    opacity: 0.85,
  },

  /* amount */
  amountBlock: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  payLabel: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 6,
  },

  /* methods */
  methodList: {
    marginTop: 12,
    backgroundColor: '#F5F5F5', // rows ke beech ki 1px lines yahi se aati hain
    gap: 1,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 16,
    // unselected rows pe bhi transparent border — warna select karne pe
    // content 3px khisak jaata
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  methodRowActive: {
    backgroundColor: '#F8F6F0',
    borderLeftColor: COLORS.gold,
  },
  methodIcon: {
    fontSize: 20,
    width: 34,
  },
  methodName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
    paddingRight: 8,
  },
  methodApps: {
    fontSize: 11,
    color: COLORS.grayText,
    marginRight: 6,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
    color: '#BBBBBB',
  },

  /* footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  lockIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  secureText: {
    fontSize: 12,
    color: '#888888',
  },
});
