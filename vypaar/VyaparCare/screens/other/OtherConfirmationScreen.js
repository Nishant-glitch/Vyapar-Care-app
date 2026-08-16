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
import OtherServicesStepper from '../../components/OtherServicesStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useOtherForm } from '../../contexts/OtherFormContext';
import { formatINR } from '../../utils/currency';

export default function OtherConfirmationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, resetForm } = useOtherForm();

  const applicationId = route.params?.applicationId || 'OTHER-2026-000001';
  const submittedAt = route.params?.submittedAt || new Date().toISOString();
  const isPaid = route.params?.isPaid !== false;

  const handleFinish = () => {
    resetForm();
    navigation.navigate('Home');
  };

  const handleAdminView = () => {
    navigation.navigate('OtherAdmin');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Request Submitted" showBack={false} />
      <OtherServicesStepper currentStep={9} />

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
          <Text style={styles.successTitle}>Request Submitted Successfully!</Text>
          <Text style={styles.successSub}>
            Your requirement has been recorded and assigned to our legal & tax advisory team for review and response.
          </Text>

          <View style={styles.idCard}>
            <Text style={styles.idLabel}>SERVICE REQUEST TRACKING ID</Text>
            <Text style={styles.idVal}>{applicationId}</Text>
          </View>
        </View>

        {/* Application Details Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Request Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Service / Requirement:</Text>
            <Text style={styles.valBold}>
              {formData.isUncertainService
                ? '✨ General Legal / Tax Consultation'
                : formData.selectedService?.name || 'Custom Service'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Applicant Name:</Text>
            <Text style={styles.val}>
              {formData.applicantDetails?.fullName || 'Client'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.val}>
              {(formData.requirementDetails?.department || 'GST').toUpperCase()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Urgency:</Text>
            <Text style={styles.valHighlight}>
              {(formData.requirementDetails?.urgency || 'Normal').replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text style={isPaid ? styles.valSuccess : styles.valPending}>
              {isPaid ? `✓ ${formatINR(2500)} Paid (Priority)` : 'Quote / Review Pending (Free)'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Submission Date:</Text>
            <Text style={styles.val}>{new Date(submittedAt).toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        {/* Next Steps Roadmap */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Next Steps & Consultation Workflow</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.dotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>1. Requirement Review & Assessment</Text>
              <Text style={styles.stepDesc}>
                Senior CA / Legal professional examines your requirements and uploaded notices.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>2. 1-on-1 Consultation & Quotation</Text>
              <Text style={styles.stepDesc}>
                Discussion via your preferred contact mode with an itemized filing strategy.
              </Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitle}>3. Filing Execution & Document Delivery</Text>
              <Text style={styles.stepDesc}>
                Preparation of reply / application, department filing, and acknowledgment delivery.
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Desk Action */}
        <TouchableOpacity style={styles.btnAdmin} onPress={handleAdminView}>
          <Text style={styles.btnAdminText}>🛠️ Open Other Services Admin Desk</Text>
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
  successTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'center', marginBottom: 6 },
  successSub: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 17, marginBottom: 16 },
  idCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
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
  valPending: { fontSize: 12, fontWeight: '700', color: '#D97706' },
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
    marginBottom: 16,
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
