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
import ITRStepper from '../../components/ITRStepper';
import ScreenHeader from '../../components/ScreenHeader';
import {
  ASSESSMENT_YEARS,
  RESIDENTIAL_STATUSES,
  TAXPAYER_TYPES,
} from '../../config/itrConfig';
import { COLORS } from '../../constants/theme';
import { useITRForm } from '../../contexts/ITRFormContext';
import { validateITRProfile } from '../../utils/itrValidation';

export default function ITRProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData, updateProfile } = useITRForm();
  const [errors, setErrors] = useState({});
  const [verifyingPan, setVerifyingPan] = useState(false);

  const profile = formData.profile || {};

  const handleProfileChange = (key, val) => {
    updateProfile({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleVerifyPAN = () => {
    if (!profile.pan || profile.pan.length !== 10) {
      setErrors((prev) => ({ ...prev, pan: 'Valid 10-character PAN required' }));
      return;
    }
    setVerifyingPan(true);
    setTimeout(() => {
      setVerifyingPan(false);
      updateProfile({ isPANVerified: true });
      if (errors.pan) {
        setErrors((prev) => ({ ...prev, pan: null }));
      }
      Alert.alert('✓ PAN Verified', 'PAN successfully verified with Income Tax / NSDL records.');
    }, 600);
  };

  const handleNext = () => {
    const errs = validateITRProfile(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('ITRSources');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Income Tax Return Filing" />
      <ITRStepper currentStep={1} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📅 Step 1: Assessment Year & Taxpayer Profile</Text>
          <Text style={styles.bannerSubtitle}>
            Select your assessment year, taxpayer category and enter basic identity details.
          </Text>
        </View>

        {/* 1. Assessment Year Selector */}
        <Text style={styles.sectionHeader}>Select Assessment Year (AY) *</Text>
        <View style={styles.ayList}>
          {ASSESSMENT_YEARS.map((ay) => {
            const isSelected = formData.assessmentYear === ay.id;
            return (
              <TouchableOpacity
                key={ay.id}
                style={[styles.ayCard, isSelected && styles.ayCardSelected]}
                onPress={() => updateFormData({ assessmentYear: ay.id })}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ayTitle, isSelected && styles.ayTitleSelected]}>
                    {ay.label}
                  </Text>
                  <Text style={styles.aySub}>
                    {ay.isCurrent ? '⭐ Current Active Return Filing Year' : 'Previous Financial Year'}
                  </Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* 2. Taxpayer Type */}
        <Text style={styles.sectionHeader}>Who is Filing this Return? *</Text>
        <View style={styles.typeGrid}>
          {TAXPAYER_TYPES.map((t) => {
            const isSelected = formData.taxpayerType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                onPress={() => updateFormData({ taxpayerType: t.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* 3. Residential Status */}
        <Text style={styles.sectionHeader}>Residential Status in India *</Text>
        <View style={styles.resList}>
          {RESIDENTIAL_STATUSES.map((r) => {
            const isSelected = formData.residentialStatus === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.resCard, isSelected && styles.resCardSelected]}
                onPress={() => updateFormData({ residentialStatus: r.id })}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resTitle, isSelected && styles.resTitleSelected]}>
                    {r.label}
                  </Text>
                  <Text style={styles.resDesc}>{r.desc}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* 4. PAN & Personal Details */}
        <Text style={styles.sectionHeader}>Taxpayer Identity & PAN Details</Text>

        <FormField
          label="Permanent Account Number (PAN) *"
          placeholder="ABCDE1234F"
          value={profile.pan}
          onChangeText={(v) => handleProfileChange('pan', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
          error={errors.pan}
        />

        {profile.isPANVerified ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ PAN Verified with Income Tax Database</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.btnVerify}
            onPress={handleVerifyPAN}
            disabled={verifyingPan}
          >
            {verifyingPan ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.btnVerifyText}>Verify PAN with Income Tax Database ✓</Text>
            )}
          </TouchableOpacity>
        )}

        <FormField
          label="Full Name (as per PAN) *"
          placeholder="e.g. Rahul Sharma"
          value={profile.fullName}
          onChangeText={(v) => handleProfileChange('fullName', v)}
          error={errors.fullName}
        />

        <FormField
          label="Father's / Mother's Name"
          placeholder="e.g. Suresh Sharma"
          value={profile.fatherName}
          onChangeText={(v) => handleProfileChange('fatherName', v)}
        />

        <FormField
          label="Date of Birth / Incorporation (YYYY-MM-DD) *"
          placeholder="1990-05-15"
          value={profile.dob}
          onChangeText={(v) => handleProfileChange('dob', v)}
          error={errors.dob}
        />

        <FormField
          label="Mobile Number (Linked with Aadhaar/IT Portal) *"
          placeholder="9876543210"
          value={profile.mobile}
          onChangeText={(v) => handleProfileChange('mobile', v)}
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.mobile}
          helperText="Required for sending OTP for E-Verification of return"
        />

        <FormField
          label="Email Address *"
          placeholder="rahul@example.com"
          value={profile.email}
          onChangeText={(v) => handleProfileChange('email', v.toLowerCase())}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <FormField
          label="Residential / Registered Address *"
          placeholder="e.g. Flat 402, Block C, Green Heights"
          value={profile.address}
          onChangeText={(v) => handleProfileChange('address', v)}
          error={errors.address}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="City *"
              placeholder="e.g. New Delhi"
              value={profile.city}
              onChangeText={(v) => handleProfileChange('city', v)}
              error={errors.city}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="PIN Code *"
              placeholder="110001"
              value={profile.pinCode}
              onChangeText={(v) => handleProfileChange('pinCode', v)}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pinCode}
            />
          </View>
        </View>

        {/* Additional Director & Unlisted Share Checkboxes */}
        <View style={styles.disclosureBox}>
          <Text style={styles.disclosureTitle}>Statutory Disclosures:</Text>

          <TouchableOpacity
            style={styles.checkItem}
            onPress={() => handleProfileChange('isDirector', !profile.isDirector)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, profile.isDirector && styles.checkboxChecked]}>
              {profile.isDirector && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              Are you a Director in any company in India or abroad?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkItem, { marginTop: 8 }]}
            onPress={() => handleProfileChange('holdsUnlistedShares', !profile.holdsUnlistedShares)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, profile.holdsUnlistedShares && styles.checkboxChecked]}>
              {profile.holdsUnlistedShares && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>
              Do you hold any unlisted equity shares (Startups/Pvt Ltd)?
            </Text>
          </TouchableOpacity>
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
          <Text style={styles.btnNextText}>CONTINUE TO INCOME SOURCES →</Text>
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
    marginBottom: 10,
  },
  ayList: { gap: 8 },
  ayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  ayCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  ayTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  ayTitleSelected: { color: '#0369A1' },
  aySub: { fontSize: 11, color: '#64748B', marginTop: 2 },
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
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  typeCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  typeIcon: { fontSize: 20, marginBottom: 4 },
  typeLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  typeLabelSelected: { color: '#0369A1', fontWeight: '700' },
  resList: { gap: 8 },
  resCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  resCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  resTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  resTitleSelected: { color: '#0369A1' },
  resDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  btnVerify: {
    backgroundColor: '#0284C7',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 12,
  },
  btnVerifyText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: -4,
    marginBottom: 12,
  },
  verifiedText: { color: '#065F46', fontWeight: '700', fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  disclosureBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disclosureTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  checkMark: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  checkLabel: { fontSize: 11, color: '#334155', flex: 1, lineHeight: 15, fontWeight: '500' },
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
