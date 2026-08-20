import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import ITRStepper from '../../components/ITRStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useITRForm } from '../../contexts/ITRFormContext';
import { validateITRSalary } from '../../utils/itrValidation';

export default function ITRSalaryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateIncomeDetails, updateTaxPaid } = useITRForm();
  const [errors, setErrors] = useState({});

  const inc = formData.incomeDetails || {};
  const tax = formData.taxPaid || {};
  const sources = formData.incomeSources || {};

  const handleIncChange = (key, val) => {
    const num = val.replace(/[^0-9]/g, '');
    updateIncomeDetails({ [key]: num === '' ? '' : Number(num) });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateITRSalary(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (sources.houseProperty) {
      navigation.navigate('ITRHouseProperty');
    } else if (sources.business || sources.profession) {
      navigation.navigate('ITRBusiness');
    } else if (sources.capitalGains || sources.otherSources || sources.agriculture || sources.foreignIncome) {
      navigation.navigate('ITRCapitalGains');
    } else {
      navigation.navigate('ITRDeductions');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Salary & Pension Income" />
      <ITRStepper currentStep={3} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>💼 Step 3: Salary Income & Form 16 Details</Text>
          <Text style={styles.bannerSubtitle}>
            Enter salary income details as shown in Part B of Form 16 issued by your employer.
          </Text>
        </View>

        <FormField
          label="Employer Name *"
          placeholder="e.g. Infosys Ltd / Tech Solutions Pvt Ltd"
          value={inc.employerName}
          onChangeText={(v) => {
            updateIncomeDetails({ employerName: v });
            if (errors.employerName) setErrors((prev) => ({ ...prev, employerName: null }));
          }}
          error={errors.employerName}
        />

        <FormField
          label="Employer TAN (Optional)"
          placeholder="DELT01234F"
          value={inc.employerTAN}
          onChangeText={(v) => updateIncomeDetails({ employerTAN: v.toUpperCase() })}
          autoCapitalize="characters"
          maxLength={10}
          helperText="As mentioned on Part A of Form 16"
        />

        <FormField
          label="Gross Salary (₹) (As per Form 16 Section 17(1)) *"
          placeholder="850000"
          value={inc.salaryGross ? String(inc.salaryGross) : ''}
          onChangeText={(v) => handleIncChange('salaryGross', v)}
          keyboardType="number-pad"
          error={errors.salaryGross}
          helperText="Salary before exemptions and standard deductions"
        />

        <FormField
          label="Exempt Allowances (HRA, LTA, Conveyance u/s 10) (₹)"
          placeholder="0"
          value={inc.salaryAllowancesExempt ? String(inc.salaryAllowancesExempt) : ''}
          onChangeText={(v) => handleIncChange('salaryAllowancesExempt', v)}
          keyboardType="number-pad"
          helperText="Applicable if opting for Old Tax Regime"
        />

        <FormField
          label="Professional Tax Paid (₹)"
          placeholder="2400"
          value={inc.salaryProfTax ? String(inc.salaryProfTax) : ''}
          onChangeText={(v) => handleIncChange('salaryProfTax', v)}
          keyboardType="number-pad"
          helperText="Deducted by state government (usually ₹2,400 to ₹2,500/year)"
        />

        <FormField
          label="TDS Deducted by Employer on Salary (₹)"
          placeholder="35000"
          value={tax.tdsSalary ? String(tax.tdsSalary) : ''}
          onChangeText={(v) => {
            const num = v.replace(/[^0-9]/g, '');
            updateTaxPaid({ tdsSalary: num === '' ? 0 : Number(num) });
          }}
          keyboardType="number-pad"
          helperText="Total tax deposited by employer (reconciled with Form 26AS)"
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📌 Automatic Standard Deduction:</Text>
          <Text style={styles.infoDesc}>
            Standard deduction of <Text style={{ fontWeight: '700' }}>₹75,000</Text> under New Tax Regime (or ₹50,000 under Old Regime) will be applied automatically by our tax engine.
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
          style={({ pressed }) => [styles.btnNext, pressed && styles.btnPressed]}
          onPress={handleNext}
        >
          <Text style={styles.btnNextText}>CONTINUE →</Text>
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
  infoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 10,
  },
  infoTitle: { fontSize: 12, fontWeight: '700', color: '#15803D', marginBottom: 4 },
  infoDesc: { fontSize: 11, color: '#166534', lineHeight: 16 },
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
