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
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { IEC_PREMISES_TYPES } from '../../config/iecConfig';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';
import { validateIECAddress } from '../../utils/iecValidation';

export default function IECAddressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateAddressDetails } = useIECForm();
  const [errors, setErrors] = useState({});

  const addr = formData.addressDetails || {};

  const handleAddrChange = (key, val) => {
    updateAddressDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateIECAddress(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('IECBank');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Registered / Business Address" />
      <IECStepper currentStep={4} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📍 Step 4: Registered Office & Premises Details</Text>
          <Text style={styles.bannerSubtitle}>
            Enter the principal place of business address. DGFT regional jurisdiction is mapped directly from your PIN code.
          </Text>
        </View>

        <FormField
          label="Flat / Door / Block / Building Number *"
          placeholder="e.g. Shop No. 12, Ground Floor"
          value={addr.line1}
          onChangeText={(v) => handleAddrChange('line1', v)}
          error={errors.line1}
        />

        <FormField
          label="Building / Complex / Industrial Area Name"
          placeholder="e.g. Okhla Industrial Area Phase-III"
          value={addr.building}
          onChangeText={(v) => handleAddrChange('building', v)}
        />

        <FormField
          label="Road / Street / Locality"
          placeholder="e.g. Captain Gaur Marg"
          value={addr.street}
          onChangeText={(v) => handleAddrChange('street', v)}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="City / Town *"
              placeholder="e.g. New Delhi"
              value={addr.city}
              onChangeText={(v) => handleAddrChange('city', v)}
              error={errors.city}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="District *"
              placeholder="e.g. South Delhi"
              value={addr.district}
              onChangeText={(v) => handleAddrChange('district', v)}
              error={errors.district}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="State / UT *"
              placeholder="e.g. Delhi (07)"
              value={addr.state}
              onChangeText={(v) => handleAddrChange('state', v)}
              error={errors.state}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="PIN Code *"
              placeholder="110020"
              value={addr.pinCode}
              onChangeText={(v) => handleAddrChange('pinCode', v)}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pinCode}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Premises Possession Type */}
        <Text style={styles.sectionHeader}>Premises Possession Type *</Text>
        <View style={styles.premisesList}>
          {IEC_PREMISES_TYPES.map((p) => {
            const isSel = (addr.premisesType || 'owned') === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.premiseCard, isSel && styles.premiseCardSelected]}
                onPress={() => handleAddrChange('premisesType', p.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.premiseTitle, isSel && styles.premiseTitleSelected]}>
                    {p.label}
                  </Text>
                  <Text style={styles.premiseDesc}>{p.desc}</Text>
                </View>
                <View style={[styles.radio, isSel && styles.radioSelected]}>
                  {isSel && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Address Proof Name Check */}
        <View style={styles.nocBox}>
          <Text style={styles.nocTitle}>Is the Address Proof / Utility Bill in the Entity's Name?</Text>
          <View style={styles.radioRow}>
            {[
              { val: true, label: 'Yes (In Firm / Entity Name)' },
              { val: false, label: 'No (In Owner / Landlord Name)' },
            ].map((opt) => {
              const isSel = addr.proofInEntityName === opt.val;
              return (
                <TouchableOpacity
                  key={String(opt.val)}
                  style={[styles.radioItem, isSel && styles.radioItemSelected]}
                  onPress={() => handleAddrChange('proofInEntityName', opt.val)}
                >
                  <View style={[styles.radioCircle, isSel && styles.radioCircleActive]}>
                    {isSel && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.radioText, isSel && styles.radioTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {addr.proofInEntityName === false && (
            <View style={styles.nocAlert}>
              <Text style={styles.nocAlertTitle}>📄 Owner NOC Required:</Text>
              <Text style={styles.nocAlertText}>
                As per DGFT rules, when electricity bill is in the owner's name, a combined PDF of the Owner NOC along with the address proof must be uploaded.
              </Text>
            </View>
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
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  premisesList: { gap: 8, marginBottom: 14 },
  premiseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  premiseCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  premiseTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  premiseTitleSelected: { color: '#0369A1' },
  premiseDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
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
  nocBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  nocTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  radioRow: { flexDirection: 'row', gap: 10 },
  radioItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  radioItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioCircleActive: { borderColor: '#0284C7' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0284C7' },
  radioText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  radioTextActive: { color: '#0369A1', fontWeight: '700' },
  nocAlert: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 10,
  },
  nocAlertTitle: { fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  nocAlertText: { fontSize: 11, color: '#78350F', lineHeight: 15 },
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
