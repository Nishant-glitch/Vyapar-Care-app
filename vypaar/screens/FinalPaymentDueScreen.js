import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { getLatestOrder, getOrder } from '../lib/database';
import { formatINR } from '../utils/currency';

const RED = '#E74C3C';

const GST_SERVICE = {
  fee: 10000,
  advancePercent: 50,
};

export default function FinalPaymentDueScreen({ navigation, route }) {
  const { user } = useAuth();
  const paramOrderUuid = route.params?.orderUuid;

  const { data: order, loading, error, reload } = useFetch(
    () => (paramOrderUuid ? getOrder(paramOrderUuid) : getLatestOrder(user.id)),
    [paramOrderUuid, user?.id],
    { demoData: null, enabled: !!(paramOrderUuid || user?.id) }
  );

  const service = order?.service
    ? {
        ...order.service,
        fee: order.service.fee,
        advancePercent: order.service.advance_percent ?? 50,
      }
    : { ...GST_SERVICE, ...(route.params?.service || {}) };

  // asli order hai to paid amount payments se, warna advance % se
  const paid = order
    ? (order.payments || [])
        .filter((p) => p.status === 'success')
        .reduce((s, p) => s + p.amount, 0)
    : Math.round((service.fee * service.advancePercent) / 100);

  const due = Math.max(service.fee - paid, 0);

  const handlePay = () => {
    console.log('Navigate to Payment Gateway for final payment');
    navigation.navigate('PaymentGateway', {
      amount: due,
      payFlow: 'final',
      service,
      orderUuid: order?.id,
    });
  };

  const handleReminder = () => {
    console.log('Set Payment Reminder');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="Service Completed!" />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}

      {!loading && !error ? (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- heading ---------- */}
        <Text style={styles.heading}>Service Completed!</Text>
        <Text style={styles.subtitle}>
          Please pay remaining amount to get your certificate.
        </Text>

        {/* ---------- breakdown ---------- */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.valueTotal}>{formatINR(service.fee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Paid Amount</Text>
            <Text style={styles.valuePaid}>{formatINR(paid)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Due Amount</Text>
            <Text style={styles.valueDue}>{formatINR(due)}</Text>
          </View>
        </View>

        {/* ---------- pay ---------- */}
        <Pressable
          style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
          onPress={handlePay}
        >
          <Text style={styles.payText}>Pay {formatINR(due)} Now</Text>
        </Pressable>

        <Pressable style={styles.reminderRow} onPress={handleReminder} hitSlop={8}>
          <Text style={styles.bellIcon}>🔔</Text>
          <Text style={styles.reminderText}>Pay Later Reminder</Text>
        </Pressable>
      </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  pressed: {
    opacity: 0.85,
  },

  /* heading */
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  /* breakdown */
  card: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  label: {
    fontSize: 14,
    color: COLORS.grayText,
    paddingRight: 12,
  },
  valueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  valuePaid: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.whatsapp, // #25D366
  },
  valueDue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: RED,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  /* pay */
  payButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  payText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  bellIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  reminderText: {
    fontSize: 13,
    color: '#888888',
  },
});
