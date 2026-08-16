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
import { validateITRHouseProperty } from '../../utils/itrValidation';

export default function ITRHousePropertyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateIncomeDetails } = useITRForm();
  const [errors, setErrors] = useState({});

  const inc = formData.incomeDetails || {};
  const sources = formData.incomeSources || {};

  const handleIncChange = (key, val) => {
    const num = val.replace(/[^0-9]/g, '');
    updateIncomeDetails({ [key]: num === '' ? 0 : Number(num) });
  };

  const handleNext = () => {
    const errs = validateITRHouseProperty(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (sources.business || sources.profession) {
      navigation.navigate('ITRBusiness');
    } else if (sources.capitalGains || sources.otherSources || sources.agriculture || sources.foreignIncome) {
      navigation.navigate('ITRCapitalGains');
    } else {
      navigation.navigate('ITRDeductions');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Income from House Property" />
      <ITRStepper currentStep={4} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏠 Step 4: House Property & Home Loan</Text>
          <Text style={styles.bannerSubtitle}>
            Declare rental income and claim Section 24(b) interest deduction on housing loan.
          </Text>
        </View>

        {/* Property Type Radio */}
        <Text style={styles.sectionHeader}>Type of House Property</Text>
        <View style={styles.typeRow}>
          {[
            { id: 'self_occupied', label: 'Self-Occupied (Living in own house)', icon: '🏡' },
            { id: 'let_out', label: 'Let-Out (Rented to Tenant)', icon: '🔑' },
          ].map((item) => {
            const isSelected = (inc.hpType || 'self_occupied') === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                onPress={() => updateIncomeDetails({ hpType: item.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>{item.icon}</Text>
                <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FormField
          label="Property Address *"
          placeholder="e.g. Flat 101, Palm Grove, Sector 62, Noida"
          value={inc.hpAddress}
          onChangeText={(v) => {
            updateIncomeDetails({ hpAddress: v });
            if (errors.hpAddress) setErrors((prev) => ({ ...prev, hpAddress: null }));
          }}
          error={errors.hpAddress}
        />

        {inc.hpType === 'let_out' && (
          <View>
            <FormField
              label="Gross Annual Rent Received (₹)"
              placeholder="e.g. 240000"
              value={inc.hpGrossRent ? String(inc.hpGrossRent) : ''}
              onChangeText={(v) => handleIncChange('hpGrossRent', v)}
              keyboardType="number-pad"
              helperText="Total rent collected from tenant in financial year"
            />

            <FormField
              label="Municipal / Property Taxes Paid to Local Authority (₹)"
              placeholder="12000"
              value={inc.hpMunicipalTax ? String(inc.hpMunicipalTax) : ''}
              onChangeText={(v) => handleIncChange('hpMunicipalTax', v)}
              keyboardType="number-pad"
              helperText="Deductible only if actually paid during the year"
            />
          </View>
        )}

        <FormField
          label="Interest on Housing Loan u/s 24(b) (₹)"
          placeholder="e.g. 180000"
          value={inc.hpHomeLoanInterest ? String(inc.hpHomeLoanInterest) : ''}
          onChangeText={(v) => handleIncChange('hpHomeLoanInterest', v)}
          keyboardType="number-pad"
          helperText="Max deduction up to ₹2,00,000 for self-occupied property (as per loan certificate)"
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📌 Statutory 30% Standard Deduction:</Text>
          <Text style={styles.infoDesc}>
            For let-out property, a standard deduction of 30% under Section 24(a) is automatically computed on Net Annual Value for maintenance & repairs.
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  typeRow: { gap: 8, marginBottom: 14 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  typeCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  typeIcon: { fontSize: 20, marginRight: 10 },
  typeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, flex: 1 },
  typeLabelSelected: { color: '#0369A1', fontWeight: '700' },
  infoCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 10,
  },
  infoTitle: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  infoDesc: { fontSize: 11, color: '#78350F', lineHeight: 16 },
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
