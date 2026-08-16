import React from 'react';
import {
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
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { buildInvoice, getLatestOrder, getOrder } from '../lib/database';
import { formatINR } from '../utils/currency';

const INVOICE = {
  number: 'INV2505181',
  date: '2 May 2025',
  customer: 'Ravi Kumar',
  service: 'GST Registration',
  total: 10000,
  paid: 10000,
};

export default function InvoiceScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const paramOrderUuid = route?.params?.orderUuid;

  const { data: order, loading, error, reload } = useFetch(
    () => (paramOrderUuid ? getOrder(paramOrderUuid) : getLatestOrder(user.id)),
    [paramOrderUuid, user?.id],
    { demoData: null, enabled: !!(paramOrderUuid || user?.id) }
  );

  // order + payments se invoice ke numbers; warna demo data
  const invoice = order
    ? {
        ...buildInvoice(order),
        customer: profile?.name || 'Customer',
      }
    : { ...INVOICE, ...(route?.params?.invoice || {}) };

  const balance = invoice.balance ?? invoice.total - invoice.paid;
  const isPaid = balance <= 0;

  const rows = [
    { label: 'Date', value: invoice.date },
    { label: 'Customer', value: invoice.customer },
    { label: 'Service', value: invoice.service },
    { label: 'Total Amount', value: formatINR(invoice.total), style: styles.valueBold },
    { label: 'Paid Amount', value: formatINR(invoice.paid), style: styles.valueGreen },
    { label: 'Balance Amount', value: formatINR(balance), style: styles.valueBold },
  ];

  const handleDownload = () => {
    console.log('Download Invoice PDF');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Invoice" />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}

      {!loading && !error ? (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* ---------- top row ---------- */}
          <View style={styles.topRow}>
            <Text style={styles.invoiceNumber}>Invoice #{invoice.number}</Text>

            <View style={[styles.badge, !isPaid && styles.badgeDue]}>
              <Text style={styles.badgeText}>{isPaid ? 'PAID' : 'DUE'}</Text>
            </View>
          </View>

          {/* ---------- details ---------- */}
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
      ) : null}

      {/* ---------- fixed button ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={handleDownload}
        >
          <Text style={styles.downloadIcon}>⬇</Text>
          <Text style={styles.buttonText}>Download Invoice</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.85,
  },

  /* card */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  invoiceNumber: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    paddingRight: 10,
  },
  badge: {
    backgroundColor: COLORS.whatsapp, // #25D366
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeDue: {
    backgroundColor: '#E74C3C',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  /* rows */
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
  valueBold: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  valueGreen: {
    color: COLORS.whatsapp,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
  },
  downloadIcon: {
    color: COLORS.white,
    fontSize: 16,
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
