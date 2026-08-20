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
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { formatINR } from '../../utils/currency';

export default function GSTConfirmationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { formData } = useGSTForm();

  const applicationId = route.params?.applicationId || 'GST-2026-000101';
  const paidAmount = route.params?.paidAmount || 5000;
  const paymentPlan = route.params?.paymentPlan || 'advance';

  const bDetails = formData.businessDetails || {};

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Application Submitted" showBack={false} />
      <GSTStepper currentStep={10} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header Card */}
        <View style={styles.successCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>Application Filed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your GST Registration application (Form GST REG-01) has been received and queued for expert review.
          </Text>

          <View style={styles.appIdBox}>
            <Text style={styles.appIdLabel}>APPLICATION TRACKING ID</Text>
            <Text style={styles.appIdVal}>{applicationId}</Text>
          </View>
        </View>

        {/* Application Summary Receipt */}
        <View style={styles.receiptCard}>
          <Text style={styles.receiptHeader}>Application Summary</Text>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Legal Name</Text>
            <Text style={styles.receiptVal}>{bDetails.legalName || 'N/A'}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Trade Name</Text>
            <Text style={styles.receiptVal}>{bDetails.tradeName || 'N/A'}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>PAN Number</Text>
            <Text style={styles.receiptValHighlight}>{bDetails.pan || 'N/A'}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Payment Plan</Text>
            <Text style={styles.receiptVal}>
              {paymentPlan === 'full' ? '100% Full Payment' : '50% Advance Paid'}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Amount Paid Today</Text>
            <Text style={styles.receiptValPaid}>{formatINR(paidAmount)}</Text>
          </View>
        </View>

        {/* What Happens Next Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineHeader}>What Happens Next?</Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>1. Document Verification & TRN Generation</Text>
              <Text style={styles.timelineDesc}>
                Our GST specialist will review your PAN, premises and bank proofs within 24 hours.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>2. Form GST REG-01 Filing</Text>
              <Text style={styles.timelineDesc}>
                Official application will be filed on the GST Common Portal with mapped HSN / SAC codes.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>3. Aadhaar Authentication Link</Text>
              <Text style={styles.timelineDesc}>
                You will receive an official SMS/Email link from GST Portal to verify your Aadhaar OTP.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>4. GSTIN & REG-06 Certificate Issuance</Text>
              <Text style={styles.timelineDesc}>
                Your 15-digit GST Number and Official Certificate will be issued in 3-5 working days.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Admin Test Button */}
        <TouchableOpacity
          style={styles.btnAdmin}
          onPress={() => navigation.navigate('GSTAdmin')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnAdminText}>🛠️ Open GST Admin Desk (Staff View)</Text>
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
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.btnHomeText}>BACK TO HOME</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: { fontSize: 30 },
  successTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 6 },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  appIdBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  appIdLabel: { fontSize: 10, fontWeight: '700', color: '#047857', letterSpacing: 0.5 },
  appIdVal: { fontSize: 16, fontWeight: '800', color: '#065F46', marginTop: 2 },
  receiptCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  receiptHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: { fontSize: 12, color: '#64748B' },
  receiptVal: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  receiptValHighlight: { fontSize: 12, fontWeight: '700', color: '#059669' },
  receiptValPaid: { fontSize: 13, fontWeight: '800', color: '#10B981' },
  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  timelineItem: { flexDirection: 'row', marginBottom: 14 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669',
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: { flex: 1 },
  timelineTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  timelineDesc: { fontSize: 11, color: '#64748B', lineHeight: 15 },
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
