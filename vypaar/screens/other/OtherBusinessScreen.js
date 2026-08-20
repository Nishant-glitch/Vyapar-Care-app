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
import OtherServicesStepper from '../../components/OtherServicesStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useOtherForm } from '../../contexts/OtherFormContext';
import { validateOtherBusiness } from '../../utils/otherServicesValidation';

export default function OtherBusinessScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateBusinessDetails } = useOtherForm();

  const [errors, setErrors] = useState({});
  const biz = formData.businessDetails || {};
  const applicantType = formData.applicantDetails?.applicantType || 'individual';

  const isIndividual =
    applicantType === 'individual' || applicantType === 'huf';

  const handleBizChange = (key, val) => {
    updateBusinessDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateOtherBusiness(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('OtherDocuments');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Business Profile (If Applicable)" />
      <OtherServicesStepper currentStep={4} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏢 Step 4: Business / Enterprise Information</Text>
          <Text style={styles.bannerSubtitle}>
            Provide commercial enterprise details if your consultation pertains to a business, firm or registered company.
          </Text>
        </View>

        {isIndividual && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Individual Applicant Notice:</Text>
            <Text style={styles.infoText}>
              You have selected Individual/Personal applicant type. Business fields below are optional and can be skipped if your requirement is personal.
            </Text>
          </View>
        )}

        <FormField
          label={`Enterprise / Business Name ${isIndividual ? '(Optional)' : '*'}`}
          placeholder="e.g. Acme Tech Solutions"
          value={biz.businessName}
          onChangeText={(v) => handleBizChange('businessName', v)}
          error={errors.businessName}
        />

        <FormField
          label="Nature of Activity / Industry"
          placeholder="e.g. Software Development / E-Commerce / Textile Trading"
          value={biz.businessActivity}
          onChangeText={(v) => handleBizChange('businessActivity', v)}
        />

        <FormField
          label="15-Digit GSTIN (if registered)"
          placeholder="07AAAAA0000A1Z5"
          value={biz.gstin}
          onChangeText={(v) => handleBizChange('gstin', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={15}
        />

        <FormField
          label="Business Address / Location"
          placeholder="e.g. Ground Floor, Sector 18, Noida"
          value={biz.address}
          onChangeText={(v) => handleBizChange('address', v)}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="City"
              placeholder="e.g. Noida"
              value={biz.city}
              onChangeText={(v) => handleBizChange('city', v)}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="PIN Code"
              placeholder="201301"
              value={biz.pinCode}
              onChangeText={(v) => handleBizChange('pinCode', v)}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* Turnover Range */}
        <Text style={styles.sectionHeader}>Annual Turnover Range (Approximate)</Text>
        <View style={styles.turnoverGrid}>
          {['Below ₹40 Lakhs', '₹40 Lakhs – ₹1.5 Crore', '₹1.5 Crore – ₹5 Crore', 'Above ₹5 Crore', 'Pre-revenue / Starting'].map((range) => {
            const isSel = biz.turnover === range;
            return (
              <TouchableOpacity
                key={range}
                style={[styles.turnoverChip, isSel && styles.turnoverChipSelected]}
                onPress={() => handleBizChange('turnover', range)}
              >
                <Text style={[styles.turnoverText, isSel && styles.turnoverTextSelected]}>
                  {isSel ? '✓ ' : '+ '}
                  {range}
                </Text>
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
          <Text style={styles.btnNextText}>PROCEED TO DOCUMENTS →</Text>
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
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 12, color: '#0284C7', lineHeight: 17 },
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  infoTitle: { fontSize: 11, fontWeight: '800', color: '#92400E' },
  infoText: { fontSize: 11, color: '#78350F', lineHeight: 15, marginTop: 2 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginTop: 10, marginBottom: 8 },
  turnoverGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  turnoverChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  turnoverChipSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  turnoverText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  turnoverTextSelected: { color: COLORS.white, fontWeight: '700' },
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
