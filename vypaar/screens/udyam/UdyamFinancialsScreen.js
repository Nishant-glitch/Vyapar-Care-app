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
import ScreenHeader from '../../components/ScreenHeader';
import UdyamStepper from '../../components/UdyamStepper';
import { COLORS } from '../../constants/theme';
import { useUdyamForm } from '../../contexts/UdyamFormContext';
import { formatINR } from '../../utils/currency';
import { validateUdyamFinancials } from '../../utils/udyamValidation';

export default function UdyamFinancialsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateFinancialDetails, msmeCategory } = useUdyamForm();
  const [errors, setErrors] = useState({});

  const fin = formData.financialDetails || {};

  const handleChange = (key, val) => {
    const numeric = val.replace(/[^0-9]/g, '');
    updateFinancialDetails({ [key]: numeric === '' ? '' : Number(numeric) });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateUdyamFinancials(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('UdyamReview');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Investment & Turnover" />
      <UdyamStepper currentStep={9} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📊 Step 9: Investment, Turnover & Classification</Text>
          <Text style={styles.bannerSubtitle}>
            MSME classification is automatically computed under the revised 2025 guidelines.
          </Text>
        </View>

        {/* Dynamic Category Card */}
        <View
          style={[
            styles.categoryCard,
            msmeCategory.isEligible ? styles.categoryCardEligible : styles.categoryCardIneligible,
          ]}
        >
          <View style={styles.categoryTop}>
            <Text style={styles.categoryBadgeLabel}>YOUR CALCULATED MSME CATEGORY</Text>
            <View style={styles.dateTag}>
              <Text style={styles.dateTagText}>Limits as of 1 April 2025</Text>
            </View>
          </View>

          <Text style={styles.categoryTitle}>{msmeCategory.categoryLabel}</Text>
          <Text style={styles.categoryReason}>{msmeCategory.reason}</Text>

          <View style={styles.metricRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Plant & Machinery</Text>
              <Text style={styles.metricVal}>
                {formatINR(fin.investmentAmount || 0)}
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Turnover (Excl. Export)</Text>
              <Text style={styles.metricVal}>
                {formatINR(msmeCategory.turnoverConsidered || 0)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <FormField
            label="Investment in Plant & Machinery / Equipment (₹) *"
            placeholder="e.g. 500000 (5 Lakhs)"
            value={fin.investmentAmount ? String(fin.investmentAmount) : ''}
            onChangeText={(v) => handleChange('investmentAmount', v)}
            keyboardType="number-pad"
            error={errors.investmentAmount}
            helperText="Depreciated Written Down Value (WDV) as on 31st March (excluding land & building)"
          />

          <FormField
            label="Annual Domestic Turnover (₹) *"
            placeholder="e.g. 2000000 (20 Lakhs)"
            value={fin.domesticTurnover ? String(fin.domesticTurnover) : ''}
            onChangeText={(v) => handleChange('domesticTurnover', v)}
            keyboardType="number-pad"
            error={errors.domesticTurnover}
            helperText="Gross sales / service receipts within India"
          />

          <FormField
            label="Export Turnover (₹) (If any)"
            placeholder="0"
            value={fin.exportTurnover ? String(fin.exportTurnover) : ''}
            onChangeText={(v) => handleChange('exportTurnover', v)}
            keyboardType="number-pad"
            helperText="⭐ Export turnover is completely EXCLUDED from turnover limits as per MSME Act"
          />
        </View>

        {/* Classification Criteria Box */}
        <View style={styles.criteriaBox}>
          <Text style={styles.criteriaTitle}>📌 Official MSME Criteria (Effective 1 April 2025):</Text>
          <View style={styles.criteriaItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.criteriaText}>
              <Text style={{ fontWeight: '700' }}>Micro:</Text> Investment ≤ ₹2.5 Cr & Turnover ≤ ₹10 Cr
            </Text>
          </View>
          <View style={styles.criteriaItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.criteriaText}>
              <Text style={{ fontWeight: '700' }}>Small:</Text> Investment ≤ ₹25 Cr & Turnover ≤ ₹100 Cr
            </Text>
          </View>
          <View style={styles.criteriaItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.criteriaText}>
              <Text style={{ fontWeight: '700' }}>Medium:</Text> Investment ≤ ₹125 Cr & Turnover ≤ ₹500 Cr
            </Text>
          </View>
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
          <Text style={styles.btnNextText}>CONTINUE TO REVIEW & DECLARATION →</Text>
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
  categoryCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1.5,
  },
  categoryCardEligible: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  categoryCardIneligible: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  dateTag: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  dateTagText: { fontSize: 9, fontWeight: '700', color: '#065F46' },
  categoryTitle: { fontSize: 20, fontWeight: '800', color: '#065F46', marginBottom: 4 },
  categoryReason: { fontSize: 11, color: '#047857', lineHeight: 15, marginBottom: 12 },
  metricRow: { flexDirection: 'row', gap: 10 },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: { fontSize: 10, color: '#64748B', marginBottom: 2 },
  metricVal: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  formSection: { marginTop: 4 },
  criteriaBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 10,
  },
  criteriaTitle: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  criteriaItem: { flexDirection: 'row', marginBottom: 4 },
  bullet: { fontSize: 13, color: '#92400E', marginRight: 6 },
  criteriaText: { fontSize: 11, color: '#78350F', flex: 1, lineHeight: 15 },
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
