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
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { validateGSTBankDetails } from '../../utils/gstValidation';

export default function GSTBankDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateBankDetails } = useGSTForm();
  const [errors, setErrors] = useState({});

  const details = formData.bankDetails || {};

  const handleChange = (field, val) => {
    updateBankDetails({ [field]: val });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateGSTBankDetails(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('GSTDocuments');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Bank Account Details" />
      <GSTStepper currentStep={6} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏦 Step 6: Bank Account Information</Text>
          <Text style={styles.bannerSubtitle}>
            Mandatory bank account proof (Rule 10A of CGST Rules) for government refunds and ITC reconciliation.
          </Text>
        </View>

        {/* Account Type Selector */}
        <Text style={styles.sectionHeader}>Account Type *</Text>
        <View style={styles.typeRow}>
          {['Current', 'Savings', 'Cash Credit / OD'].map((type) => {
            const isSelected = details.accountType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                onPress={() => handleChange('accountType', type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typeText,
                    isSelected && styles.typeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FormField
          label="Bank Account Number *"
          placeholder="e.g. 50200012345678"
          value={details.accountNumber}
          onChangeText={(v) => handleChange('accountNumber', v)}
          keyboardType="number-pad"
          error={errors.accountNumber}
        />

        <FormField
          label="IFSC Code (11 Digits) *"
          placeholder="SBIN0001234 / HDFC0000050"
          value={details.ifsc}
          onChangeText={(v) => handleChange('ifsc', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={11}
          error={errors.ifsc}
        />

        <FormField
          label="Bank Name *"
          placeholder="e.g. State Bank of India / HDFC Bank"
          value={details.bankName}
          onChangeText={(v) => handleChange('bankName', v)}
          error={errors.bankName}
        />

        <FormField
          label="Branch Name / Location"
          placeholder="e.g. Connaught Place, New Delhi"
          value={details.branch}
          onChangeText={(v) => handleChange('branch', v)}
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
          <Text style={styles.btnNextText}>CONTINUE TO DOCUMENTS →</Text>
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
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#15803D', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#16A34A', lineHeight: 18 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  typeCardSelected: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  typeText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  typeTextSelected: { color: '#065F46', fontWeight: '700' },
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
