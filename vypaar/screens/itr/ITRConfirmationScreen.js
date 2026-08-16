import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ITRStepper from '../../components/ITRStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useITRForm } from '../../contexts/ITRFormContext';
import { formatINR } from '../../utils/currency';

export default function ITRConfirmationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, taxComputation, recommendedITR, resetForm } = useITRForm();

  const applicationId = route.params?.applicationId || 'ITR-2026-000001';
  const submittedAt = route.params?.submittedAt || new Date().toISOString();

  const handleFinish = () => {
    resetForm();
    navigation.navigate('Home');
  };

  const handleAdminView = () => {
    navigation.navigate('ITRAdmin');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="ITR Filing Queued" showBack={false} />
      <ITRStepper currentStep={12} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon Box */}
        <View style={styles.successBox}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>ITR Filing Submitted Successfully!</Text>
          <Text style={styles.successSub}>
            Your return information has been assigned to our Chartered Accountants team for computation sheet preparation and official e-filing.
          </Text>

          <View style={styles.idCard}>
            <Text style={styles.idLabel}>ITR APPLICATION TRACKING ID</Text>
            <Text style={styles.idVal}>{applicationId}</Text>
          </View>
        </View>

        {/* Application Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Filing Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Taxpayer Name:</Text>
            <Text style={styles.valBold}>{formData.profile?.fullName || 'Rahul Sharma'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAN Number:</Text>
            <Text style={styles.valHighlight}>{formData.profile?.pan || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Assessment Year:</Text>
            <Text style={styles.val}>{formData.assessmentYear?.replace('_', ' ')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ITR Form:</Text>
            <Text style={styles.valSuccess}>{recommendedITR.recommendedForm}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax Regime:</Text>
            <Text style={styles.val}>
              {taxComputation.activeRegime === 'new' ? 'New Tax Regime (115BAC)' : 'Old Tax Regime'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Net Taxable Income:</Text>
            <Text style={styles.valBold}>{formatINR(taxComputation.taxableIncome)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              {taxComputation.isRefund ? 'Estimated Refund Due:' : 'Net Tax Payable:'}
            </Text>
            <Text
              style={[
                styles.valBold,
                { color: taxComputation.isRefund ? '#059669' : '#DC2626' },
              ]}
            >
              {formatINR(taxComputation.finalAmount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Filing Fee Paid:</Text>
            <Text style={styles.valBold}>{formatINR(3000)} (Successful)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Submission Date:</Text>
            <Text style={styles.val}>{new Date(submittedAt).toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        {/* Next Steps Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Post-Filing Milestones</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.dotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>1. CA Computation & AIS/26AS Cross-Check</Text>
              <Text style={styles.stepDesc}>
                Verification of TDS credits and income matching with TRACES data.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>2. e-Filing on Income Tax Department Portal</Text>
              <Text style={styles.stepDesc}>
                JSON upload & submission on incometax.gov.in (Within 24–48 Hours).
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>3. Aadhaar OTP E-Verification & ITR-V Delivery</Text>
              <Text style={styles.stepDesc}>
                Instant e-verification and download of signed Form ITR-V Acknowledgment.
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Desk Direct Link */}
        <TouchableOpacity style={styles.btnAdmin} onPress={handleAdminView}>
          <Text style={styles.btnAdminText}>🛠️ Open Income Tax Admin Desk</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ---------- Footer ---------- */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 14) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.btnHome, pressed && styles.btnPressed]}
          onPress={handleFinish}
        >
          <Text style={styles.btnHomeText}>RETURN TO DASHBOARD</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  successBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconText: { color: COLORS.white, fontSize: 32, fontWeight: '900' },
  successTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'center', marginBottom: 6 },
  successSub: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 17, marginBottom: 16 },
  idCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  idLabel: { fontSize: 10, fontWeight: '800', color: '#0369A1', letterSpacing: 0.5 },
  idVal: { fontSize: 18, fontWeight: '900', color: '#0284C7', marginTop: 2 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 12, color: '#64748B' },
  val: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  valBold: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  valHighlight: { fontSize: 12, fontWeight: '700', color: '#0284C7' },
  valSuccess: { fontSize: 12, fontWeight: '800', color: '#059669' },
  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 14 },
  timelineItem: { flexDirection: 'row', marginBottom: 14 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
    marginRight: 12,
  },
  dotActive: { backgroundColor: '#10B981' },
  timelineContent: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  stepDesc: { fontSize: 11, color: '#64748B', lineHeight: 15 },
  btnAdmin: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 20,
  },
  btnAdminText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btnHome: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.85 },
  btnHomeText: { fontSize: 15, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
});
