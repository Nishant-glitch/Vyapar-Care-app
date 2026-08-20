import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
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
import ProfileDrawerModal from '../components/ProfileDrawerModal';
import { ErrorState, LoadingState } from '../components/StateViews';
import WhatsAppFAB from '../components/WhatsAppFAB';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { formatDateTime, getHomeSummary } from '../lib/database';
import { formatINR } from '../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    title: 'Your GST application is under CA review and will be submitted to the department.',
    created_at: null,
    _demoDate: '20 Aug 2026 - 11:30 AM',
  },
};

const DEMO_UPDATES = [
  {
    id: 'upd-1',
    title: 'GST REG-01 verification completed. ARN will be generated shortly.',
    time: 'Today, 11:30 AM',
    badge: 'GST',
  },
  {
    id: 'upd-2',
    title: 'SPICe+ Part A Name approval received from Ministry of Corporate Affairs.',
    time: 'Yesterday, 4:15 PM',
    badge: 'MCA',
  },
  {
    id: 'upd-3',
    title: 'Form 16 / TDS acknowledgment certificate ready for download.',
    time: '18 Aug 2026',
    badge: 'TAX',
  },
];

const DEMO_ORDERS = [
  {
    id: 'ord-1',
    serviceName: 'GST Registration',
    applicationId: 'GST-2026-0814',
    status: 'CA Review',
    statusColor: '#0284C7',
    progress: 75,
    stage: 'Officer Scrutiny & ARN Generation',
  },
  {
    id: 'ord-2',
    serviceName: 'Private Limited Company Incorporation',
    applicationId: 'PLC-2026-0192',
    status: 'Name Approved',
    statusColor: '#059669',
    progress: 45,
    stage: 'SPICe+ Part B & MOA/AOA Drafting',
  },
];

const DEMO_PAYMENTS = [
  {
    id: 'pay-1',
    serviceName: 'GST Registration (Advance 50%)',
    date: '18 Aug 2026',
    amount: 5000,
    status: 'Paid',
    isPaid: true,
  },
  {
    id: 'pay-2',
    serviceName: 'Private Limited Incorporation (Balance)',
    date: '20 Aug 2026',
    amount: 7500,
    status: 'Due',
    isPaid: false,
  },
  {
    id: 'pay-3',
    serviceName: 'Form TM-A Trademark Filing',
    date: '10 Jul 2026',
    amount: 6500,
    status: 'Paid',
    isPaid: true,
  },
];

const QUICK_ACTIONS = [
  {
    id: 'qa-new',
    title: 'Apply Service',
    icon: '📋',
    route: 'TaxCompany',
  },
  {
    id: 'qa-upload',
    title: 'Upload Doc',
    icon: '📤',
    route: 'UploadDocuments',
  },
  {
    id: 'qa-pay',
    title: 'Make Payment',
    icon: '💳',
    route: 'PaymentHistory',
  },
  {
    id: 'qa-formats',
    title: 'Legal Formats',
    icon: '📑',
    action: 'formats',
  },
  {
    id: 'qa-track',
    title: 'Track Status',
    icon: '🔍',
    route: 'WorkProgress',
  },
  {
    id: 'qa-insurance',
    title: 'Insurance',
    icon: '🛡️',
    route: 'Insurance',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, profile } = useAuth();

  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const {
    data: summary,
    loading,
    error,
    refreshing,
    reload,
    refresh,
  } = useFetch(() => getHomeSummary(user?.id), [user?.id], {
    demoData: DEMO_SUMMARY,
    enabled: !!user?.id,
  });

  const onRefresh = () => {
    console.log('Refreshing Dashboard...');
    refresh();
  };

  const displayUser = profile || DEMO_USER;
  const userName = displayUser.name || displayUser.full_name || 'Ravi Kumar';
  const initial = userName.charAt(0).toUpperCase();
  const customerId = displayUser.customer_id || 'VCC2505181';
  const profilePhoto = profile?.profile_photo || profile?.avatar_url || null;

  const handleQuickAction = (item) => {
    if (item.action === 'formats') {
      setProfileModalVisible(true);
      return;
    }
    if (item.route) {
      navigation.navigate(item.route);
    }
  };

  const handleWhatsAppHelp = async () => {
    const phone = '919999999999';
    const message = encodeURIComponent(
      `Namaste Vyapar Care, I need support regarding my account (ID: ${customerId}).`
    );
    const url = `https://wa.me/${phone}?text=${message}`;
    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Support', 'Please contact our helpline at +91 99999 99999');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2B5E" />

      {/* ========================================================================= */}
      {/* 1. HEADER (Navy #1B2B5E, rounded bottom, greetings, bell, avatar)          */}
      {/* ========================================================================= */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Namaste,</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {userName} 👋
          </Text>
          <View style={styles.cidPill}>
            <Text style={styles.cidText}>ID: {customerId}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Notification Bell with Badge */}
          <Pressable
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellBadge} />
          </Pressable>

          {/* Profile Avatar (Tappable -> Navigates to Profile, Long Press -> Tooltip) */}
          <Pressable
            style={({ pressed }) => [
              styles.avatarCircle,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.navigate('Profile')}
            onLongPress={() => Alert.alert('Profile', 'View & Edit Profile')}
            hitSlop={8}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 85 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1B2B5E"
            colors={['#1B2B5E', '#C5991A']}
          />
        }
      >
        {loading ? (
          <LoadingState message="Loading compliance dashboard..." />
        ) : error ? (
          <ErrorState message="Could not load dashboard data" onRetry={reload} />
        ) : (
          <>
            {/* ========================================================================= */}
            {/* 2. STAT CARDS (2x2 Grid)                                                  */}
            {/* ========================================================================= */}
            <View style={styles.statsGrid}>
              {/* Card 1: Active Services */}
              <Pressable
                style={({ pressed }) => [
                  styles.statCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => navigation.navigate('WorkProgress')}
              >
                <View style={styles.statTopRow}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={styles.statIcon}>💼</Text>
                  </View>
                  <Text style={styles.statChevron}>›</Text>
                </View>
                <Text style={styles.statBigNumber}>
                  {summary?.activeServices ?? 2}
                </Text>
                <Text style={styles.statLabel}>Active Services</Text>
                <Text style={styles.statSubLabel}>In Progress</Text>
              </Pressable>

              {/* Card 2: Pending Payment */}
              <Pressable
                style={({ pressed }) => [
                  styles.statCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => navigation.navigate('PaymentHistory')}
              >
                <View style={styles.statTopRow}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.statIcon}>💰</Text>
                  </View>
                  <Text style={styles.statChevron}>›</Text>
                </View>
                <Text style={styles.statGoldNumber}>
                  {formatINR(summary?.pendingPayment ?? 5000)}
                </Text>
                <Text style={styles.statLabel}>Pending Payment</Text>
                <Text style={[styles.statSubLabel, { color: '#D97706' }]}>Pay Due Online</Text>
              </Pressable>

              {/* Card 3: Uploaded Docs */}
              <Pressable
                style={({ pressed }) => [
                  styles.statCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => navigation.navigate('UploadDocuments')}
              >
                <View style={styles.statTopRow}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={styles.statIcon}>📁</Text>
                  </View>
                  <Text style={styles.statChevron}>›</Text>
                </View>
                <Text style={styles.statBigNumber}>
                  {summary?.docsUploaded ?? 4}/{summary?.docsTotal ?? 5}
                </Text>
                <Text style={styles.statLabel}>Uploaded Docs</Text>
                <Text style={[styles.statSubLabel, { color: '#059669' }]}>1 Pending Verification</Text>
              </Pressable>

              {/* Card 4: Help & Support */}
              <Pressable
                style={({ pressed }) => [
                  styles.statCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => navigation.navigate('HelpSupport')}
              >
                <View style={styles.statTopRow}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#F5F3FF' }]}>
                    <Text style={styles.statIcon}>💬</Text>
                  </View>
                  <Text style={styles.statChevron}>›</Text>
                </View>
                <Text style={[styles.statBigNumber, { color: '#7C3AED', fontSize: 18 }]}>
                  24x7 Help
                </Text>
                <Text style={styles.statLabel}>Support Desk</Text>
                <Text style={[styles.statSubLabel, { color: '#7C3AED' }]}>Chat with CA</Text>
              </Pressable>
            </View>

            {/* ========================================================================= */}
            {/* 3. QUICK ACTIONS (Horizontal Scroll Row)                                   */}
            {/* ========================================================================= */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Quick Actions</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              {QUICK_ACTIONS.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.quickActionItem,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleQuickAction(item)}
                >
                  <View style={styles.quickActionCircle}>
                    <Text style={styles.quickActionIcon}>{item.icon}</Text>
                  </View>
                  <Text style={styles.quickActionLabel} numberOfLines={1}>
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* ========================================================================= */}
            {/* 4. TODAY'S UPDATE SECTION                                                 */}
            {/* ========================================================================= */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Today's Updates & Alerts</Text>
              <Pressable onPress={() => navigation.navigate('Notifications')}>
                <Text style={styles.viewAllLink}>View All →</Text>
              </Pressable>
            </View>

            <View style={styles.updatesCardContainer}>
              {DEMO_UPDATES.map((upd, index) => (
                <View
                  key={upd.id}
                  style={[
                    styles.updateItemRow,
                    index === DEMO_UPDATES.length - 1 && styles.updateItemRowLast,
                  ]}
                >
                  <View style={styles.goldBulletDot} />
                  <View style={styles.updateTextWrap}>
                    <Text style={styles.updateItemTitle}>{upd.title}</Text>
                    <View style={styles.updateMetaRow}>
                      <Text style={styles.updateItemTime}>{upd.time}</Text>
                      <View style={styles.updateBadgePill}>
                        <Text style={styles.updateBadgeText}>{upd.badge}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* ========================================================================= */}
            {/* 5. MY ACTIVE ORDERS (Horizontal Card Carousel)                            */}
            {/* ========================================================================= */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>My Active Orders</Text>
              <Pressable onPress={() => navigation.navigate('WorkProgress')}>
                <Text style={styles.viewAllLink}>View All ({DEMO_ORDERS.length}) →</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ordersCarousel}
            >
              {DEMO_ORDERS.map((ord) => (
                <Pressable
                  key={ord.id}
                  style={({ pressed }) => [
                    styles.orderCard,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => navigation.navigate('WorkProgress')}
                >
                  <View style={styles.orderTopRow}>
                    <View style={styles.orderTitleWrap}>
                      <Text style={styles.orderServiceName} numberOfLines={1}>
                        {ord.serviceName}
                      </Text>
                      <Text style={styles.orderAppId}>App ID: {ord.applicationId}</Text>
                    </View>
                    <View
                      style={[
                        styles.orderStatusPill,
                        { backgroundColor: `${ord.statusColor}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.orderStatusText,
                          { color: ord.statusColor },
                        ]}
                      >
                        {ord.status}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${ord.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressPercent}>{ord.progress}%</Text>
                  </View>

                  {/* Stage description */}
                  <View style={styles.orderStageRow}>
                    <Text style={styles.orderStageLabel}>Stage:</Text>
                    <Text style={styles.orderStageText} numberOfLines={1}>
                      {ord.stage}
                    </Text>
                  </View>

                  {/* Action Link */}
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTrackLink}>Track Live Status →</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            {/* ========================================================================= */}
            {/* 6. RECENT PAYMENTS SECTION                                                */}
            {/* ========================================================================= */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Recent Payments</Text>
              <Pressable onPress={() => navigation.navigate('PaymentHistory')}>
                <Text style={styles.viewAllLink}>View Ledger →</Text>
              </Pressable>
            </View>

            <View style={styles.paymentsContainer}>
              {DEMO_PAYMENTS.map((pay, idx) => (
                <Pressable
                  key={pay.id}
                  style={({ pressed }) => [
                    styles.paymentRow,
                    idx === DEMO_PAYMENTS.length - 1 && styles.paymentRowLast,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => navigation.navigate('PaymentHistory')}
                >
                  <View style={styles.paymentLeft}>
                    <View
                      style={[
                        styles.paymentIconCircle,
                        { backgroundColor: pay.isPaid ? '#ECFDF5' : '#FEF2F2' },
                      ]}
                    >
                      <Text style={styles.paymentIcon}>
                        {pay.isPaid ? '✓' : '⏳'}
                      </Text>
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentServiceName}>{pay.serviceName}</Text>
                      <Text style={styles.paymentDate}>{pay.date}</Text>
                    </View>
                  </View>

                  <View style={styles.paymentRight}>
                    <Text
                      style={[
                        styles.paymentAmount,
                        { color: pay.isPaid ? '#059669' : '#DC2626' },
                      ]}
                    >
                      {formatINR(pay.amount)}
                    </Text>
                    <View
                      style={[
                        styles.payStatusBadge,
                        { backgroundColor: pay.isPaid ? '#D1FAE5' : '#FEE2E2' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.payStatusBadgeText,
                          { color: pay.isPaid ? '#065F46' : '#991B1B' },
                        ]}
                      >
                        {pay.status}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* ========================================================================= */}
            {/* 7. NEED HELP? BOTTOM BANNER CARD                                         */}
            {/* ========================================================================= */}
            <Pressable
              style={({ pressed }) => [
                styles.needHelpBanner,
                pressed && styles.pressed,
              ]}
              onPress={handleWhatsAppHelp}
            >
              <View style={styles.whatsappIconCircle}>
                <Text style={styles.whatsappIcon}>💬</Text>
              </View>
              <View style={styles.needHelpTextWrap}>
                <Text style={styles.needHelpTitle}>Need Help or Consultation?</Text>
                <Text style={styles.needHelpSubtitle}>
                  Chat with us on WhatsApp • Instant CA reply
                </Text>
              </View>
              <Text style={styles.needHelpArrow}>→</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFAB />

      {/* Profile & Settings Drawer Modal */}
      <ProfileDrawerModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Persistent 5-Tab Navigation Bar */}
      <BottomNav activeTab="Dashboard" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  pressed: {
    opacity: 0.85,
  },

  /* Header */
  header: {
    backgroundColor: '#1B2B5E',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1B2B5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  greeting: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '500',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: 4,
  },
  cidPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(197, 153, 26, 0.4)',
  },
  cidText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DFB53B',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 17,
  },
  bellBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 7,
    right: 8,
    borderWidth: 1.5,
    borderColor: '#1B2B5E',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B2B5E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C5991A',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DFB53B',
  },

  /* 2x2 Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.99 }],
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 18,
  },
  statChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  statBigNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B2B5E',
    marginBottom: 2,
  },
  statGoldNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#C5991A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 1,
  },
  statSubLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Section Header Rows */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B2B5E',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0284C7',
  },

  /* Quick Actions */
  quickActionsScroll: {
    paddingVertical: 2,
    gap: 12,
    marginBottom: 16,
  },
  quickActionItem: {
    alignItems: 'center',
    width: 72,
    marginRight: 6,
  },
  quickActionCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1B2B5E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#1B2B5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },

  /* Today's Updates Card */
  updatesCardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#C5991A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  updateItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  updateItemRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  goldBulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5991A',
    marginTop: 5,
    marginRight: 10,
  },
  updateTextWrap: {
    flex: 1,
  },
  updateItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 4,
  },
  updateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateItemTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  updateBadgePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  updateBadgeText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0284C7',
  },

  /* Orders Carousel */
  ordersCarousel: {
    paddingVertical: 2,
    gap: 12,
    marginBottom: 16,
  },
  orderCard: {
    width: SCREEN_WIDTH * 0.78,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderTitleWrap: {
    flex: 1,
    paddingRight: 6,
  },
  orderServiceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B2B5E',
    marginBottom: 2,
  },
  orderAppId: {
    fontSize: 11,
    color: '#64748B',
  },
  orderStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C5991A',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#C5991A',
  },
  orderStageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderStageLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    marginRight: 4,
  },
  orderStageText: {
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  orderTrackLink: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#0284C7',
  },

  /* Recent Payments */
  paymentsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentRowLast: {
    borderBottomWidth: 0,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  paymentIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  paymentIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentServiceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 1,
  },
  paymentDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 13.5,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  payStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  payStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: 'bold',
  },

  /* Need Help Bottom Banner */
  needHelpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  whatsappIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  whatsappIcon: {
    fontSize: 24,
  },
  needHelpTextWrap: {
    flex: 1,
    paddingRight: 6,
  },
  needHelpTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  needHelpSubtitle: {
    fontSize: 11.5,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  needHelpArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
