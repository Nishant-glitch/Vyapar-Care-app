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
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import { formatINR } from '../../utils/currency';

export default function TMConfirmationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { formState, resetForm } = useTMForm();

  const applicationId =
    route.params?.applicationId || formState.submittedApplicationId || 'TM-2026-000189';
  const amountPaid = route.params?.amountPaid || formState.calculatedFees?.totalPayable || 8000;

  const handleFinish = () => {
    resetForm();
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="Application Submitted"
        showBack={false}
        backgroundColor={COLORS.primaryDark}
        titleColor={COLORS.white}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Success Banner */}
        <View style={styles.successBanner}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Trademark Application Submitted!</Text>
          <Text style={styles.successSub}>
            Your trademark application has been successfully received by our IPR Legal Desk.
          </Text>

          <View style={styles.appIdBox}>
            <Text style={styles.appIdLabel}>APPLICATION ID</Text>
            <Text style={styles.appIdText}>{applicationId}</Text>
          </View>
        </View>

        {/* Application Overview Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Application Overview</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Trademark Name:</Text>
            <Text style={[styles.val, styles.goldVal]}>
              {formState.markDetails?.trademarkName || 'Brand Mark'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Applicant Name:</Text>
            <Text style={styles.val}>
              {formState.applicantDetails?.applicantLegalName || 'Applicant'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Selected Classes:</Text>
            <Text style={styles.val}>
              Class {formState.selectedClasses?.join(', ')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Status:</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>✓ Paid {formatINR(amountPaid)}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Current Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Application Received</Text>
            </View>
          </View>
        </View>

        {/* What Happens Next Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 What Happens Next?</Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineHeading}>
                Step 1: Attorney Verification & Search (1-2 Days)
              </Text>
              <Text style={styles.timelineDesc}>
                Our registered Trademark Attorneys will verify your mark representation, nice classification, and prepare a comprehensive search report.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineHeading}>
                Step 2: Form TM-48 Execution & TM-A Filing (3-5 Days)
              </Text>
              <Text style={styles.timelineDesc}>
                Application Form TM-A will be e-filed directly with IP India Trade Marks Registry. You will receive the official TM Application Number immediately.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotLast]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineHeading}>
                Step 3: Journal Publication & Registration (®)
              </Text>
              <Text style={styles.timelineDesc}>
                We track examination notices, publish in the Trademark Journal, and deliver the final Registration Certificate.
              </Text>
            </View>
          </View>
        </View>

        {/* Support note */}
        <View style={styles.helpBox}>
          <Text style={styles.helpIcon}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.helpHeading}>Need Assistance with this Application?</Text>
            <Text style={styles.helpText}>
              Our trademark attorneys are available to answer your questions. Tap Support from your home screen anytime.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer CTAs */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.homeBtn, pressed && styles.pressed]}
          onPress={handleFinish}
        >
          <Text style={styles.homeBtnText}>GO TO HOME DASHBOARD</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.85,
  },
  successBanner: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successIcon: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  successTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  appIdBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 14,
    alignItems: 'center',
  },
  appIdLabel: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  appIdText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E8EC',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  label: {
    fontSize: 13,
    color: COLORS.grayText,
  },
  val: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  goldVal: {
    color: COLORS.gold,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidBadgeText: {
    color: '#15803D',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#1D4ED8',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
    marginTop: 4,
    marginRight: 12,
  },
  timelineDotLast: {
    backgroundColor: COLORS.whatsapp,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 17,
  },
  helpBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  helpIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  helpHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
  },
  helpText: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  homeBtn: {
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
