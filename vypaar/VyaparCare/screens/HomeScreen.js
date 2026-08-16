import React from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { ErrorState, LoadingState } from '../components/StateViews';
import { getApplicationStatus } from '../config/gstDocumentConfig';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatDateTime, getGSTApplications, getHomeSummary } from '../lib/database';
import { formatINR } from '../utils/currency';
import { useFetch } from '../hooks/useFetch';

// demo mode (Supabase keys nahi hain) ke liye
const DEMO_USER = {
  name: 'Ravi Kumar',
  customer_id: 'VCC2505181',
};

const DEMO_SUMMARY = {
  activeServices: 2,
  pendingPayment: 5000,
  docsUploaded: 4,
  docsTotal: 5,
  latestNotification: {
    title: 'Your GST application is under processing.',
    created_at: null,
    _demoDate: '2 May 2025 - 10:30 AM',
  },
};

const initialsOf = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'VC';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const {
    data: summary,
    loading,
    error,
    refreshing,
    reload,
    refresh,
  } = useFetch(() => getHomeSummary(user.id), [user?.id], {
    demoData: DEMO_SUMMARY,
    enabled: !!user?.id,
  });

  // GST applications — koi na ho to section chhup jaata hai
  const { data: gstApplications } = useFetch(
    () => getGSTApplications(user.id),
    [user?.id],
    { demoData: [], enabled: !!user?.id }
  );

  const applications = gstApplications || [];

  const onRefresh = () => {
    console.log('Refreshing...');
    refresh();
  };

  const displayUser = profile || DEMO_USER;
  const latest = summary?.latestNotification;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* ---------- header (status bar area bhi navy rahe) ---------- */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Namaste,</Text>
          <Text style={styles.userName}>{displayUser.name || 'Customer'} 👋</Text>
          <Text style={styles.customerId}>
            Customer ID: {displayUser.customer_id || '—'}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          onPress={() => console.log('Open Profile')}
          hitSlop={8}
        >
          <Text style={styles.avatarText}>{initialsOf(displayUser.name)}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryDark}
            colors={[COLORS.primaryDark, COLORS.gold]}
          />
        }
      >
        {loading ? <LoadingState style={styles.stateBlock} /> : null}
        {error ? <ErrorState onRetry={reload} style={styles.stateBlock} /> : null}

        {!loading && !error && summary ? (
        <>
        {/* ---------- stats ---------- */}
        <View style={styles.statsRow}>
          <StatCard
            value={String(summary.activeServices)}
            valueStyle={styles.statBig}
            label="Active Services"
            onPress={() => {
              console.log('Active Services card pressed');
              navigation.navigate('WorkProgress');
            }}
          />
          <StatCard
            value={formatINR(summary.pendingPayment)}
            valueStyle={styles.statGold}
            label="Pending Payment"
            onPress={() => {
              console.log('Pending Payment card pressed');
              navigation.navigate('PaymentHistory');
            }}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            value={`${summary.docsUploaded}/${summary.docsTotal}`}
            valueStyle={styles.statMedium}
            label="Documents"
            onPress={() => {
              console.log('Documents card pressed');
              navigation.navigate('UploadDocuments');
            }}
          />
          <StatCard
            icon="💬"
            label="Support"
            subLabel="Help & Chat"
            onPress={() => {
              console.log('Open Support');
              navigation.navigate('HelpSupport');
            }}
          />
        </View>

        {/* ---------- GST applications ---------- */}
        {applications.length > 0 ? (
          <View style={styles.gstBlock}>
            <View style={styles.gstHeader}>
              <Text style={styles.gstHeading}>My GST Applications</Text>
              <Pressable onPress={() => navigation.navigate('GSTAdmin')} hitSlop={8}>
                <Text style={styles.gstViewAll}>View All</Text>
              </Pressable>
            </View>

            {/* sirf latest 3 — poori list GSTAdmin pe hai */}
            {applications.slice(0, 3).map((app) => {
              const status = getApplicationStatus(app.status);
              return (
                <Pressable
                  key={app.id}
                  style={({ pressed }) => [styles.gstCard, pressed && styles.pressed]}
                  onPress={() => {
                    console.log(`Open GST application ${app.application_id}`);
                    navigation.navigate('GSTAdmin', { applicationId: app.application_id });
                  }}
                >
                  <View style={styles.gstCardTop}>
                    <Text style={styles.gstAppId}>{app.application_id}</Text>
                    <View style={[styles.gstBadge, { backgroundColor: `${status.color}22` }]}>
                      <Text style={[styles.gstBadgeText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.gstDate}>{formatDate(app.created_at)}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* ---------- today's update ---------- */}
        <Pressable
          style={({ pressed }) => [styles.updateCard, pressed && styles.pressed]}
          onPress={() => {
            console.log('View All Updates');
            navigation.navigate('Notifications');
          }}
        >
          <Text style={styles.updateHeading}>Today's Update</Text>

          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <View style={styles.bulletContent}>
              <Text style={styles.updateText}>
                {latest?.title || 'No updates yet.'}
              </Text>
              {latest ? (
                <Text style={styles.updateDate}>
                  {latest.created_at ? formatDateTime(latest.created_at) : latest._demoDate}
                </Text>
              ) : null}
            </View>
          </View>
        </Pressable>
        </>
        ) : null}
      </ScrollView>

      <BottomNav activeTab="Home" />
    </SafeAreaView>
  );
}

function StatCard({ value, valueStyle, icon, label, subLabel, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      {icon ? (
        <Text style={styles.cardIcon}>{icon}</Text>
      ) : (
        <Text style={valueStyle}>{value}</Text>
      )}
      <Text style={styles.cardLabel}>{label}</Text>
      {subLabel ? <Text style={styles.cardSubLabel}>{subLabel}</Text> : null}
    </Pressable>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  stateBlock: {
    minHeight: 280,
  },
  pressed: {
    opacity: 0.85,
  },

  /* header */
  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    color: COLORS.white,
    fontSize: 14,
  },
  userName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  customerId: {
    color: COLORS.white,
    opacity: 0.7,
    fontSize: 12,
    marginTop: 6,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  /* stat cards */
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    minHeight: 96,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
    ...shadow,
  },
  statBig: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  statMedium: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  statGold: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 6,
  },
  cardSubLabel: {
    fontSize: 11,
    color: COLORS.primaryDark,
    marginTop: 2,
    fontWeight: '600',
  },

  /* today's update */
  /* GST applications */
  gstBlock: {
    marginTop: 16,
  },
  gstHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gstHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  gstViewAll: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  gstCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
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
  gstCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gstAppId: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  gstBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  gstBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  gstDate: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 6,
  },

  updateCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    ...shadow,
  },
  updateHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginTop: 5,
    marginRight: 10,
  },
  bulletContent: {
    flex: 1,
  },
  updateText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  updateDate: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 4,
  },
});
