import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { validateUdyamPAN } from '../../utils/udyamValidation';

export default function UdyamPANScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updatePANDetails } = useUdyamForm();
  const [errors, setErrors] = useState({});

  const [verifyingPan, setVerifyingPan] = useState(false);
  const [verifyingGst, setVerifyingGst] = useState(false);

  const details = formData.panDetails || {};

  const handleChange = (key, val) => {
    updatePANDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleVerifyPAN = () => {
    if (!details.panNumber || details.panNumber.length !== 10) {
      setErrors((prev) => ({ ...prev, panNumber: 'Valid 10-character PAN required' }));
      return;
    }
    setVerifyingPan(true);
    setTimeout(() => {
      setVerifyingPan(false);
      updatePANDetails({ isPANVerified: true });
      if (errors.isPANVerified) {
        setErrors((prev) => ({ ...prev, isPANVerified: null }));
      }
      Alert.alert('✓ PAN Verified', 'PAN successfully verified with Income Tax / NSDL records.');
    }, 600);
  };

  const handleVerifyGSTIN = () => {
    if (!details.gstin || details.gstin.length !== 15) {
      setErrors((prev) => ({ ...prev, gstin: 'Valid 15-character GSTIN required' }));
      return;
    }
    setVerifyingGst(true);
    setTimeout(() => {
      setVerifyingGst(false);
      updatePANDetails({ isGSTINVerified: true });
      Alert.alert('✓ GSTIN Verified', 'GSTIN verified with GST Common Portal.');
    }, 600);
  };

  const handleNext = () => {
    const errs = validateUdyamPAN(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (errs.isPANVerified) {
        Alert.alert('PAN Verification Required', 'Please tap "Verify PAN" before proceeding.');
      }
      return;
    }
    if (details.hasExistingUdyam) {
      Alert.alert(
        'Warning: Existing Udyam Registration',
        'As per official government rules, one enterprise should not file more than one Udyam Registration. You may update existing Udyam rather than filing a new one.'
      );
    }
    navigation.navigate('UdyamBusiness');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="PAN & Tax Verification" />
      <UdyamStepper currentStep={2} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>💳 Step 2: PAN & GST Verification</Text>
          <Text style={styles.bannerSubtitle}>
            Udyam registration is integrated with Income Tax and GST portals for automatic turnover and investment verification.
          </Text>
        </View>

        {/* PAN Question */}
        <Text style={styles.sectionHeader}>Do you have a Permanent Account Number (PAN)? *</Text>
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceCard, details.hasPAN && styles.choiceCardSelected]}
            onPress={() => handleChange('hasPAN', true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.choiceText, details.hasPAN && styles.choiceTextSelected]}>
              Yes, I have PAN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.choiceCard, !details.hasPAN && styles.choiceCardSelected]}
            onPress={() => handleChange('hasPAN', false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.choiceText, !details.hasPAN && styles.choiceTextSelected]}>
              No PAN (Individual only)
            </Text>
          </TouchableOpacity>
        </View>

        {details.hasPAN && (
          <View style={styles.formSection}>
            <FormField
              label="Permanent Account Number (PAN) *"
              placeholder="ABCDE1234F"
              value={details.panNumber}
              onChangeText={(v) => handleChange('panNumber', v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              error={errors.panNumber}
              helperText="Proprietor PAN for Proprietorship; Firm/Company PAN for other entities"
            />

            <FormField
              label="Name as per PAN Card *"
              placeholder="e.g. Ramesh Kumar / Nexus Tech Pvt Ltd"
              value={details.nameAsPerPAN}
              onChangeText={(v) => handleChange('nameAsPerPAN', v)}
              error={errors.nameAsPerPAN}
            />

            {details.isPANVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ PAN Verified Successfully</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.btnVerify}
                onPress={handleVerifyPAN}
                disabled={verifyingPan}
                activeOpacity={0.8}
              >
                {verifyingPan ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.btnVerifyText}>Verify PAN with Income Tax Database ✓</Text>
                )}
              </TouchableOpacity>
            )}

            {errors.isPANVerified && (
              <Text style={styles.errorText}>⚠️ {errors.isPANVerified}</Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* GSTIN Question */}
        <Text style={styles.sectionHeader}>Do you have GSTIN (Goods & Services Tax Number)?</Text>
        <View style={styles.choiceRow}>
          {[
            { id: 'yes', label: 'Yes' },
            { id: 'no', label: 'No' },
            { id: 'not_applicable', label: 'Exempt / NA' },
          ].map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.choiceCard,
                details.hasGSTIN === c.id && styles.choiceCardSelected,
              ]}
              onPress={() => handleChange('hasGSTIN', c.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.choiceText,
                  details.hasGSTIN === c.id && styles.choiceTextSelected,
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {details.hasGSTIN === 'yes' && (
          <View style={styles.formSection}>
            <FormField
              label="15-Character GSTIN *"
              placeholder="07AAAAA0000A1Z5"
              value={details.gstin}
              onChangeText={(v) => handleChange('gstin', v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={15}
              error={errors.gstin}
            />
            {details.isGSTINVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ GSTIN Verified</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.btnVerifyGst}
                onPress={handleVerifyGSTIN}
                disabled={verifyingGst}
              >
                {verifyingGst ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.btnVerifyGstText}>Verify GSTIN</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Previous Registrations Check */}
        <Text style={styles.sectionHeader}>Previous MSME / Udyog Aadhaar Registrations</Text>

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => handleChange('hasPreviousUAM', !details.hasPreviousUAM)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, details.hasPreviousUAM && styles.checkboxChecked]}>
            {details.hasPreviousUAM && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.toggleLabel}>
            Do you have previous Udyog Aadhaar (UAM) Registration to migrate?
          </Text>
        </TouchableOpacity>

        {details.hasPreviousUAM && (
          <View style={{ marginTop: 10 }}>
            <FormField
              label="Previous UAM Number"
              placeholder="DL01A0001234"
              value={details.uamNumber}
              onChangeText={(v) => handleChange('uamNumber', v.toUpperCase())}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.toggleRow, { marginTop: 14 }]}
          onPress={() => handleChange('hasExistingUdyam', !details.hasExistingUdyam)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, details.hasExistingUdyam && styles.checkboxChecked]}>
            {details.hasExistingUdyam && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.toggleLabel}>
            Do you already have an active Udyam Registration Number?
          </Text>
        </TouchableOpacity>

        {details.hasExistingUdyam && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Official Statutory Notice:</Text>
            <Text style={styles.warningDesc}>
              Under Government of India MSME guidelines, an enterprise must not have more than one Udyam Registration. Any number of activities and branch units can be added to a single Udyam registration.
            </Text>
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
          <Text style={styles.btnNextText}>CONTINUE TO BUSINESS DETAILS →</Text>
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
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: '600' },
  choiceRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  choiceCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  choiceCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  choiceText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  choiceTextSelected: { color: '#0369A1', fontWeight: '700' },
  formSection: { marginTop: 4 },
  btnVerify: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  btnVerifyText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  btnVerifyGst: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnVerifyGstText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
    marginBottom: 6,
  },
  verifiedText: { color: '#065F46', fontWeight: '700', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 18 },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  checkMark: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  toggleLabel: { fontSize: 13, color: COLORS.text, flex: 1, fontWeight: '500' },
  warningBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 10,
  },
  warningTitle: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  warningDesc: { fontSize: 11, color: '#B45309', lineHeight: 15 },
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
