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
import { validateUdyamBank } from '../../utils/udyamValidation';

export default function UdyamBankScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateBankDetails } = useUdyamForm();
  const [errors, setErrors] = useState({});

  const bank = formData.bankDetails || {};

  const handleChange = (key, val) => {
    updateBankDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateUdyamBank(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('UdyamNIC');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Bank Account Details" />
      <UdyamStepper currentStep={7} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏦 Step 7: Bank Details for MSME Benefits</Text>
          <Text style={styles.bannerSubtitle}>
            Mandatory for government subsidies, priority sector lending (PSL) and direct DBT transfers under MSMED Act.
          </Text>
        </View>

        <FormField
          label="Bank Name *"
          placeholder="e.g. State Bank of India / HDFC Bank"
          value={bank.bankName}
          onChangeText={(v) => handleChange('bankName', v)}
          error={errors.bankName}
        />

        <FormField
          label="Account Holder Name (as per Bank Records) *"
          placeholder="e.g. Ramesh Kumar / Apex Innovations"
          value={bank.accountHolderName}
          onChangeText={(v) => handleChange('accountHolderName', v)}
          error={errors.accountHolderName}
        />

        <FormField
          label="Bank Account Number *"
          placeholder="50200012345678"
          value={bank.accountNumber}
          onChangeText={(v) => handleChange('accountNumber', v)}
          keyboardType="number-pad"
          error={errors.accountNumber}
        />

        <FormField
          label="IFSC Code (11 Characters) *"
          placeholder="SBIN0001234 / HDFC0000050"
          value={bank.ifsc}
          onChangeText={(v) => handleChange('ifsc', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={11}
          error={errors.ifsc}
        />

        <Text style={styles.sectionHeader}>Account Type</Text>
        <View style={styles.typeRow}>
          {['Current', 'Savings', 'OD / CC'].map((type) => {
            const isSelected = (bank.accountType || '').toLowerCase() === type.toLowerCase();
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typeBtn, isSelected && styles.typeBtnSelected]}
                onPress={() => handleChange('accountType', type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.typeBtnText, isSelected && styles.typeBtnTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Paperless Verification</Text>
          <Text style={styles.infoDesc}>
            No physical cheque upload is mandatory for government filing. Your bank account is verified electronically via PFMS.
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
          <Text style={styles.btnNextText}>CONTINUE TO NIC CODES →</Text>
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
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#0284C7', lineHeight: 18 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
    marginTop: 10,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  typeBtnSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  typeBtnText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  typeBtnTextSelected: { color: '#0369A1', fontWeight: '700' },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 2 },
  infoDesc: { fontSize: 11, color: '#64748B', lineHeight: 15 },
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
