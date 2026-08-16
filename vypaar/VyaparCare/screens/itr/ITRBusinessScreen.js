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
import { validateITRBusiness } from '../../utils/itrValidation';

export default function ITRBusinessScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateIncomeDetails } = useITRForm();
  const [errors, setErrors] = useState({});

  const inc = formData.incomeDetails || {};
  const sources = formData.incomeSources || {};

  const handleIncChange = (key, val) => {
    const num = val.replace(/[^0-9]/g, '');
    updateIncomeDetails({ [key]: num === '' ? 0 : Number(num) });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateITRBusiness(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (sources.capitalGains || sources.otherSources || sources.agriculture || sources.foreignIncome) {
      navigation.navigate('ITRCapitalGains');
    } else {
      navigation.navigate('ITRDeductions');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Business & Professional Income" />
      <ITRStepper currentStep={5} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏭 Step 5: Business & Profession Details</Text>
          <Text style={styles.bannerSubtitle}>
            Declare business turnover, professional fees, or opt for Section 44AD/44ADA presumptive taxation.
          </Text>
        </View>

        <FormField
          label="Business / Practice Name *"
          placeholder="e.g. Apex Global Solutions / Dr. Sharma Clinic"
          value={inc.businessName}
          onChangeText={(v) => {
            updateIncomeDetails({ businessName: v });
            if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: null }));
          }}
          error={errors.businessName}
        />

        <FormField
          label="GSTIN (If Registered)"
          placeholder="07AAAAA0000A1Z5"
          value={inc.gstin}
          onChangeText={(v) => updateIncomeDetails({ gstin: v.toUpperCase() })}
          autoCapitalize="characters"
          maxLength={15}
        />

        {/* Presumptive Scheme Option */}
        <Text style={styles.sectionHeader}>Taxation Scheme</Text>
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceCard, inc.isPresumptive && styles.choiceCardSelected]}
            onPress={() => updateIncomeDetails({ isPresumptive: true })}
            activeOpacity={0.7}
          >
            <Text style={[styles.choiceTitle, inc.isPresumptive && styles.choiceTitleSelected]}>
              ⚡ Presumptive Taxation (Sec 44AD / 44ADA)
            </Text>
            <Text style={styles.choiceDesc}>
              No books of accounts needed. Min 6%/8% profit for business (44AD) or 50% profit for professionals (44ADA). Uses ITR-4 (Sugam).
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceCard, !inc.isPresumptive && styles.choiceCardSelected]}
            onPress={() => updateIncomeDetails({ isPresumptive: false })}
            activeOpacity={0.7}
          >
            <Text style={[styles.choiceTitle, !inc.isPresumptive && styles.choiceTitleSelected]}>
              📊 Regular P&L & Balance Sheet
            </Text>
            <Text style={styles.choiceDesc}>
              Maintains regular accounting books, registers expenses and depreciation. Uses ITR-3 / ITR-5 / ITR-6.
            </Text>
          </TouchableOpacity>
        </View>

        <FormField
          label="Gross Annual Turnover / Gross Receipts (₹)"
          placeholder="e.g. 4500000"
          value={inc.businessTurnover ? String(inc.businessTurnover) : ''}
          onChangeText={(v) => handleIncChange('businessTurnover', v)}
          keyboardType="number-pad"
          helperText="Total sales or gross receipts collected during the financial year"
        />

        {sources.business && (
          <FormField
            label="Net Profit from Business (₹) *"
            placeholder="e.g. 500000"
            value={inc.businessProfit ? String(inc.businessProfit) : ''}
            onChangeText={(v) => handleIncChange('businessProfit', v)}
            keyboardType="number-pad"
            error={errors.businessProfit}
            helperText="Net taxable income after deductible business expenses"
          />
        )}

        {sources.profession && (
          <FormField
            label="Net Profit from Profession / Freelance (₹) *"
            placeholder="e.g. 350000"
            value={inc.professionProfit ? String(inc.professionProfit) : ''}
            onChangeText={(v) => handleIncChange('professionProfit', v)}
            keyboardType="number-pad"
            error={errors.professionProfit}
            helperText="For freelancers, doctors, lawyers, consultants, software engineers"
          />
        )}
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  choiceRow: { gap: 10, marginBottom: 14 },
  choiceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  choiceCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  choiceTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  choiceTitleSelected: { color: '#0369A1' },
  choiceDesc: { fontSize: 11, color: '#64748B', lineHeight: 16 },
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
