import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
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
import { formatDate, getPayments } from '../lib/database';
import { formatINR } from '../utils/currency';

// status -> badge colour
const STATUS_COLORS = {
  Success: COLORS.whatsapp, // #25D366
  Pending: COLORS.gold,
  Failed: '#E74C3C',
};

const PAYMENTS = [
  {
    id: 'p1',
    date: '2 May 2025',
    description: 'Advance Payment (50%)',
    amount: 5000,
    status: 'Success',
  },
  {
    id: 'p2',
    date: '2 May 2025',
    description: 'Final Payment (50%)',
    amount: 5000,
    status: 'Success',
  },
];

/** DB row -> card ke fields */
const normalize = (row) => ({
  id: row.id,
  date: formatDate(row.created_at),
  description: `${row.type === 'advance' ? 'Advance' : 'Final'} Payment${
    row.order?.service?.detail_title ? ` — ${row.order.service.detail_title}` : ''
  }`,
  amount: row.amount,
  status: row.status === 'success' ? 'Success' : row.status === 'failed' ? 'Failed' : 'Pending',
  orderUuid: row.order?.id,
});

export default function PaymentHistoryScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data, loading, error, refreshing, reload, refresh } = useFetch(
    async () => (await getPayments(user.id)).map(normalize),
    [user?.id],
    { demoData: route?.params?.payments || PAYMENTS, enabled: !!user?.id }
  );

  const payments = data || [];

  const onRefresh = useCallback(() => {
    console.log('Refreshing payment history');
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => {
        console.log(`Payment detail: ${item.description}`);
        navigation.navigate('Invoice', { orderUuid: item.orderUuid });
      }}
    >
      <View style={styles.topRow}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.amount}>{formatINR(item.amount)}</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.badgeRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: STATUS_COLORS[item.status] || COLORS.grayText },
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Payment History" />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryDark}
              colors={[COLORS.primaryDark, COLORS.gold]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No payment history</Text>
            </View>
          }
        />
      )}

      {/* ---------- fixed bottom ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          onPress={() => console.log('View All Transactions')}
        >
          <Text style={styles.outlineButtonText}>View All Transactions</Text>
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
  pressed: {
    opacity: 0.85,
  },

  /* list */
  listContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 13,
    color: COLORS.grayText,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  description: {
    fontSize: 14,
    color: '#333333',
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10, // pill
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },

  /* empty */
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grayText,
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
  outlineButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
