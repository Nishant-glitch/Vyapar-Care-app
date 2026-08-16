import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { ITR_DISCLAIMER_TEXT } from '../../config/itrConfig';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useITRForm } from '../../contexts/ITRFormContext';
import { formatINR } from '../../utils/currency';

export default function ITRPaymentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { fees, submit, submitting } = useITRForm();
  const [payMethod, setPayMethod] = useState('upi');

  const handlePayAndSubmit = async () => {
    try {
      const result = await submit(user);
      navigation.navigate('ITRConfirmation', {
        applicationId: result.applicationId || result.id || 'ITR-2026-000001',
        submittedAt: result.submittedAt || new Date().toISOString(),
      });
    } catch (err) {
      Alert.alert('Payment Error', err.message || 'Payment could not be processed.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Service Fee Payment" />
      <ITRStepper currentStep={11} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transparent Cost Breakdown Card */}
        <View style={styles.feeCard}>
          <Text style={styles.feeCardTitle}>Transparent Fee Breakdown</Text>
          <Text style={styles.feeCardSub}>
            Income Tax Return Preparation, CA Computation & Filing Assistance
          </Text>

          <View style={styles.feeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.feeLabel}>Government / Statutory Portal Fee</Text>
              <Text style={styles.feeHint}>Official Income Tax Department e-filing fee</Text>
            </View>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>₹0 (NIL)</Text>
            </View>
          </View>

          <View style={styles.feeDivider} />

          <View style={styles.feeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.feeLabel}>Professional CA Review & Assisted-Filing Fee</Text>
              <Text style={styles.feeHint}>
                Tax optimization, AIS/26AS reconciliation, computation sheet & ITR-V delivery
              </Text>
            </View>
            <Text style={styles.feeVal}>{formatINR(fees.serviceFee)}</Text>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT PAYABLE</Text>
            <Text style={styles.totalVal}>{formatINR(fees.totalPayable)}</Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <Text style={styles.sectionHeader}>Select Payment Method</Text>
        <View style={styles.methodList}>
          {[
            { id: 'upi', label: 'UPI / Google Pay / PhonePe / Paytm', icon: '📱' },
            { id: 'card', label: 'Credit Card / Debit Card', icon: '💳' },
            { id: 'netbanking', label: 'Net Banking (All Indian Banks)', icon: '🏛️' },
          ].map((m) => {
            const isSelected = payMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodItem, isSelected && styles.methodItemSelected]}
                onPress={() => setPayMethod(m.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                  {m.label}
                </Text>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Statutory Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚖️ Compliance Notice:</Text>
          <Text style={styles.disclaimerText}>{ITR_DISCLAIMER_TEXT}</Text>
        </View>
      </ScrollView>

      {/* ---------- Footer ---------- */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 14) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.btnNext, pressed && styles.btnPressed]}
          onPress={handlePayAndSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.btnNextText}>
              PAY {formatINR(fees.totalPayable)} & SUBMIT FOR FILING →
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  feeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  feeCardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 2 },
  feeCardSub: { fontSize: 12, color: '#64748B', marginBottom: 14 },
  feeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  feeLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  feeHint: { fontSize: 11, color: '#64748B', marginTop: 1 },
  freeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeBadgeText: { fontSize: 12, fontWeight: '800', color: '#065F46' },
  feeVal: { fontSize: 15, fontWeight: '800', color: COLORS.primaryDark },
  feeDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  totalBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  totalLabel: { fontSize: 12, fontWeight: '800', color: '#0369A1', letterSpacing: 0.5 },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#0284C7' },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  methodList: { gap: 10, marginBottom: 18 },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  methodItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  methodIcon: { fontSize: 20, marginRight: 12 },
  methodLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },
  methodLabelSelected: { color: '#0369A1', fontWeight: '700' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#0284C7' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#0284C7' },
  disclaimerBox: {
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  disclaimerTitle: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  disclaimerText: { fontSize: 11, color: '#78350F', lineHeight: 15 },
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
  btnNext: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.85 },
  btnNextText: { fontSize: 15, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
});
