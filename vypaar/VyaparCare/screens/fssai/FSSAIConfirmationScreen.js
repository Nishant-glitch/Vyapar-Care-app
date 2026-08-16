import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { formatINR } from '../../utils/currency';

export default function FSSAIConfirmationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, eligibility, resetForm } = useFSSAIForm();

  const applicationId =
    route?.params?.applicationId || formState.submittedApplicationId || 'FSSAI-2026-000001';
  const paidAmount = route?.params?.paidAmount || 5100;
  const paymentPlan = route?.params?.paymentPlan || 'full';

  const handleFinish = () => {
    resetForm();
    navigation.navigate('MainTabs');
  };

  const handleGoAdmin = () => {
    navigation.navigate('FSSAIAdmin');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="FSSAI Application Confirmation"
        subtitle="Step 11 — Submitted"
        showBack={false}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successSub}>
            Your FSSAI FoSCoS food licensing application has been received.
          </Text>
        </View>

        {/* Application ID Card */}
        <View style={styles.idCard}>
          <Text style={styles.idLabel}>OFFICIAL TRACKING / APPLICATION ID</Text>
          <Text style={styles.idValue}>{applicationId}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>● UNDER EXPERT SCRUTINY</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Application Overview</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Food Business Name</Text>
            <Text style={styles.summaryValue}>
              {formState.businessDetails.foodBusinessName || 'Food Enterprise'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Applicant Legal Name</Text>
            <Text style={styles.summaryValue}>
              {formState.applicantDetails.businessLegalName || 'Applicant'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Kind of Business (KoB)</Text>
            <Text style={styles.summaryValue}>{formState.kob.toUpperCase()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>License Category</Text>
            <Text style={[styles.summaryValue, { color: eligibility.badgeColor, fontWeight: 'bold' }]}>
              {eligibility.label}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status</Text>
            <Text style={[styles.summaryValue, { color: COLORS.whatsapp, fontWeight: 'bold' }]}>
              ✓ {formatINR(paidAmount)} ({paymentPlan === 'full' ? 'Full Paid' : '50% Advance Paid'})
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Submission Date</Text>
            <Text style={styles.summaryValue}>
              {new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Timeline Next Steps */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>⏳ Licensing Timeline & Next Steps</Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDotActive}>
              <Text style={styles.timelineDotText}>1</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStepTitle}>Document Scrutiny (1–2 Days)</Text>
              <Text style={styles.timelineStepDesc}>
                VyaparCare food safety compliance attorneys verify all premises proofs, blueprints and lab reports.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <Text style={styles.timelineDotText}>2</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStepTitle}>Official FoSCoS Filing (Form A / Form B)</Text>
              <Text style={styles.timelineStepDesc}>
                Application filed with the Food Safety and Standards Authority of India (FSSAI).
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <Text style={styles.timelineDotText}>3</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStepTitle}>Food Safety Officer (FSO) Verification</Text>
              <Text style={styles.timelineStepDesc}>
                Designated Officer scrutinizes categories and initiates inspection if required for your KoB.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <Text style={styles.timelineDotText}>4</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStepTitle}>14-Digit FSSAI License Issued</Text>
              <Text style={styles.timelineStepDesc}>
                Certificate issued with QR code and official 14-digit FSSAI registration number.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={handleGoAdmin}
          activeOpacity={0.8}
        >
          <Text style={styles.adminBtnText}>🔍 Open FSSAI Admin Desk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={handleFinish}
          activeOpacity={0.85}
        >
          <Text style={styles.homeBtnText}>Return to Home Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginVertical: 14,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.whatsapp,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  successCheck: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  idCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    alignItems: 'center',
    marginBottom: 16,
  },
  idLabel: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  idValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#B45309',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineDotActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  timelineDotText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  timelineStepDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  adminBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBtnText: {
    color: '#1E40AF',
    fontSize: 13.5,
    fontWeight: 'bold',
  },
  homeBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: 'bold',
  },
});
