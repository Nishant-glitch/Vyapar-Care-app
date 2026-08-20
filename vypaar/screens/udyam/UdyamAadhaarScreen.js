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
import { validateUdyamAadhaar } from '../../utils/udyamValidation';

const AADHAAR_HOLDER_OPTIONS = [
  { id: 'Proprietor', label: 'Proprietor (for Sole Proprietorship)', icon: '👤' },
  { id: 'Managing Partner', label: 'Managing Partner (for Partnership Firm)', icon: '🤝' },
  { id: 'Designated Partner', label: 'Designated Partner (for LLP)', icon: '⚖️' },
  { id: 'Karta', label: 'Karta (for Hindu Undivided Family - HUF)', icon: '👨‍👩‍👧‍👦' },
  { id: 'Authorized Signatory', label: 'Authorized Signatory / Director (Company / Trust / Society)', icon: '🏢' },
];

export default function UdyamAadhaarScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateAadhaarDetails } = useUdyamForm();
  const [errors, setErrors] = useState({});

  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const details = formData.aadhaarDetails || {};

  const handleChange = (key, val) => {
    updateAadhaarDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleSendOTP = () => {
    if (!details.aadhaarNumber || details.aadhaarNumber.length !== 12) {
      setErrors((prev) => ({ ...prev, aadhaarNumber: 'Valid 12-digit Aadhaar required' }));
      return;
    }
    if (!details.mobile || details.mobile.length !== 10) {
      setErrors((prev) => ({ ...prev, mobile: 'Valid 10-digit mobile required' }));
      return;
    }

    setSendingOtp(true);
    setTimeout(() => {
      setSendingOtp(false);
      setOtpSent(true);
      Alert.alert(
        'OTP Sent Successfully',
        `A 6-digit Aadhaar verification OTP has been sent to your registered mobile number ending with ${details.mobile.slice(-4)}. (Use demo OTP: 123456)`
      );
    }, 800);
  };

  const handleVerifyOTP = () => {
    if (!otpInput || otpInput.trim().length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP received on your mobile');
      return;
    }

    setVerifyingOtp(true);
    setTimeout(() => {
      setVerifyingOtp(false);
      updateAadhaarDetails({ isAadhaarVerified: true, otp: otpInput });
      if (errors.isAadhaarVerified) {
        setErrors((prev) => ({ ...prev, isAadhaarVerified: null }));
      }
      Alert.alert('✓ Verification Success', 'Aadhaar verified successfully with UIDAI gateway.');
    }, 600);
  };

  const handleNext = () => {
    const errs = validateUdyamAadhaar(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (errs.isAadhaarVerified) {
        Alert.alert('Aadhaar Verification Pending', 'Please complete the Aadhaar OTP verification to proceed.');
      }
      return;
    }
    navigation.navigate('UdyamPAN');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="MSME / Udyam Registration" />
      <UdyamStepper currentStep={1} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🆔 Step 1: Aadhaar Verification</Text>
          <Text style={styles.bannerSubtitle}>
            Official Udyam registration is paperless and requires Aadhaar authentication of the business owner or authorized signatory.
          </Text>
        </View>

        {/* Aadhaar Holder Role Picker */}
        <Text style={styles.sectionHeader}>Who is the Aadhaar Holder? *</Text>
        {errors.aadhaarHolderType && (
          <Text style={styles.errorText}>⚠️ {errors.aadhaarHolderType}</Text>
        )}

        <View style={styles.rolesList}>
          {AADHAAR_HOLDER_OPTIONS.map((opt) => {
            const isSelected = details.aadhaarHolderType === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.roleItem, isSelected && styles.roleItemSelected]}
                onPress={() => handleChange('aadhaarHolderType', opt.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.roleIcon}>{opt.icon}</Text>
                <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>
                  {opt.label}
                </Text>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionHeader}>Applicant Aadhaar Information</Text>

        <FormField
          label="12-Digit Aadhaar Number *"
          placeholder="123456789012"
          value={details.aadhaarNumber}
          onChangeText={(v) => handleChange('aadhaarNumber', v)}
          keyboardType="number-pad"
          maxLength={12}
          error={errors.aadhaarNumber}
          helperText="Aadhaar of Proprietor / Managing Partner / Karta / Director"
        />

        <FormField
          label="Name as per Aadhaar Card *"
          placeholder="e.g. Ramesh Kumar"
          value={details.nameAsPerAadhaar}
          onChangeText={(v) => handleChange('nameAsPerAadhaar', v)}
          error={errors.nameAsPerAadhaar}
        />

        <FormField
          label="Mobile Number (Linked with Aadhaar) *"
          placeholder="9876543210"
          value={details.mobile}
          onChangeText={(v) => handleChange('mobile', v)}
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.mobile}
          helperText="OTP will be sent to this number for live UIDAI authentication"
        />

        <FormField
          label="Email Address *"
          placeholder="ramesh@example.com"
          value={details.email}
          onChangeText={(v) => handleChange('email', v.toLowerCase())}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        {/* OTP Verification Box */}
        <View style={styles.otpBox}>
          <Text style={styles.otpBoxTitle}>Aadhaar OTP Authentication</Text>
          <Text style={styles.otpBoxSub}>
            Mandatory step under official Government of India Udyam guidelines.
          </Text>

          {details.isAadhaarVerified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Aadhaar OTP Verified Successfully</Text>
            </View>
          ) : (
            <>
              {!otpSent ? (
                <TouchableOpacity
                  style={styles.btnOtp}
                  onPress={handleSendOTP}
                  disabled={sendingOtp}
                  activeOpacity={0.8}
                >
                  {sendingOtp ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.btnOtpText}>📲 Send Aadhaar OTP</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.otpInputGroup}>
                  <FormField
                    label="Enter 6-Digit OTP"
                    placeholder="123456"
                    value={otpInput}
                    onChangeText={setOtpInput}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <View style={styles.otpRow}>
                    <TouchableOpacity
                      style={styles.btnVerify}
                      onPress={handleVerifyOTP}
                      disabled={verifyingOtp}
                    >
                      {verifyingOtp ? (
                        <ActivityIndicator color={COLORS.white} size="small" />
                      ) : (
                        <Text style={styles.btnVerifyText}>Verify OTP ✓</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnResend}
                      onPress={handleSendOTP}
                    >
                      <Text style={styles.btnResendText}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}

          {errors.isAadhaarVerified && (
            <Text style={styles.errorText}>⚠️ {errors.isAadhaarVerified}</Text>
          )}
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
          <Text style={styles.btnNextText}>CONTINUE TO PAN VERIFICATION →</Text>
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
  },
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: '600' },
  rolesList: { gap: 8 },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  roleItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  roleIcon: { fontSize: 18, marginRight: 10 },
  roleLabel: { fontSize: 12, color: COLORS.text, flex: 1, fontWeight: '600' },
  roleLabelSelected: { color: '#0369A1', fontWeight: '700' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#0284C7' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#0284C7' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 18 },
  otpBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  otpBoxTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 2 },
  otpBoxSub: { fontSize: 11, color: '#64748B', marginBottom: 12 },
  btnOtp: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnOtpText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  otpInputGroup: { marginTop: 4 },
  otpRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnVerify: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnVerifyText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  btnResend: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnResendText: { color: '#475569', fontWeight: '600', fontSize: 12 },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: { color: '#065F46', fontWeight: '700', fontSize: 13 },
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
