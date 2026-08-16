import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { validateGSTBusinessDetails } from '../../utils/gstValidation';

export default function GSTBusinessDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateBusinessDetails } = useGSTForm();
  const [errors, setErrors] = useState({});

  const details = formData.businessDetails || {};

  const handleChange = (key, value) => {
    updateBusinessDetails({ [key]: value });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateGSTBusinessDetails(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('GSTPromoters');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Business Details" />
      <GSTStepper currentStep={2} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📋 Step 2: Legal & Trade Business Information</Text>
          <Text style={styles.bannerSubtitle}>
            Enter legal name matching Income Tax PAN records and date of commencement.
          </Text>
        </View>

        <FormField
          label="Legal Name of Business (as per PAN) *"
          placeholder="e.g. Ramesh Kumar / Nexus Retail Pvt Ltd"
          value={details.legalName}
          onChangeText={(v) => handleChange('legalName', v)}
          error={errors.legalName}
        />

        <FormField
          label="Trade Name (Signboard / Brand / Outlet Name) *"
          placeholder="e.g. Nexus Super Store"
          value={details.tradeName}
          onChangeText={(v) => handleChange('tradeName', v)}
          error={errors.tradeName}
          helperText="The name that appears on customer tax invoices and store signboard"
        />

        <FormField
          label="Permanent Account Number (PAN) *"
          placeholder="ABCDE1234F"
          value={details.pan}
          onChangeText={(v) => handleChange('pan', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
          error={errors.pan}
          helperText="Proprietor PAN for Proprietorship, or Entity PAN for Firm/Company"
        />

        <FormField
          label="Date of Commencement of Business (YYYY-MM-DD) *"
          placeholder="2026-01-15"
          value={details.commencementDate}
          onChangeText={(v) => handleChange('commencementDate', v)}
          error={errors.commencementDate}
        />

        <View style={styles.divider} />
        <Text style={styles.sectionHeader}>Existing Registrations (Optional)</Text>

        <FormField
          label="MSME / Udyam Registration Number"
          placeholder="UDYAM-DL-01-0012345"
          value={details.udyamNumber}
          onChangeText={(v) => handleChange('udyamNumber', v.toUpperCase())}
        />

        <FormField
          label="Import Export Code (IEC) if applicable"
          placeholder="0512345678"
          value={details.iecNumber}
          onChangeText={(v) => handleChange('iecNumber', v.toUpperCase())}
          maxLength={10}
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
          <Text style={styles.btnNextText}>CONTINUE TO PROMOTERS →</Text>
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
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#2563EB', lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 18 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 12,
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
