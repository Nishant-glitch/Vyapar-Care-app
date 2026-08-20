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
import ScreenHeader from '../../components/ScreenHeader';
import UdyamStepper from '../../components/UdyamStepper';
import { COLORS } from '../../constants/theme';
import { useUdyamForm } from '../../contexts/UdyamFormContext';
import { formatINR } from '../../utils/currency';

export default function UdyamConfirmationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, msmeCategory, resetForm } = useUdyamForm();

  const applicationId = route.params?.applicationId || 'UDYAM-2026-000001';
  const submittedAt = route.params?.submittedAt || new Date().toISOString();

  const handleFinish = () => {
    resetForm();
    navigation.navigate('Home');
  };

  const handleAdminView = () => {
    navigation.navigate('UdyamAdmin');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Application Submitted" showBack={false} />
      <UdyamStepper currentStep={12} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon & Header */}
        <View style={styles.successBox}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Application Submitted Successfully!</Text>
          <Text style={styles.successSub}>
            Your Udyam Registration assistance application has been received and queued for processing.
          </Text>

          <View style={styles.idCard}>
            <Text style={styles.idLabel}>APPLICATION TRACKING ID</Text>
            <Text style={styles.idVal}>{applicationId}</Text>
          </View>
        </View>

        {/* Application Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Enterprise Name:</Text>
            <Text style={styles.valBold}>
              {formData.businessDetails?.enterpriseName || 'Apex Innovations'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Applicant Name:</Text>
            <Text style={styles.val}>
              {formData.aadhaarDetails?.nameAsPerAadhaar || 'Ramesh Kumar'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Organisation Type:</Text>
            <Text style={styles.val}>
              {formData.businessDetails?.organisationType?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>MSME Classification:</Text>
            <Text style={styles.valSuccess}>{msmeCategory.categoryLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Service Fee Paid:</Text>
            <Text style={styles.valBold}>{formatINR(2000)} (Successful)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Submission Date:</Text>
            <Text style={styles.val}>{new Date(submittedAt).toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        {/* Process Next Steps Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>What Happens Next?</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.dotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>1. NIC Code Verification & Mapping</Text>
              <Text style={styles.stepDesc}>
                Our compliance experts verify your activities under NIC 2008 5-digit classification.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>2. Official Portal Filing (udyamregistration.gov.in)</Text>
              <Text style={styles.stepDesc}>
                Filing on the National Portal with Aadhaar OTP & PAN linking (Within 24 Hours).
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>3. Udyam Registration Certificate Issuance</Text>
              <Text style={styles.stepDesc}>
                Permanent 19-Digit Udyam Number (URN) and dynamic QR Certificate generated.
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Desk Direct Link */}
        <TouchableOpacity style={styles.btnAdmin} onPress={handleAdminView}>
          <Text style={styles.btnAdminText}>🛠️ Open MSME / Udyam Admin Desk</Text>
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
