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
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { formatINR } from '../../utils/currency';

export default function GSTPaymentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { formData, updateFormData, fees, submit, submitting } = useGSTForm();
  const [selectedPlan, setSelectedPlan] = useState(formData.paymentPlan || 'advance');

  const payableAmount =
    selectedPlan === 'full' ? fees.totalPayable : fees.advanceAmount;

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    updateFormData({ paymentPlan: plan });
  };

  const handlePay = async () => {
    try {
      const result = await submit(user);
      navigation.navigate('GSTConfirmation', {
        applicationId: result.id || 'GST-2026-000101',
        paidAmount: payableAmount,
        paymentPlan: selectedPlan,
      });
    } catch (err) {
      Alert.alert('Payment / Submission Failed', err.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Fee & Payment" />
      <GSTStepper currentStep={9} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>💳 Step 9: Fee Breakdown & Payment</Text>
          <Text style={styles.bannerSubtitle}>
            100% transparent pricing. Includes GSTIN creation, GST REG-06 certificate and complete filing support.
          </Text>
        </View>

        {/* ---------- Fee Breakdown Table ---------- */}
        <View style={styles.feeCard}>
          <Text style={styles.cardHeader}>Fee Summary</Text>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Professional Filing & Advisory Fee</Text>
            <Text style={styles.feeVal}>{formatINR(fees.serviceFee)}</Text>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>GST Portal Application Filing Fee</Text>
            <Text style={styles.feeValFree}>₹0 (Included)</Text>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>HSN / SAC Advisory & Aadhaar TRN Support</Text>
            <Text style={styles.feeValFree}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Package Fee</Text>
            <Text style={styles.totalVal}>{formatINR(fees.totalPayable)}</Text>
          </View>
        </View>

        {/* ---------- Payment Plan Options ---------- */}
        <Text style={styles.sectionHeader}>Choose Payment Option</Text>

        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'advance' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('advance')}
          activeOpacity={0.7}
        >
          <View style={styles.planHeader}>
            <View style={styles.radio}>
              {selectedPlan === 'advance' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.planTitle}>50% Advance Today</Text>
              <Text style={styles.planSub}>
                Pay 50% ({formatINR(fees.advanceAmount)}) now; balance{' '}
                {formatINR(fees.balanceAmount)} upon GST application draft approval.
              </Text>
            </View>
            <Text style={styles.planAmount}>{formatINR(fees.advanceAmount)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'full' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('full')}
          activeOpacity={0.7}
        >
          <View style={styles.planHeader}>
            <View style={styles.radio}>
              {selectedPlan === 'full' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.planTitle}>Pay Full Amount Today</Text>
              <Text style={styles.planSub}>
                One-time complete payment for uninterrupted, priority filing.
              </Text>
            </View>
            <Text style={styles.planAmount}>{formatINR(fees.totalPayable)}</Text>
          </View>
        </TouchableOpacity>

        {/* Trust Badges */}
        <View style={styles.trustBox}>
          <Text style={styles.trustTitle}>🔒 100% Secure Transaction</Text>
          <Text style={styles.trustDesc}>
            Encrypted with 256-bit SSL. Supported via UPI, NetBanking, Credit/Debit Cards.
          </Text>
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
          style={({ pressed }) => [
            styles.btnNext,
            pressed && styles.btnPressed,
            submitting && { opacity: 0.7 },
          ]}
          onPress={handlePay}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.btnNextText}>
              PAY {formatINR(payableAmount)} & SUBMIT APPLICATION 🔒
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
  banner: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#047857', lineHeight: 18 },
  feeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feeLabel: { fontSize: 13, color: '#475569', flex: 1, marginRight: 10 },
  feeVal: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  feeValFree: { fontSize: 12, fontWeight: '700', color: '#059669' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  totalVal: { fontSize: 18, fontWeight: '800', color: '#059669' },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  planCardSelected: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  planHeader: { flexDirection: 'row', alignItems: 'center' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#059669' },
  planTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  planSub: { fontSize: 11, color: '#64748B', marginTop: 3, lineHeight: 15 },
  planAmount: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginLeft: 10 },
  trustBox: {
    marginTop: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trustTitle: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 2 },
  trustDesc: { fontSize: 11, color: '#64748B', lineHeight: 15 },
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
