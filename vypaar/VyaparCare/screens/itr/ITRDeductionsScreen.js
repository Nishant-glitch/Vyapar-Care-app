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
import FormField from '../../components/FormField';
import ITRStepper from '../../components/ITRStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useITRForm } from '../../contexts/ITRFormContext';
import { formatINR } from '../../utils/currency';

export default function ITRDeductionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateFormData,
    updateDeductions,
    taxComputation,
  } = useITRForm();

  const ded = formData.deductions || {};
  const comp = taxComputation;

  const handleDedChange = (key, val) => {
    const num = val.replace(/[^0-9]/g, '');
    updateDeductions({ [key]: num === '' ? 0 : Number(num) });
  };

  const handleSelectRegime = (regime) => {
    updateFormData({ selectedRegime: regime });
  };

  const handleNext = () => {
    navigation.navigate('ITRTaxPaid');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Deductions & Tax Regime" />
      <ITRStepper currentStep={7} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>💡 Step 7: Deductions & Regime Optimizer</Text>
          <Text style={styles.bannerSubtitle}>
            Claim tax exemptions under Chapter VI-A and compare Old vs New Tax Regime side-by-side.
          </Text>
        </View>

        {/* Live Comparison Table */}
        <View style={styles.optimizerCard}>
          <View style={styles.optimizerHeader}>
            <Text style={styles.optimizerTitle}>Old Regime vs New Regime (Section 115BAC)</Text>
            {comp.taxSavings > 0 && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>
                  ⭐ Save {formatINR(comp.taxSavings)} in {comp.recommendedRegime.toUpperCase()} Regime!
                </Text>
              </View>
            )}
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 1.4 }]}>Parameter</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Old Regime</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>New Regime</Text>
            </View>

            <View style={styles.tr}>
              <Text style={[styles.tdLabel, { flex: 1.4 }]}>Gross Income</Text>
              <Text style={[styles.tdVal, { flex: 1, textAlign: 'right' }]}>
                {formatINR(comp.oldRegime.grossIncome)}
              </Text>
              <Text style={[styles.tdVal, { flex: 1, textAlign: 'right' }]}>
                {formatINR(comp.newRegime.grossIncome)}
              </Text>
            </View>

            <View style={styles.tr}>
              <Text style={[styles.tdLabel, { flex: 1.4 }]}>Total Deductions</Text>
              <Text style={[styles.tdVal, { flex: 1, textAlign: 'right' }]}>
                {formatINR(comp.oldRegime.totalDeductions)}
              </Text>
              <Text style={[styles.tdVal, { flex: 1, textAlign: 'right' }]}>
                {formatINR(comp.newRegime.totalDeductions)}
              </Text>
            </View>

            <View style={styles.tr}>
              <Text style={[styles.tdLabel, { flex: 1.4 }]}>Net Taxable Income</Text>
              <Text style={[styles.tdVal, { flex: 1, textAlign: 'right' }]}>
                {formatINR(comp.oldRegime.taxableIncome)}
              </Text>
              <Text style={[styles.tdVal, { flex: 1, textAlign: 'right' }]}>
                {formatINR(comp.newRegime.taxableIncome)}
              </Text>
            </View>

            <View style={[styles.tr, styles.trHighlight]}>
              <Text style={[styles.tdLabelBold, { flex: 1.4 }]}>Total Tax Liability</Text>
              <Text style={[styles.tdValBold, { flex: 1, textAlign: 'right' }]}>
                {formatINR(comp.oldRegime.totalTaxLiability)}
              </Text>
              <Text style={[styles.tdValBold, { flex: 1, textAlign: 'right', color: '#059669' }]}>
                {formatINR(comp.newRegime.totalTaxLiability)}
              </Text>
            </View>
          </View>

          {/* Regime Choice Selector */}
          <Text style={styles.regimeSelectHeader}>Select Your Preferred Tax Regime:</Text>
          <View style={styles.regimeRow}>
            {[
              {
                id: 'new',
                title: 'New Tax Regime (Default)',
                desc: `Tax: ${formatINR(comp.newRegime.totalTaxLiability)} (Std Ded ₹75k, Nil tax up to ₹7.75L)`,
              },
              {
                id: 'old',
                title: 'Old Tax Regime',
                desc: `Tax: ${formatINR(comp.oldRegime.totalTaxLiability)} (Claim 80C, 80D, HRA, Home Loan)`,
              },
            ].map((reg) => {
              const isSelected = (formData.selectedRegime || comp.recommendedRegime) === reg.id;
              const isRec = comp.recommendedRegime === reg.id;

              return (
                <TouchableOpacity
                  key={reg.id}
                  style={[styles.regimeCard, isSelected && styles.regimeCardSelected]}
                  onPress={() => handleSelectRegime(reg.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.regimeTitle, isSelected && styles.regimeTitleSelected]}>
                        {reg.title}
                      </Text>
                      {isRec && (
                        <View style={styles.recBadge}>
                          <Text style={styles.recBadgeText}>RECOMMENDED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.regimeDesc}>{reg.desc}</Text>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Chapter VI-A Deduction Inputs */}
        <Text style={styles.sectionHeader}>Chapter VI-A Investments & Deductions (Old Regime)</Text>

        <FormField
          label="Section 80C (PPF, ELSS, EPF, LIC, Tuition Fees) (Max ₹1.5L) (₹)"
          placeholder="150000"
          value={ded.sec80C ? String(ded.sec80C) : ''}
          onChangeText={(v) => handleDedChange('sec80C', v)}
          keyboardType="number-pad"
        />

        <FormField
          label="Section 80D (Health Insurance Premium for Self & Parents) (₹)"
          placeholder="25000"
          value={ded.sec80D ? String(ded.sec80D) : ''}
          onChangeText={(v) => handleDedChange('sec80D', v)}
          keyboardType="number-pad"
          helperText="Up to ₹25,000 for self/family and additional ₹50,000 for senior citizen parents"
        />

        <FormField
          label="Section 80CCD(1B) (National Pension Scheme - NPS) (Max ₹50,000) (₹)"
          placeholder="0"
          value={ded.sec80CCD1B ? String(ded.sec80CCD1B) : ''}
          onChangeText={(v) => handleDedChange('sec80CCD1B', v)}
          keyboardType="number-pad"
          helperText="Additional ₹50,000 deduction exclusively for Tier-1 NPS"
        />

        <FormField
          label="Section 80G (Donations to PM Relief Fund / Approved Trusts) (₹)"
          placeholder="0"
          value={ded.sec80G ? String(ded.sec80G) : ''}
          onChangeText={(v) => handleDedChange('sec80G', v)}
          keyboardType="number-pad"
        />
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
          <Text style={styles.btnNextText}>CONTINUE TO TDS & REFUND BANK →</Text>
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
  optimizerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  optimizerHeader: { marginBottom: 12 },
  optimizerTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primaryDark },
  savingsBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  savingsText: { fontSize: 11, fontWeight: '800', color: '#065F46' },
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  th: { fontSize: 11, fontWeight: '700', color: '#475569' },
  tr: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  trHighlight: { backgroundColor: '#F8FAFC' },
  tdLabel: { fontSize: 11, color: '#64748B' },
  tdVal: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  tdLabelBold: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  tdValBold: { fontSize: 11, fontWeight: '800', color: COLORS.primaryDark },
  regimeSelectHeader: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  regimeRow: { gap: 8 },
  regimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  regimeCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  regimeTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  regimeTitleSelected: { color: '#0369A1' },
  recBadge: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  recBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.white },
  regimeDesc: { fontSize: 10, color: '#64748B', marginTop: 2 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioSelected: { borderColor: '#0284C7' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#0284C7' },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
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
