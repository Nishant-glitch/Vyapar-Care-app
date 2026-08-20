import React, { useState } from 'react';
import {
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
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import {
  IEC_AUTH_METHODS,
  IEC_SIGNATORY_DESIGNATIONS,
} from '../../config/iecConfig';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';
import { validateIECSignatory } from '../../utils/iecValidation';
import { pickFile } from '../../utils/pickFile';

export default function IECSignatoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateSignatoryDetails,
    setDocument,
    removeDocument,
  } = useIECForm();

  const [errors, setErrors] = useState({});
  const sig = formData.signatoryDetails || {};
  const photoDoc = formData.documents?.signatory_photo;

  const handleSigChange = (key, val) => {
    updateSignatoryDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const file = await pickFile();
      if (file) {
        setDocument('signatory_photo', file);
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message || 'Could not attach photograph');
    }
  };

  const handleNext = () => {
    const errs = validateIECSignatory(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('IECProducts');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Authorized Signatory" />
      <IECStepper currentStep={6} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>✍️ Step 6: Authorized Signatory & Authentication</Text>
          <Text style={styles.bannerSubtitle}>
            Declare the authorized person who will authenticate the DGFT IEC application via Aadhaar OTP or Digital Signature (DSC).
          </Text>
        </View>

        <FormField
          label="Signatory Full Name (as per PAN) *"
          placeholder="e.g. Rahul Sharma"
          value={sig.fullName}
          onChangeText={(v) => handleSigChange('fullName', v)}
          error={errors.fullName}
        />

        <FormField
          label="Father's / Mother's / Spouse's Name"
          placeholder="e.g. Suresh Sharma"
          value={sig.fatherMotherName}
          onChangeText={(v) => handleSigChange('fatherMotherName', v)}
        />

        <FormField
          label="Date of Birth (YYYY-MM-DD) *"
          placeholder="1990-05-15"
          value={sig.dob}
          onChangeText={(v) => handleSigChange('dob', v)}
        />

        <FormField
          label="Signatory Individual PAN *"
          placeholder="ABCDE1234F"
          value={sig.pan}
          onChangeText={(v) => handleSigChange('pan', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
          error={errors.pan}
        />

        <FormField
          label="Aadhaar Number (12 Digits)"
          placeholder="987654321098"
          value={sig.aadhaar}
          onChangeText={(v) => handleSigChange('aadhaar', v)}
          keyboardType="number-pad"
          maxLength={12}
          helperText="Required for Aadhaar-based OTP E-Verification"
        />

        <FormField
          label="Mobile Number (Linked with Aadhaar) *"
          placeholder="9876543210"
          value={sig.mobile}
          onChangeText={(v) => handleSigChange('mobile', v)}
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.mobile}
        />

        <FormField
          label="Email Address *"
          placeholder="signatory@example.com"
          value={sig.email}
          onChangeText={(v) => handleSigChange('email', v.toLowerCase())}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        {/* Designation Selector */}
        <Text style={styles.sectionHeader}>Designation in the Entity *</Text>
        <View style={styles.chipsContainer}>
          {IEC_SIGNATORY_DESIGNATIONS.map((d) => {
            const isSel = (sig.designation || 'proprietor') === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.chip, isSel && styles.chipSelected]}
                onPress={() => handleSigChange('designation', d.id)}
              >
                <Text style={[styles.chipText, isSel && styles.chipTextSelected]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Authentication Method Selection */}
        <Text style={styles.sectionHeader}>How will the application be authenticated on DGFT? *</Text>
        <View style={styles.authList}>
          {IEC_AUTH_METHODS.map((am) => {
            const isSel = (sig.authMethod || 'aadhaar_otp') === am.id;
            return (
              <TouchableOpacity
                key={am.id}
                style={[styles.authCard, isSel && styles.authCardSelected]}
                onPress={() => handleSigChange('authMethod', am.id)}
              >
                <Text style={styles.authIcon}>{am.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.authTitle, isSel && styles.authTitleSelected]}>
                    {am.label}
                  </Text>
                  <Text style={styles.authDesc}>{am.desc}</Text>
                </View>
                <View style={[styles.radio, isSel && styles.radioSelected]}>
                  {isSel && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Signatory Photograph Upload */}
        <Text style={styles.sectionHeader}>Signatory Passport Size Photograph</Text>
        <View style={[styles.photoBox, photoDoc && styles.photoBoxUploaded]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.photoTitle}>Digital Photograph (JPG / PNG)</Text>
            <Text style={styles.photoHint}>
              Clear front-facing digital photo with white background
            </Text>
            {photoDoc && (
              <Text style={styles.photoFileName}>✓ {photoDoc.name}</Text>
            )}
          </View>

          {photoDoc ? (
            <View style={styles.actionCol}>
              <TouchableOpacity style={styles.btnChange} onPress={handleUploadPhoto}>
                <Text style={styles.btnChangeText}>Replace</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => removeDocument('signatory_photo')}
              >
                <Text style={styles.btnDeleteText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnUpload} onPress={handleUploadPhoto}>
              <Text style={styles.btnUploadText}>+ Upload Photo</Text>
            </TouchableOpacity>
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
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  chipSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  chipTextSelected: { color: COLORS.white, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  authList: { gap: 8 },
  authCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  authCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  authIcon: { fontSize: 22, marginRight: 10 },
  authTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  authTitleSelected: { color: '#0369A1' },
  authDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioSelected: { borderColor: '#0284C7' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#0284C7' },
  photoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  photoBoxUploaded: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  photoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  photoHint: { fontSize: 11, color: '#64748B', marginTop: 2 },
  photoFileName: { fontSize: 11, fontWeight: '700', color: '#059669', marginTop: 4 },
  btnUpload: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnUploadText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  actionCol: { alignItems: 'flex-end', gap: 4 },
  btnChange: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnChangeText: { fontSize: 10, fontWeight: '700', color: '#0369A1' },
  btnDelete: { padding: 4 },
  btnDeleteText: { fontSize: 10, color: '#EF4444', fontWeight: '700' },
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
