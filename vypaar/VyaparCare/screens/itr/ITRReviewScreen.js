import React, { useState } from 'react';
import {
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
import { useITRForm } from '../../contexts/ITRFormContext';
import { formatINR } from '../../utils/currency';
import { validateFullITRApplication } from '../../utils/itrValidation';

export default function ITRReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateFormData,
    taxComputation,
    recommendedITR,
  } = useITRForm();

  const [decl1, setDecl1] = useState(formData.declarations?.infoTrue || false);
  const [decl2, setDecl2] = useState(formData.declarations?.reviewAcknowledged || false);
  const [errorMsg, setErrorMsg] = useState(null);

  const profile = formData.profile || {};
  const inc = formData.incomeDetails || {};
  const bank = formData.bankDetails || {};
  const comp = taxComputation;

  const handleToggleDecl1 = () => {
    const next = !decl1;
    setDecl1(next);
    updateFormData({
      declarations: { ...formData.declarations, infoTrue: next },
    });
    if (errorMsg) setErrorMsg(null);
  };

  const handleToggleDecl2 = () => {
    const next = !decl2;
    setDecl2(next);
    updateFormData({
      declarations: { ...formData.declarations, reviewAcknowledged: next },
    });
    if (errorMsg) setErrorMsg(null);
  };

  const handleNext = () => {
    if (!decl1 || !decl2) {
      setErrorMsg('Please accept both statutory declarations before proceeding');
      Alert.alert('Declarations Required', 'Both declaration checkboxes are mandatory under Income Tax guidelines.');
      return;
    }

    const fullErrs = validateFullITRApplication(formData);
    if (Object.keys(fullErrs).length > 0) {
      Alert.alert('Incomplete Return Data', 'Please review required fields before proceeding.');
      return;
    }

    navigation.navigate('ITRPayment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Tax Computation Sheet" />
      <ITRStepper currentStep={10} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📊 Step 10: Complete Tax Computation Summary</Text>
          <Text style={styles.bannerSubtitle}>
            Review your taxable income, deductions, regime selection and estimated refund.
          </Text>
        </View>

        {/* 1. Profile & ITR Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>1. Taxpayer Profile & ITR Form</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ITRProfile')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Taxpayer Name:</Text>
            <Text style={styles.valBold}>{profile.fullName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAN Number:</Text>
            <Text style={styles.valHighlight}>{profile.pan || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Assessment Year:</Text>
            <Text style={styles.val}>{formData.assessmentYear?.replace('_', ' ')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Applicable Form:</Text>
            <Text style={styles.valSuccess}>{recommendedITR.recommendedForm}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax Regime Selected:</Text>
            <Text style={styles.valBold}>
              {comp.activeRegime === 'new' ? 'New Tax Regime (Sec 115BAC)' : 'Old Tax Regime'}
            </Text>
          </View>
        </View>

        {/* 2. Computation Sheet Card */}
        <View style={styles.computationCard}>
          <Text style={styles.compCardTitle}>Income Tax Computation Sheet</Text>

          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Salary Income (Gross)</Text>
            <Text style={styles.compVal}>{formatINR(inc.salaryGross || 0)}</Text>
          </View>

          {Number(inc.businessProfit || inc.professionProfit || 0) > 0 && (
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>Business / Professional Profit</Text>
              <Text style={styles.compVal}>
                {formatINR(Number(inc.businessProfit || 0) + Number(inc.professionProfit || 0))}
              </Text>
            </View>
          )}

          {Number(inc.hpGrossRent || 0) > 0 && (
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>House Property Rental (Net)</Text>
              <Text style={styles.compVal}>{formatINR(inc.hpGrossRent || 0)}</Text>
            </View>
          )}

          {Number(inc.stcg || inc.ltcg || inc.vdaCryptoGain || 0) > 0 && (
            <View style={styles.compRow}>
              <Text style={styles.compLabel}>Capital Gains (STCG + LTCG + VDA)</Text>
              <Text style={styles.compVal}>
                {formatINR(Number(inc.stcg || 0) + Number(inc.ltcg || 0) + Number(inc.vdaCryptoGain || 0))}
              </Text>
            </View>
          )}

          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Income from Other Sources (Interest)</Text>
            <Text style={styles.compVal}>{formatINR(inc.savingsInterest || 0)}</Text>
          </View>

          <View style={styles.compDivider} />

          <View style={styles.compRow}>
            <Text style={styles.compLabelBold}>Gross Total Income (GTI)</Text>
            <Text style={styles.compValBold}>{formatINR(comp.grossTotalIncome)}</Text>
          </View>

          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Less: Total Deductions & Exemptions</Text>
            <Text style={[styles.compVal, { color: '#DC2626' }]}>
              - {formatINR(comp.totalDeductions)}
            </Text>
          </View>

          <View style={styles.compDivider} />

          <View style={styles.compRow}>
            <Text style={styles.compLabelBold}>Total Net Taxable Income</Text>
            <Text style={styles.compValBold}>{formatINR(comp.taxableIncome)}</Text>
          </View>

          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Total Tax Liability (Incl. 4% Cess)</Text>
            <Text style={styles.compVal}>{formatINR(comp.totalTaxLiability)}</Text>
          </View>

          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Less: Taxes Paid (TDS, TCS, Advance Tax)</Text>
            <Text style={[styles.compVal, { color: '#059669' }]}>
              - {formatINR(comp.totalTaxesPaid)}
            </Text>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              {comp.isRefund ? 'FINAL ESTIMATED REFUND DUE' : 'NET TAX PAYABLE'}
            </Text>
            <Text
              style={[
                styles.resultVal,
                { color: comp.isRefund ? '#059669' : '#DC2626' },
              ]}
            >
              {formatINR(comp.finalAmount)}
            </Text>
          </View>
        </View>

        {/* 3. Refund Bank Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>3. Nominated Refund Bank Account</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ITRTaxPaid')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bank Name:</Text>
            <Text style={styles.val}>{bank.bankName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Number:</Text>
            <Text style={styles.val}>{bank.accountNumber || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IFSC Code:</Text>
            <Text style={styles.valHighlight}>{bank.ifsc || '-'}</Text>
          </View>
        </View>

        {/* Dual Statutory Declarations */}
        <View style={styles.declarationBox}>
          <Text style={styles.declHeader}>⚖️ Statutory Taxpayer Declarations</Text>
          <Text style={styles.declDisclaimer}>{ITR_DISCLAIMER_TEXT}</Text>

          {/* Declaration 1 */}
          <TouchableOpacity
            style={styles.declRow}
            onPress={handleToggleDecl1}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, decl1 && styles.checkboxChecked]}>
              {decl1 && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.declText}>
              I confirm that the information, income sources and records provided by me are true, correct and complete to the best of my knowledge and belief.
            </Text>
          </TouchableOpacity>

          {/* Declaration 2 */}
          <TouchableOpacity
            style={[styles.declRow, { marginTop: 10 }]}
            onPress={handleToggleDecl2}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, decl2 && styles.checkboxChecked]}>
              {decl2 && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.declText}>
              I understand that the final ITR form, calculation and tax liability will be verified by a tax professional before official portal filing.
            </Text>
          </TouchableOpacity>

          {errorMsg && <Text style={styles.errorText}>⚠️ {errorMsg}</Text>}
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
          <Text style={styles.btnNextText}>PROCEED TO SERVICE PAYMENT →</Text>
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
    marginBottom: 14,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#0284C7', lineHeight: 18 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
  btnEdit: { fontSize: 12, color: '#0284C7', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 12, color: '#64748B' },
  val: { fontSize: 12, color: COLORS.text, fontWeight: '600', textAlign: 'right' },
  valBold: { fontSize: 12, color: COLORS.text, fontWeight: '700', textAlign: 'right' },
  valHighlight: { fontSize: 12, color: '#0284C7', fontWeight: '700', textAlign: 'right' },
  valSuccess: { fontSize: 12, color: '#059669', fontWeight: '800', textAlign: 'right' },
  computationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  compCardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 12 },
  compRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  compLabel: { fontSize: 12, color: '#475569' },
  compVal: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  compLabelBold: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
  compValBold: { fontSize: 13, fontWeight: '800', color: COLORS.primaryDark },
  compDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  resultBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resultLabel: { fontSize: 11, fontWeight: '800', color: '#166534', letterSpacing: 0.5 },
  resultVal: { fontSize: 18, fontWeight: '900' },
  declarationBox: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  declHeader: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  declDisclaimer: { fontSize: 11, color: '#78350F', lineHeight: 15, marginBottom: 12 },
  declRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#92400E',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  checkMark: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  declText: { fontSize: 11, color: '#78350F', flex: 1, lineHeight: 16, fontWeight: '600' },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 8, fontWeight: '700' },
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
