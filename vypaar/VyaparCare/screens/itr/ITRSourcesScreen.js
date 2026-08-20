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
import ITRStepper from '../../components/ITRStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { ITR_FORMS_INFO } from '../../config/itrConfig';
import { COLORS } from '../../constants/theme';
import { useITRForm } from '../../contexts/ITRFormContext';

const INCOME_SOURCE_OPTIONS = [
  { id: 'salary', label: 'Salary / Pension Income (Form 16)', icon: '💼', desc: 'Salaried employees, directors with salary, pensioners' },
  { id: 'houseProperty', label: 'House Property (Rental / Home Loan Interest)', icon: '🏠', desc: 'Rental income or Section 24b home loan interest' },
  { id: 'business', label: 'Business Income (Proprietorship / Trader / Manufacturer)', icon: '🏭', desc: 'Wholesale, retail, manufacturing or service business' },
  { id: 'profession', label: 'Professional / Freelance Income (Doctor, CA, IT, Lawyer)', icon: '💻', desc: 'Consultancy, freelancing or professional services' },
  { id: 'capitalGains', label: 'Capital Gains (Shares, Mutual Funds, Property, Crypto)', icon: '📈', desc: 'STCG / LTCG from stock market, real estate, gold or VDA' },
  { id: 'otherSources', label: 'Other Sources (Savings Interest, FD, Dividend)', icon: '🏦', desc: 'Bank interest, fixed deposits, dividends, family pension' },
  { id: 'agriculture', label: 'Agricultural Income', icon: '🌾', desc: 'Income from agricultural operations or farmland' },
  { id: 'foreignIncome', label: 'Foreign Income / Foreign Bank Accounts / Assets', icon: '🌐', desc: 'Foreign shares (RSU/ESOP), foreign salary or offshore assets' },
];

export default function ITRSourcesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, toggleIncomeSource, recommendedITR } = useITRForm();

  const sources = formData.incomeSources || {};
  const formInfo = ITR_FORMS_INFO[recommendedITR.recommendedForm] || {};

  const handleNext = () => {
    if (sources.salary) {
      navigation.navigate('ITRSalary');
    } else if (sources.houseProperty) {
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
      <ScreenHeader title="Income Sources & ITR Recommendation" />
      <ITRStepper currentStep={2} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>💡 Step 2: Income Sources & ITR Selection</Text>
          <Text style={styles.bannerSubtitle}>
            Select all heads of income applicable to you. Our compliance engine will automatically evaluate the correct ITR form.
          </Text>
        </View>

        {/* Live Recommendation Badge */}
        <View style={styles.recommendCard}>
          <View style={styles.recommendTop}>
            <Text style={styles.recommendBadgeLabel}>OFFICIAL ITR FORM RECOMMENDATION</Text>
            <View style={styles.badgeForm}>
              <Text style={styles.badgeFormText}>{recommendedITR.recommendedForm}</Text>
            </View>
          </View>
          <Text style={styles.formTitle}>
            {formInfo.name ? `${recommendedITR.recommendedForm} (${formInfo.name})` : recommendedITR.recommendedForm}
          </Text>
          <Text style={styles.formDesc}>{formInfo.desc || recommendedITR.reason}</Text>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>
              <Text style={{ fontWeight: '700' }}>Reason:</Text> {recommendedITR.reason}
            </Text>
          </View>
        </View>

        {/* Multi-Select Income Sources */}
        <Text style={styles.sectionHeader}>What Sources of Income Do You Have? *</Text>

        <View style={styles.sourcesList}>
          {INCOME_SOURCE_OPTIONS.map((item) => {
            const isSelected = !!sources[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.sourceItem, isSelected && styles.sourceItemSelected]}
                onPress={() => toggleIncomeSource(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.sourceIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sourceTitle, isSelected && styles.sourceTitleSelected]}>
                    {item.label}
                  </Text>
                  <Text style={styles.sourceDesc}>{item.desc}</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
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
          <Text style={styles.btnNextText}>CONTINUE TO INCOME DETAILS →</Text>
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
  recommendCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginBottom: 18,
  },
  recommendTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recommendBadgeLabel: { fontSize: 10, fontWeight: '800', color: '#065F46', letterSpacing: 0.5 },
  badgeForm: { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeFormText: { fontSize: 12, fontWeight: '800', color: COLORS.white },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#065F46', marginBottom: 4 },
  formDesc: { fontSize: 11, color: '#047857', lineHeight: 15, marginBottom: 10 },
  reasonBox: { backgroundColor: '#DCFCE7', borderRadius: 8, padding: 10 },
  reasonText: { fontSize: 11, color: '#166534', lineHeight: 15 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  sourcesList: { gap: 10 },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sourceItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  sourceIcon: { fontSize: 24, marginRight: 12 },
  sourceTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  sourceTitleSelected: { color: '#0369A1' },
  sourceDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxChecked: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  checkMark: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
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
