import React, { useState } from 'react';
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
import FormField from '../../components/FormField';
import ITRStepper from '../../components/ITRStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useITRForm } from '../../contexts/ITRFormContext';
import { formatINR } from '../../utils/currency';
import { validateITRBank } from '../../utils/itrValidation';

export default function ITRTaxPaidScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateTaxPaid,
    updateBankDetails,
    taxComputation,
  } = useITRForm();
  const [errors, setErrors] = useState({});

  const tax = formData.taxPaid || {};
  const bank = formData.bankDetails || {};
  const comp = taxComputation;

  const handleTaxChange = (key, val) => {
    const num = val.replace(/[^0-9]/g, '');
    updateTaxPaid({ [key]: num === '' ? 0 : Number(num) });
  };

  const handleBankChange = (key, val) => {
    updateBankDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateITRBank(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('ITRDocuments');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="TDS Paid & Refund Bank" />
      <ITRStepper currentStep={8} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏦 Step 8: Tax Paid & Refund Bank Account</Text>
          <Text style={styles.bannerSubtitle}>
            Declare advance tax / TDS already deposited and nominate your validated bank account for tax refund.
          </Text>
        </View>

        {/* Live Tax vs TDS Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Tax Liability</Text>
              <Text style={styles.summaryVal}>{formatINR(comp.totalTaxLiability)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Total Tax Deposited</Text>
              <Text style={styles.summaryVal}>{formatINR(comp.totalTaxesPaid)}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>
                {comp.isRefund ? 'ESTIMATED REFUND' : 'TAX PAYABLE'}
              </Text>
              <Text
                style={[
                  styles.summaryValBold,
                  { color: comp.isRefund ? '#059669' : '#DC2626' },
                ]}
              >
                {formatINR(comp.finalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Taxes Paid Inputs */}
        <Text style={styles.sectionHeader}>Taxes Deposited (As per Form 26AS & AIS)</Text>

        <FormField
          label="TDS on Salary (Form 16) (₹)"
          placeholder="35000"
          value={tax.tdsSalary ? String(tax.tdsSalary) : ''}
          onChangeText={(v) => handleTaxChange('tdsSalary', v)}
          keyboardType="number-pad"
        />

        <FormField
          label="TDS on Other Income / FD / Freelance (Form 16A) (₹)"
          placeholder="0"
          value={tax.tdsOther ? String(tax.tdsOther) : ''}
          onChangeText={(v) => handleTaxChange('tdsOther', v)}
          keyboardType="number-pad"
        />

        <FormField
          label="Advance Tax Paid (Challan 280) (₹)"
          placeholder="0"
          value={tax.advanceTax ? String(tax.advanceTax) : ''}
          onChangeText={(v) => handleTaxChange('advanceTax', v)}
          keyboardType="number-pad"
          helperText="Quarterly advance tax installments deposited during the year"
        />

        <FormField
          label="Self-Assessment Tax Paid (₹)"
          placeholder="0"
          value={tax.selfAssessmentTax ? String(tax.selfAssessmentTax) : ''}
          onChangeText={(v) => handleTaxChange('selfAssessmentTax', v)}
          keyboardType="number-pad"
        />

        <View style={styles.divider} />

        {/* Refund Bank Details */}
        <Text style={styles.sectionHeader}>Nominated Refund Bank Account</Text>

        <FormField
          label="Bank Name *"
          placeholder="e.g. HDFC Bank / State Bank of India"
          value={bank.bankName}
          onChangeText={(v) => handleBankChange('bankName', v)}
          error={errors.bankName}
        />

        <FormField
          label="Account Holder Name (as per Bank) *"
          placeholder="e.g. Rahul Sharma"
          value={bank.accountHolderName}
          onChangeText={(v) => handleBankChange('accountHolderName', v)}
          error={errors.accountHolderName}
        />

        <FormField
          label="Bank Account Number *"
          placeholder="50200012345678"
          value={bank.accountNumber}
          onChangeText={(v) => handleBankChange('accountNumber', v)}
          keyboardType="number-pad"
          error={errors.accountNumber}
        />

        <FormField
          label="11-Digit IFSC Code *"
          placeholder="HDFC0000050"
          value={bank.ifsc}
          onChangeText={(v) => handleBankChange('ifsc', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={11}
          error={errors.ifsc}
        />

        <View style={styles.refundBadge}>
          <Text style={styles.refundBadgeText}>✓ Primary Account Nominated for Direct ECS Tax Refund</Text>
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
          onPress={handleNext}
        >
          <Text style={styles.btnNextText}>CONTINUE TO DOCUMENT CENTER →</Text>
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
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#0284C7', lineHeight: 18 },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 10, color: '#64748B', marginBottom: 2, fontWeight: '600' },
  summaryVal: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  summaryValBold: { fontSize: 14, fontWeight: '900' },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  refundBadge: {
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 6,
  },
  refundBadgeText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
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
