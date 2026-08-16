import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, recordPayment, updateOrderStatus } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';
import { formatINR } from '../utils/currency';

export default function PaymentSuccessScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const {
    amount = 5000,
    payFlow = 'advance',
    service,
    method,
    orderUuid: existingOrderUuid,
  } = route.params || {};

  const [order, setOrder] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const saved = useRef(false); // double-effect pe do order na banein

  const badgeScale = useRef(new Animated.Value(0.4)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeOpacity, badgeScale, textOpacity]);

  // payment ke baad back se gateway pe lautna nahi chahiye
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  /* ---------- DB: order (advance pe) + payment row ---------- */
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id || saved.current) return;
    saved.current = true;

    (async () => {
      try {
        let orderRow = null;

        if (payFlow === 'advance') {
          // naya order + uske required documents
          orderRow = await createOrder({ userId: user.id, serviceId: service?.id });
        } else if (existingOrderUuid) {
          orderRow = { id: existingOrderUuid };
        }

        if (orderRow?.id) {
          await recordPayment({
            orderUuid: orderRow.id,
            amount,
            type: payFlow, // 'advance' | 'final'
            method,
          });

          // final payment ke baad order complete
          if (payFlow === 'final') {
            orderRow = await updateOrderStatus(orderRow.id, 'completed');
          }
        }

        setOrder(orderRow);
      } catch (err) {
        console.log('Payment save error:', err.message);
        setSaveError(err);
      }
    })();
  }, [user?.id, payFlow, service?.id, amount, method, existingOrderUuid]);

  const handleContinue = () => {
    if (payFlow === 'final') {
      console.log('Navigate to Service Completed');
      navigation.replace('ServiceCompleted', { service, orderUuid: order?.id });
    } else {
      console.log('Navigate to Order Confirmation');
      navigation.replace('OrderConfirmation', {
        service,
        fee: service?.fee,
        advancePercent: service?.advancePercent,
        orderUuid: order?.id,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.badge,
            { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
          ]}
        >
          <Text style={styles.check}>✓</Text>
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.amount}>{formatINR(amount)}</Text>
          <Text style={styles.subtitle}>
            {payFlow === 'final'
              ? 'Final payment received. Thank you!'
              : 'Advance payment received. We will start your work shortly.'}
          </Text>
          {method ? <Text style={styles.method}>Paid via {method}</Text> : null}
          {saveError ? (
            <Text style={styles.saveError}>
              Payment recorded locally — sync failed. Please contact support.
            </Text>
          ) : null}
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>CONTINUE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const BADGE = 96;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  pressed: {
    opacity: 0.85,
  },

  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: COLORS.whatsapp, // #25D366
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: COLORS.white,
    fontSize: 46,
    fontWeight: 'bold',
    lineHeight: 54,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: 24,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
  },
  method: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
  saveError: {
    fontSize: 12,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 12,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
