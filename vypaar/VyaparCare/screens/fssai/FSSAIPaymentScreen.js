import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import FSSAIStepper from '../../components/FSSAIStepper';
import { FSSAI_SERVICE_INFO } from '../../config/fssaiConfig';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { formatINR } from '../../utils/currency';

export default function FSSAIPaymentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { formState, updateFormState, getFees, submitApplication, isSubmitting } = useFSSAIForm();

  const [paymentPlan, setPaymentPlan] = useState('full'); // 'full' | 'advance'

  const fees = getFees();
  const payableAmount = paymentPlan === 'full' ? fees.totalPayable : fees.advanceAmount;

  const handlePayAndSubmit = async () => {
    try {
      const record = await submitApplication(user);
      navigation.navigate('FSSAIConfirmation', {
        applicationId: record?.application_id || record?.applicationId || formState.submittedApplicationId,
        paymentPlan,
        paidAmount: payableAmount,
      });
    } catch (err) {
      console.error('Payment / Submission Error:', err);
      Alert.alert('Submission Error', err.message || 'Failed to submit FSSAI application. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 10 — Fee Breakdown & Payment"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={10}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fee Breakdown & Licensing Schedule</Text>
          <Text style={styles.sectionSubtitle}>
            Statutory government fee and professional drafting assistance for FoSCoS portal submission.
          </Text>
        </View>

        {/* License Validity Selector */}
        <View style={styles.validityCard}>
          <Text style={styles.validityTitle}>Select License Validity Period (Years):</Text>
          <View style={styles.validityRow}>
            {[1, 2, 3, 4, 5].map((yr) => {
              const isSelected = formState.validityYears === yr;
              return (
                <TouchableOpacity
                  key={`yr-${yr}`}
                  style={[styles.validityChip, isSelected && styles.validityChipActive]}
                  onPress={() => updateFormState({ validityYears: yr })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.validityChipText, isSelected && styles.validityChipTextActive]}>
                    {yr} {yr === 1 ? 'Year' : 'Years'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Cost Summary Table */}
        <View style={styles.feeCard}>
          <View style={styles.tierHeaderRow}>
            <Text style={styles.tierHeaderTitle}>{fees.licenseTierLabel} Fee Schedule</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{fees.validityYears} Year Validity</Text>
            </View>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Professional Service Fee</Text>
            <Text style={styles.feeVal}>{formatINR(fees.serviceFee)}</Text>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>
              Official FoSCoS Govt Fee ({formatINR(fees.annualGovtFee)} × {fees.validityYears} yr)
            </Text>
            <Text style={styles.feeVal}>{formatINR(fees.totalGovtFee)}</Text>
          </View>

          <View style={styles.feeDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Application Cost</Text>
            <Text style={styles.totalVal}>{formatINR(fees.totalPayable)}</Text>
          </View>
        </View>

        {/* Payment Plan Selector */}
        <View style={styles.planSection}>
          <Text style={styles.planSectionTitle}>Choose Payment Option:</Text>

          <TouchableOpacity
            style={[styles.planCard, paymentPlan === 'full' && styles.planCardActive]}
            onPress={() => setPaymentPlan('full')}
            activeOpacity={0.8}
          >
            <View style={styles.planRadio}>
              {paymentPlan === 'full' && <View style={styles.planRadioInner} />}
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>Full Payment (100%)</Text>
              <Text style={styles.planDesc}>Pay complete fees now for faster processing</Text>
            </View>
            <Text style={styles.planAmount}>{formatINR(fees.totalPayable)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, paymentPlan === 'advance' && styles.planCardActive]}
            onPress={() => setPaymentPlan('advance')}
            activeOpacity={0.8}
          >
            <View style={styles.planRadio}>
              {paymentPlan === 'advance' && <View style={styles.planRadioInner} />}
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>50% Advance Payment</Text>
              <Text style={styles.planDesc}>50% Service Fee + 100% Govt Fee now, balance on certificate</Text>
            </View>
            <Text style={styles.planAmount}>{formatINR(fees.advanceAmount)}</Text>
          </TouchableOpacity>
        </View>

        {/* What's Included Card */}
        <View style={styles.inclusionsCard}>
          <Text style={styles.inclusionsTitle}>✅ What's Included in this Package</Text>
          {FSSAI_SERVICE_INFO.included.map((item, idx) => (
            <View key={idx} style={styles.incRow}>
              <Text style={styles.incCheck}>✓</Text>
              <Text style={styles.incText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.paySummaryRow}>
          <View>
            <Text style={styles.paySummaryLabel}>Amount Payable Now</Text>
            <Text style={styles.paySummaryVal}>{formatINR(payableAmount)}</Text>
          </View>
          <TouchableOpacity
            style={styles.payBtn}
            onPress={handlePayAndSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.payBtnText}>PAY & SUBMIT →</Text>
            )}
          </TouchableOpacity>
        </View>
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
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  validityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  validityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  validityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  validityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  validityChipActive: {
    backgroundColor: '#FFFDF6',
    borderColor: COLORS.gold,
  },
  validityChipText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#64748B',
  },
  validityChipTextActive: {
    color: COLORS.gold,
  },
  feeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  tierHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tierHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  tierBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  feeLabel: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  feeVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  feeDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.gold,
  },
  planSection: {
    marginBottom: 16,
  },
  planSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  planCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  planDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  planAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginLeft: 10,
  },
  inclusionsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inclusionsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  incRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  incCheck: {
    color: COLORS.whatsapp,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  incText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  paySummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paySummaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  paySummaryVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.gold,
  },
  payBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 24,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  payBtnText: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
