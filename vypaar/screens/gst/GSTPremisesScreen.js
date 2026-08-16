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
import { GST_POSSESSION_TYPES } from '../../config/gstConfig';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { validateGSTPremises } from '../../utils/gstValidation';

const BUSINESS_ACTIVITIES = [
  { id: 'retail', label: 'Retail Business' },
  { id: 'wholesale', label: 'Wholesale Business' },
  { id: 'manufacturing', label: 'Factory / Manufacturing' },
  { id: 'warehouse', label: 'Warehouse / Depot' },
  { id: 'office', label: 'Office / Sale Office' },
  { id: 'services', label: 'Supplier of Services' },
  { id: 'ecommerce', label: 'E-Commerce Operator' },
  { id: 'export_import', label: 'Export / Import' },
];

export default function GSTPremisesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updatePremisesDetails } = useGSTForm();
  const [errors, setErrors] = useState({});

  const details = formData.premisesDetails || {};

  const handleChange = (field, value) => {
    updatePremisesDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleActivity = (id) => {
    const current = details.activities || [];
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    updatePremisesDetails({ activities: updated });
  };

  const handleNext = () => {
    const errs = validateGSTPremises(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('GSTGoodsServices');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Principal Place of Business" />
      <GSTStepper currentStep={4} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📍 Step 4: Business Premises & Address</Text>
          <Text style={styles.bannerSubtitle}>
            This address will be verified with the electricity bill and rent agreement / ownership proof.
          </Text>
        </View>

        {/* ---------- Possession Type Picker ---------- */}
        <Text style={styles.sectionHeader}>Nature of Possession of Premises *</Text>
        {errors.possessionType && (
          <Text style={styles.errorText}>⚠️ {errors.possessionType}</Text>
        )}

        <View style={styles.possessionGrid}>
          {GST_POSSESSION_TYPES.map((p) => {
            const isSelected = details.possessionType === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.possessionCard,
                  isSelected && styles.possessionCardSelected,
                ]}
                onPress={() => handleChange('possessionType', p.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.possessionIcon}>{p.icon}</Text>
                <Text
                  style={[
                    styles.possessionLabel,
                    isSelected && styles.possessionLabelSelected,
                  ]}
                >
                  {p.label}
                </Text>
                <Text style={styles.possessionHint}>{p.hint}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionHeader}>Address Details</Text>

        <FormField
          label="Building / Flat / Door / Shop No. *"
          placeholder="Shop No. 12, Ground Floor"
          value={details.buildingNumber}
          onChangeText={(v) => handleChange('buildingNumber', v)}
          error={errors.buildingNumber}
        />

        <FormField
          label="Premises / Building / Complex Name"
          placeholder="City Center Mall"
          value={details.buildingName}
          onChangeText={(v) => handleChange('buildingName', v)}
        />

        <FormField
          label="Road / Street / Locality *"
          placeholder="Main MG Road, Sector 14"
          value={details.street}
          onChangeText={(v) => handleChange('street', v)}
          error={errors.street}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="City / Town *"
              placeholder="e.g. New Delhi"
              value={details.city}
              onChangeText={(v) => handleChange('city', v)}
              error={errors.city}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="PIN Code *"
              placeholder="110001"
              value={details.pinCode}
              onChangeText={(v) => handleChange('pinCode', v)}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pinCode}
            />
          </View>
        </View>

        {/* ---------- Nature of Business Activity ---------- */}
        <View style={styles.divider} />
        <Text style={styles.sectionHeader}>Nature of Business Activity at Premises</Text>
        <Text style={styles.sectionHint}>Select all activities that apply to this location:</Text>

        <View style={styles.pillsContainer}>
          {BUSINESS_ACTIVITIES.map((act) => {
            const isSelected = (details.activities || []).includes(act.id);
            return (
              <TouchableOpacity
                key={act.id}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => toggleActivity(act.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    isSelected && styles.pillTextSelected,
                  ]}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {act.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          <Text style={styles.btnNextText}>CONTINUE TO GOODS & SERVICES →</Text>
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
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#B45309', lineHeight: 18 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  sectionHint: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: '600' },
  possessionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  possessionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  possessionCardSelected: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  possessionIcon: { fontSize: 20, marginBottom: 4 },
  possessionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  possessionLabelSelected: { color: '#065F46' },
  possessionHint: { fontSize: 10, color: '#64748B', lineHeight: 14 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 18 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pillSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  pillText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  pillTextSelected: { color: COLORS.white, fontWeight: '700' },
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
