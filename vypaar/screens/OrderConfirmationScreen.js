import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS, MONO } from '../constants/theme';
import { useFetch } from '../hooks/useFetch';
import { formatDate, getOrder } from '../lib/database';
import { formatINR } from '../utils/currency';

const ORDER = {
  orderId: 'VCC2505181',
  service: 'GST Registration',
  fee: 10000,
  advancePercent: 50,
  orderDate: '2 May 2025',
};

export default function OrderConfirmationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const params = route.params || {};
  const orderUuid = params.orderUuid;

  // asli order (order_id, date, fee) DB se — wahi jo abhi create hua
  const { data: dbOrder, loading, error, reload } = useFetch(
    () => getOrder(orderUuid),
    [orderUuid],
    { demoData: null, enabled: !!orderUuid }
  );

  const order = dbOrder
    ? {
        orderId: dbOrder.order_id,
        service: dbOrder.service?.detail_title || dbOrder.service?.name || '',
        fee: dbOrder.service?.fee ?? 0,
        advancePercent: dbOrder.service?.advance_percent ?? 50,
        orderDate: formatDate(dbOrder.created_at),
        uuid: dbOrder.id,
      }
    : {
        ...ORDER,
        ...(params.service?.title ? { service: params.service.title } : {}),
        ...(params.fee != null ? { fee: params.fee } : {}),
        ...(params.advancePercent != null ? { advancePercent: params.advancePercent } : {}),
        uuid: orderUuid,
      };

  // yahan se back ka matlab Home hai — payment screens pe lautna galat hoga
  const goHome = () =>
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.6)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [iconOpacity, iconScale]);

  const paid = Math.round((order.fee * order.advancePercent) / 100);
  const remaining = order.fee - paid;

  const rows = [
    { label: 'Order ID', value: order.orderId, style: styles.valueMono },
    { label: 'Service', value: order.service },
    { label: 'Total Fee', value: formatINR(order.fee), style: styles.valueBold },
    { label: `Paid (${order.advancePercent}%)`, value: formatINR(paid), style: styles.valueGreen },
    { label: 'Remaining', value: formatINR(remaining), style: styles.valueGold },
    { label: 'Order Date', value: order.orderDate },
  ];

  const handleViewDetails = () => {
    console.log('Navigate to Work Progress');
    // stack ko Home → WorkProgress bana do, taaki back Home pe jaaye
    navigation.reset({
      index: 1,
      routes: [
        { name: 'Home' },
        { name: 'WorkProgress', params: { order, orderUuid: order.uuid } },
      ],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScreenHeader title="Order Confirmed" onBack={goHome} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScreenHeader title="Order Confirmed" onBack={goHome} />
        <ErrorState onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Order Confirmed" onBack={goHome} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- icon ---------- */}
        <Animated.View
          style={[
            styles.iconWrap,
            { opacity: iconOpacity, transform: [{ scale: iconScale }] },
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>📋</Text>
          </View>

          <View style={styles.checkBadge}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        </Animated.View>

        {/* ---------- order details ---------- */}
        <View style={styles.card}>
          {rows.map((row, index) => (
            <View key={row.label}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={[styles.value, row.style]} numberOfLines={1}>
                  {row.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ---------- fixed button ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={handleViewDetails}
        >
          <Text style={styles.buttonText}>View Details</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const CIRCLE = 90;
const BADGE = 30;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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

  /* icon */
  iconWrap: {
    width: CIRCLE,
    height: CIRCLE,
    alignSelf: 'center',
    marginTop: 28,
    marginBottom: 8,
  },
  iconCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 38,
  },
  checkBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: COLORS.whatsapp, // #25D366
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F5', // page bg — badge circle se cleanly cut lagta hai
  },
  checkMark: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: Platform.OS === 'ios' ? 18 : 17,
  },

  /* card */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    color: COLORS.grayText,
    paddingRight: 12,
  },
  value: {
    flexShrink: 1,
    fontSize: 14,
    color: COLORS.primaryDark,
    textAlign: 'right',
  },
  valueMono: {
    fontFamily: MONO,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  valueBold: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  valueGreen: {
    color: COLORS.whatsapp,
    fontWeight: '600',
  },
  valueGold: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  /* footer */
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 12 },
      default: {},
    }),
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
  },
});
