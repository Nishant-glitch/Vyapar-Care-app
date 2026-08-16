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
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { GST_CONSTITUTIONS, GST_REASONS } from '../../config/gstConfig';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { validateGSTConstitution } from '../../utils/gstValidation';

export default function GSTConstitutionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData } = useGSTForm();
  const [errors, setErrors] = useState({});

  const handleSelectConstitution = (id) => {
    updateFormData({ constitution: id });
    if (errors.constitution) {
      setErrors((prev) => ({ ...prev, constitution: null }));
    }
  };

  const handleSelectReason = (id) => {
    updateFormData({ registrationReason: id });
    if (errors.registrationReason) {
      setErrors((prev) => ({ ...prev, registrationReason: null }));
    }
  };

  const handleNext = () => {
    const errs = validateGSTConstitution(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('GSTBusinessDetails');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="GST Registration (Form GST REG-01)" />
      <GSTStepper currentStep={1} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏢 Step 1: Constitution of Business</Text>
          <Text style={styles.bannerSubtitle}>
            Select your legal entity type and reason for obtaining GST registration.
          </Text>
        </View>

        {/* ---------- Constitution Picker ---------- */}
        <Text style={styles.sectionHeader}>Select Business Constitution *</Text>
        {errors.constitution && (
          <Text style={styles.errorText}>⚠️ {errors.constitution}</Text>
        )}

        <View style={styles.grid}>
          {GST_CONSTITUTIONS.map((c) => {
            const isSelected = formData.constitution === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleSelectConstitution(c.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{c.icon}</Text>
                  <View
                    style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
                <Text
                  style={[
                    styles.cardLabel,
                    isSelected && styles.cardLabelSelected,
                  ]}
                >
                  {c.label}
                </Text>
                <Text style={styles.cardDesc}>{c.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------- Registration Reason ---------- */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
          Reason to Obtain Registration *
        </Text>
        {errors.registrationReason && (
          <Text style={styles.errorText}>⚠️ {errors.registrationReason}</Text>
        )}

        <View style={styles.reasonsList}>
          {GST_REASONS.map((r) => {
            const isSelected = formData.registrationReason === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.reasonItem,
                  isSelected && styles.reasonItemSelected,
                ]}
                onPress={() => handleSelectReason(r.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text
                  style={[
                    styles.reasonLabel,
                    isSelected && styles.reasonLabelSelected,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---------- Composition Scheme Option ---------- */}
        <View style={styles.compositionBox}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() =>
              updateFormData({ isComposition: !formData.isComposition })
            }
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                formData.isComposition && styles.checkboxChecked,
              ]}
            >
              {formData.isComposition && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.compositionTitle}>
                Opt for Composition Scheme (Lower tax rates for small traders)
              </Text>
              <Text style={styles.compositionDesc}>
                Available for turnover up to ₹1.5 Cr (Goods) or ₹50 Lakh (Services). Cannot issue tax invoices or claim ITC.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ---------- CTA Bottom ---------- */}
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
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#047857', lineHeight: 18 },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardSelected: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: { fontSize: 24 },
  cardLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  cardLabelSelected: { color: '#065F46' },
  cardDesc: { fontSize: 11, color: '#64748B', lineHeight: 15 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#059669' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#059669' },
  reasonsList: { gap: 8 },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  reasonItemSelected: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  reasonLabel: { fontSize: 13, color: COLORS.text, marginLeft: 12, flex: 1, fontWeight: '500' },
  reasonLabelSelected: { color: '#065F46', fontWeight: '700' },
  compositionBox: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#059669', borderColor: '#059669' },
  checkMark: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
  compositionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  compositionDesc: { fontSize: 11, color: '#64748B', marginTop: 3, lineHeight: 15 },
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
