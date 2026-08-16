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
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { IEC_ENTITY_TYPES } from '../../config/iecConfig';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';
import { validateIECApplicantType } from '../../utils/iecValidation';

export default function IECApplicantTypeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData } = useIECForm();
  const [error, setError] = useState(null);

  const selectedType = formData.entityType;

  const handleSelect = (typeId) => {
    updateFormData({ entityType: typeId });
    if (error) setError(null);
  };

  const handleNext = () => {
    const errs = validateIECApplicantType(formData);
    if (Object.keys(errs).length > 0) {
      setError(errs.entityType);
      return;
    }
    navigation.navigate('IECPAN');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Import Export Code (IEC)" />
      <IECStepper currentStep={1} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏛️ Step 1: Select Entity Constitution</Text>
          <Text style={styles.bannerSubtitle}>
            Choose the legal structure of your enterprise. Fields, proofs, and authorized signatory requirements will adapt dynamically.
          </Text>
        </View>

        <Text style={styles.sectionHeader}>What type of entity is applying for IEC? *</Text>

        <View style={styles.typesGrid}>
          {IEC_ENTITY_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                onPress={() => handleSelect(type.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
                  {type.label}
                </Text>
                <Text style={styles.typeDesc}>{type.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📌 DGFT Policy Note:</Text>
          <Text style={styles.infoText}>
            Under current DGFT regulations, the IEC issued is identical to your 10-digit Entity PAN. Only one IEC is permissible per PAN.
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
    marginBottom: 12,
  },
  typesGrid: { gap: 10 },
  typeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  typeCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeIcon: { fontSize: 24 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#0284C7' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0284C7' },
  typeLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  typeLabelSelected: { color: '#0369A1' },
  typeDesc: { fontSize: 11, color: '#64748B', lineHeight: 15 },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 8, fontWeight: '700' },
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 16,
  },
  infoTitle: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  infoText: { fontSize: 11, color: '#78350F', lineHeight: 16 },
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
