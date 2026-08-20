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
import { OTHER_APPLICANT_TYPES } from '../../config/otherServicesConfig';
import { COLORS } from '../../constants/theme';
import { useOtherForm } from '../../contexts/OtherFormContext';
import { validateOtherApplicant } from '../../utils/otherServicesValidation';

export default function OtherApplicantScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateApplicantDetails } = useOtherForm();

  const [errors, setErrors] = useState({});
  const app = formData.applicantDetails || {};

  const handleAppChange = (key, val) => {
    updateApplicantDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateOtherApplicant(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('OtherRequirement');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Applicant Information" />
      <OtherServicesStepper currentStep={2} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>👤 Step 2: Applicant Identity & Constitution</Text>
          <Text style={styles.bannerSubtitle}>
            Tell us who is applying. We only ask for information strictly required for legal representation and consultation.
          </Text>
        </View>

        {/* Selected Service Badge */}
        <View style={styles.selectedServiceBadge}>
          <Text style={styles.selectedServiceLabel}>Selected Service / Request:</Text>
          <Text style={styles.selectedServiceName}>
            {formData.isUncertainService
              ? '✨ Custom Requirement / Consultation'
              : `${formData.selectedService?.categoryName || 'Service'} → ${formData.selectedService?.name || 'Selected'}`}
          </Text>
        </View>

        {/* 10 Applicant Types */}
        <Text style={styles.sectionHeader}>What type of applicant are you? *</Text>
        <View style={styles.typesGrid}>
          {OTHER_APPLICANT_TYPES.map((type) => {
            const isSel = (app.applicantType || 'individual') === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeChip, isSel && styles.typeChipSelected]}
                onPress={() => handleAppChange('applicantType', type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeText, isSel && styles.typeTextSelected]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        <FormField
          label="Applicant Full Name *"
          placeholder="e.g. Rahul Sharma"
          value={app.fullName}
          onChangeText={(v) => handleAppChange('fullName', v)}
          error={errors.fullName}
        />

        <FormField
          label="Mobile Number *"
          placeholder="9876543210"
          value={app.mobile}
          onChangeText={(v) => handleAppChange('mobile', v)}
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.mobile}
          helperText="For consultation updates and expert communication"
        />

        <FormField
          label="Email Address *"
          placeholder="rahul@example.com"
          value={app.email}
          onChangeText={(v) => handleAppChange('email', v.toLowerCase())}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="PAN Number (Optional)"
              placeholder="ABCDE1234F"
              value={app.pan}
              onChangeText={(v) => handleAppChange('pan', v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              error={errors.pan}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="Aadhaar No. (Optional)"
              placeholder="12-digit Aadhaar"
              value={app.aadhaar}
              onChangeText={(v) => handleAppChange('aadhaar', v)}
              keyboardType="number-pad"
              maxLength={12}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="City / Town"
              placeholder="e.g. New Delhi"
              value={app.city}
              onChangeText={(v) => handleAppChange('city', v)}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="PIN Code"
              placeholder="110020"
              value={app.pinCode}
              onChangeText={(v) => handleAppChange('pinCode', v)}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pinCode}
            />
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
          <Text style={styles.btnNextText}>SAVE & CONTINUE →</Text>
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
  selectedServiceBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  selectedServiceLabel: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  selectedServiceName: { fontSize: 13, fontWeight: '800', color: '#B45309', marginTop: 2 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  typeChipSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  typeIcon: { fontSize: 13, marginRight: 6 },
  typeText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  typeTextSelected: { color: COLORS.white, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
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
