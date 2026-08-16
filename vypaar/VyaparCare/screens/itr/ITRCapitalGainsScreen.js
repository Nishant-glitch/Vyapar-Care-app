import React from 'react';
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

export default function ITRCapitalGainsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateIncomeDetails } = useITRForm();

  const inc = formData.incomeDetails || {};
  const sources = formData.incomeSources || {};

  const handleIncChange = (key, val) => {
    const num = val.replace(/[^0-9]/g, '');
    updateIncomeDetails({ [key]: num === '' ? 0 : Number(num) });
  };

  const handleNext = () => {
    navigation.navigate('ITRDeductions');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Capital Gains & Other Income" />
      <ITRStepper currentStep={6} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📈 Step 6: Capital Gains, Interest & Other Income</Text>
          <Text style={styles.bannerSubtitle}>
            Declare profits from stock market, mutual funds, crypto, savings bank interest and dividends.
          </Text>
        </View>

        {/* Capital Gains Fields */}
        {sources.capitalGains && (
          <View>
            <Text style={styles.sectionHeader}>Capital Gains (Shares, MFs, Real Estate, Crypto)</Text>

            <FormField
              label="Short-Term Capital Gains (STCG) (₹)"
              placeholder="0"
              value={inc.stcg ? String(inc.stcg) : ''}
              onChangeText={(v) => handleIncChange('stcg', v)}
              keyboardType="number-pad"
              helperText="Equity shares/equity MFs held <= 12 months (taxed @ 15% / 20%)"
            />

            <FormField
              label="Long-Term Capital Gains (LTCG) (₹)"
              placeholder="0"
              value={inc.ltcg ? String(inc.ltcg) : ''}
              onChangeText={(v) => handleIncChange('ltcg', v)}
              keyboardType="number-pad"
              helperText="Equity shares/MFs held > 12 months (taxed @ 10% / 12.5% after ₹1.25L exemption)"
            />

            <FormField
              label="Gains from Crypto / Virtual Digital Assets (VDA) (₹)"
              placeholder="0"
              value={inc.vdaCryptoGain ? String(inc.vdaCryptoGain) : ''}
              onChangeText={(v) => handleIncChange('vdaCryptoGain', v)}
              keyboardType="number-pad"
              helperText="Flat 30% tax under Section 115BBH (No loss set-off permitted)"
            />

            <View style={styles.divider} />
          </View>
        )}

        {/* Other Sources Fields */}
        <Text style={styles.sectionHeader}>Income from Other Sources (Interest & Dividends)</Text>

        <FormField
          label="Savings Bank Interest Received (₹) *"
          placeholder="12000"
          value={inc.savingsInterest ? String(inc.savingsInterest) : ''}
          onChangeText={(v) => handleIncChange('savingsInterest', v)}
          keyboardType="number-pad"
          helperText="Eligible for deduction up to ₹10,000 u/s 80TTA (under Old Regime)"
        />

        <FormField
          label="Fixed Deposit (FD) / Recurring Deposit (RD) Interest (₹)"
          placeholder="0"
          value={inc.fdInterest ? String(inc.fdInterest) : ''}
          onChangeText={(v) => handleIncChange('fdInterest', v)}
          keyboardType="number-pad"
          helperText="As reflected in Form 26AS / AIS from banks"
        />

        <FormField
          label="Dividend Income from Indian Companies / MFs (₹)"
          placeholder="0"
          value={inc.dividendIncome ? String(inc.dividendIncome) : ''}
          onChangeText={(v) => handleIncChange('dividendIncome', v)}
          keyboardType="number-pad"
        />

        <FormField
          label="Any Other Miscellaneous Income (₹)"
          placeholder="0"
          value={inc.otherIncomeAmt ? String(inc.otherIncomeAmt) : ''}
          onChangeText={(v) => handleIncChange('otherIncomeAmt', v)}
          keyboardType="number-pad"
          helperText="Family pension, commission, gifts or other taxable receipts"
        />

        {/* Agricultural Income */}
        {sources.agriculture && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>Agricultural Income</Text>
            <FormField
              label="Net Agricultural Income (₹)"
              placeholder="0"
              value={inc.agriculturalIncome ? String(inc.agriculturalIncome) : ''}
              onChangeText={(v) => handleIncChange('agriculturalIncome', v)}
              keyboardType="number-pad"
              helperText="Exempt from tax, but used for rate integration if exceeding ₹5,000"
            />
          </View>
        )}

        {/* Foreign Income */}
        {sources.foreignIncome && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>Foreign Income & Foreign Assets</Text>
            <FormField
              label="Foreign Country Name"
              placeholder="e.g. United States / United Kingdom"
              value={inc.foreignCountry}
              onChangeText={(v) => updateIncomeDetails({ foreignCountry: v })}
            />
            <FormField
              label="Foreign Income in INR (₹)"
              placeholder="0"
              value={inc.foreignIncomeAmt ? String(inc.foreignIncomeAmt) : ''}
              onChangeText={(v) => handleIncChange('foreignIncomeAmt', v)}
              keyboardType="number-pad"
            />
          </View>
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
          <Text style={styles.btnNextText}>CONTINUE TO DEDUCTIONS & REGIME →</Text>
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
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
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
