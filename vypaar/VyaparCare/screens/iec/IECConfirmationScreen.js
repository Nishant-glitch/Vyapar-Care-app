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
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';
import { formatINR } from '../../utils/currency';

export default function IECConfirmationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, resetForm } = useIECForm();

  const applicationId = route.params?.applicationId || 'IEC-2026-000001';
  const submittedAt = route.params?.submittedAt || new Date().toISOString();

  const handleFinish = () => {
    resetForm();
    navigation.navigate('Home');
  };

  const handleViewCertificate = () => {
    navigation.navigate('IECCertificate', { applicationId });
  };

  const handleAdminView = () => {
    navigation.navigate('IECAdmin');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Application Submitted" showBack={false} />
      <IECStepper currentStep={11} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header Box */}
        <View style={styles.successBox}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>IEC Application Submitted!</Text>
          <Text style={styles.successSub}>
            Your application has been assigned to our foreign trade specialist team for DGFT portal submission and Aadhaar/DSC e-sign.
          </Text>

          <View style={styles.idCard}>
            <Text style={styles.idLabel}>IEC APPLICATION TRACKING ID</Text>
            <Text style={styles.idVal}>{applicationId}</Text>
          </View>
        </View>

        {/* Application Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Legal Entity Name:</Text>
            <Text style={styles.valBold}>
              {formData.panDetails?.legalName || 'Acme Global Exports'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Entity PAN:</Text>
            <Text style={styles.valHighlight}>{formData.panDetails?.panNumber || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Constitution:</Text>
            <Text style={styles.val}>{formData.entityType?.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bank Account:</Text>
            <Text style={styles.valSuccess}>✓ Pre-Validated ({formData.bankDetails?.bankName})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Signatory:</Text>
            <Text style={styles.val}>{formData.signatoryDetails?.fullName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Fee Paid:</Text>
            <Text style={styles.valBold}>{formatINR(4500)} (Successful)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Submission Date:</Text>
            <Text style={styles.val}>{new Date(submittedAt).toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        {/* Next Steps Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Post-Submission Milestones</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.dotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>1. Document Scrutiny & PFMS Validation</Text>
              <Text style={styles.stepDesc}>
                Cross-verification of bank certificate and address proof against DGFT guidelines.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>2. DGFT Portal Upload & Authentication</Text>
              <Text style={styles.stepDesc}>
                Filing of Form ANF-2A and E-Sign via Aadhaar OTP / Digital Signature (DSC).
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>3. Official e-IEC Certificate Issuance</Text>
              <Text style={styles.stepDesc}>
                Instant generation and lifetime valid e-IEC certificate delivery with QR code.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.btnCert} onPress={handleViewCertificate}>
          <Text style={styles.btnCertText}>📜 View / Track Official e-IEC Certificate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnAdmin} onPress={handleAdminView}>
          <Text style={styles.btnAdminText}>🛠️ Open IEC Admin Desk</Text>
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
  btnCert: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnCertText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
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
