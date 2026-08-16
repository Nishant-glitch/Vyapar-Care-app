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
import { validateGSTPromoters } from '../../utils/gstValidation';

export default function GSTPromotersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    addPromoter,
    updatePromoter,
    removePromoter,
  } = useGSTForm();
  const [errors, setErrors] = useState({});

  const promoters = formData.promoters || [];
  const constitution = formData.constitution;

  const isCompany = constitution === 'pvt_ltd' || constitution === 'public_ltd';
  const isLLP = constitution === 'llp';
  const isPartnership = constitution === 'partnership';

  const promoterLabel = isCompany
    ? 'Director'
    : isLLP
    ? 'Designated Partner'
    : isPartnership
    ? 'Partner'
    : 'Proprietor';

  const handleFieldChange = (idx, field, value) => {
    updatePromoter(idx, { [field]: value });
    const errKey = `promoter_${idx}_${field}`;
    if (errors[errKey]) {
      setErrors((prev) => ({ ...prev, [errKey]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateGSTPromoters(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('GSTPremises');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title={`${promoterLabel} Details`} />
      <GSTStepper currentStep={3} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            👥 Step 3: {promoterLabel}s & Authorized Signatories
          </Text>
          <Text style={styles.bannerSubtitle}>
            Aadhaar and PAN details are mandatory for instant GST Aadhaar Authentication.
          </Text>
        </View>

        {promoters.map((promoter, idx) => (
          <View key={promoter.id || idx} style={styles.promoterCard}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {promoterLabel} #{idx + 1}
                </Text>
              </View>
              {promoters.length > 1 && (
                <TouchableOpacity
                  onPress={() => removePromoter(idx)}
                  style={styles.btnDelete}
                >
                  <Text style={styles.btnDeleteText}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <FormField
              label="Full Name (as per PAN & Aadhaar) *"
              placeholder="e.g. Rahul Sharma"
              value={promoter.name}
              onChangeText={(v) => handleFieldChange(idx, 'name', v)}
              error={errors[`promoter_${idx}_name`]}
            />

            <FormField
              label="Father's Full Name *"
              placeholder="e.g. Suresh Sharma"
              value={promoter.fatherName}
              onChangeText={(v) => handleFieldChange(idx, 'fatherName', v)}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <FormField
                  label="Date of Birth *"
                  placeholder="YYYY-MM-DD"
                  value={promoter.dob}
                  onChangeText={(v) => handleFieldChange(idx, 'dob', v)}
                />
              </View>
              <View style={styles.half}>
                <FormField
                  label="Gender *"
                  placeholder="Male / Female"
                  value={promoter.gender}
                  onChangeText={(v) => handleFieldChange(idx, 'gender', v)}
                />
              </View>
            </View>

            <FormField
              label="Mobile Number (linked to Aadhaar) *"
              placeholder="9876543210"
              value={promoter.mobile}
              onChangeText={(v) => handleFieldChange(idx, 'mobile', v)}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors[`promoter_${idx}_mobile`]}
              helperText="OTP will be sent to this number for Aadhaar verification"
            />

            <FormField
              label="Email Address *"
              placeholder="rahul@example.com"
              value={promoter.email}
              onChangeText={(v) => handleFieldChange(idx, 'email', v.toLowerCase())}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors[`promoter_${idx}_email`]}
            />

            <FormField
              label="Personal PAN *"
              placeholder="ABCDE1234F"
              value={promoter.pan}
              onChangeText={(v) => handleFieldChange(idx, 'pan', v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              error={errors[`promoter_${idx}_pan`]}
            />

            <FormField
              label="12-Digit Aadhaar Number *"
              placeholder="123456789012"
              value={promoter.aadhaar}
              onChangeText={(v) => handleFieldChange(idx, 'aadhaar', v)}
              keyboardType="number-pad"
              maxLength={12}
              error={errors[`promoter_${idx}_aadhaar`]}
            />

            {isCompany && (
              <FormField
                label="Director Identification Number (DIN)"
                placeholder="01234567"
                value={promoter.din}
                onChangeText={(v) => handleFieldChange(idx, 'din', v)}
                keyboardType="number-pad"
                maxLength={8}
              />
            )}

            {/* Authorized Signatory Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() =>
                handleFieldChange(
                  idx,
                  'isAuthorizedSignatory',
                  !promoter.isAuthorizedSignatory
                )
              }
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  promoter.isAuthorizedSignatory && styles.checkboxChecked,
                ]}
              >
                {promoter.isAuthorizedSignatory && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>
              <Text style={styles.toggleLabel}>
                Designated as Primary Authorized Signatory
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {(isCompany || isLLP || isPartnership) && (
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={addPromoter}
            activeOpacity={0.7}
          >
            <Text style={styles.btnAddText}>
              + Add Another {promoterLabel}
            </Text>
          </TouchableOpacity>
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
          <Text style={styles.btnNextText}>CONTINUE TO PREMISES →</Text>
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
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#15803D', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#16A34A', lineHeight: 18 },
  promoterCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#0369A1' },
  btnDelete: { padding: 4 },
  btnDeleteText: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: { backgroundColor: '#059669', borderColor: '#059669' },
  checkMark: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  toggleLabel: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  btnAdd: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnAddText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
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
