import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { getLatestOrder, getOrder, stepsFromStatus, subscribeToOrder } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

const GRAY_DOT = '#DDDDDD';
const GRAY_TEXT = '#999999';
const LINE = '#EEEEEE';

const DEMO_ORDER = {
  service: 'GST Registration',
  orderId: 'VCC2505181',
};

const DEMO_STEPS = [
  { title: 'Payment Received', date: '2 May 2025', status: 'completed' },
  { title: 'Documents Verified', date: '2 May 2025', status: 'completed' },
  { title: 'Application Processing', date: 'In Progress', status: 'active' },
  { title: 'Verification', date: 'Pending', status: 'pending' },
  { title: 'Certificate Generation', date: 'Pending', status: 'pending' },
  { title: 'Completed', date: 'Pending', status: 'pending' },
];

export default function WorkProgressScreen({ route }) {
  const params = route?.params || {};
  const { user } = useAuth();
  const orderUuid = params.orderUuid;

  const { data: dbOrder, loading, error, reload, setData } = useFetch(
    () => (orderUuid ? getOrder(orderUuid) : getLatestOrder(user.id)),
    [orderUuid, user?.id],
    { demoData: null, enabled: !!(orderUuid || user?.id) }
  );

  // realtime — status badle to screen apne aap update ho jaaye
  useEffect(() => {
    const id = dbOrder?.id || orderUuid;
    if (!isSupabaseConfigured || !id) return undefined;

    return subscribeToOrder(id, (updated) => {
      console.log('Order status updated:', updated.status);
      setData((prev) => (prev ? { ...prev, ...updated } : prev));
    });
  }, [dbOrder?.id, orderUuid, setData]);

  const order = dbOrder
    ? {
        service: dbOrder.service?.detail_title || dbOrder.service?.name || '',
        orderId: dbOrder.order_id,
      }
    : { ...DEMO_ORDER, ...(params.order || {}) };

  const steps = dbOrder
    ? stepsFromStatus(dbOrder.status, dbOrder.created_at)
    : params.steps || DEMO_STEPS;

  const completed = steps.filter((s) => s.status === 'completed').length;
  const percent =
    params.progress != null
      ? params.progress
      : Math.round((completed / steps.length) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Work Progress" />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- service info ---------- */}
          <View style={styles.infoCard}>
            <Text style={styles.serviceName}>{order.service}</Text>
            <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
          </View>

          {/* ---------- timeline ---------- */}
          <View style={styles.timelineCard}>
            {steps.map((step, index) => (
              <TimelineStep
                key={step.title}
                step={step}
                isLast={index === steps.length - 1}
              />
            ))}

            {/* ---------- progress bar ---------- */}
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressPercent}>{percent}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function TimelineStep({ step, isLast }) {
  const completed = step.status === 'completed';
  const active = step.status === 'active';

  // line ka rang step ke apne status se — completed ke baad hi green
  const lineColor = completed ? COLORS.whatsapp : LINE;

  const dotColor = completed
    ? COLORS.whatsapp
    : active
      ? COLORS.primaryDark
      : 'transparent';

  const dotSize = active ? 16 : 14;

  const subtitleStyle = completed
    ? styles.stepDate
    : active
      ? styles.stepActive
      : styles.stepPending;

  return (
    <View style={styles.stepRow}>
      <View style={styles.timelineCol}>
        {active ? <PulsingDot size={dotSize} /> : null}

        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: dotColor,
            },
            !completed && !active && styles.dotPending,
          ]}
        />

        {!isLast && <View style={[styles.line, { backgroundColor: lineColor }]} />}
      </View>

      <View style={[styles.stepContent, isLast && styles.stepContentLast]}>
        <Text style={[styles.stepTitle, !completed && !active && styles.stepTitleMuted]}>
          {step.title}
        </Text>
        <Text style={subtitleStyle}>{step.date}</Text>
      </View>
    </View>
  );
}

/** Active dot ke peeche halo — dot khud crisp rehta hai */
function PulsingDot({ size }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.halo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
          transform: [
            { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  /* service info */
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  orderId: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 4,
  },

  /* timeline */
  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
  },
  stepRow: {
    flexDirection: 'row',
  },
  timelineCol: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    marginTop: 3,
  },
  dotPending: {
    borderWidth: 2,
    borderColor: GRAY_DOT,
  },
  halo: {
    position: 'absolute',
    top: 3,
    backgroundColor: COLORS.primaryDark,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 22,
  },
  stepContentLast: {
    paddingBottom: 0,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  stepTitleMuted: {
    color: GRAY_TEXT,
    fontWeight: '500',
  },
  stepDate: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 3,
  },
  stepActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginTop: 3,
  },
  stepPending: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginTop: 3,
  },

  /* progress bar */
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: LINE,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primaryDark,
  },
});
