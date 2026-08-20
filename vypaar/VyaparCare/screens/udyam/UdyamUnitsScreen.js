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
import ScreenHeader from '../../components/ScreenHeader';
import UdyamStepper from '../../components/UdyamStepper';
import { COLORS } from '../../constants/theme';
import { useUdyamForm } from '../../contexts/UdyamFormContext';
import { validateUdyamUnits } from '../../utils/udyamValidation';

export default function UdyamUnitsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    addPlantUnit,
    updatePlantUnit,
    removePlantUnit,
  } = useUdyamForm();
  const [errors, setErrors] = useState({});

  const units = formData.plantUnits || [];

  const handleFieldChange = (idx, field, val) => {
    updatePlantUnit(idx, { [field]: val });
    const errKey = `unit_${idx}_${field}`;
    if (errors[errKey]) {
      setErrors((prev) => ({ ...prev, [errKey]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateUdyamUnits(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('UdyamBank');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Plant / Unit Details" />
      <UdyamStepper currentStep={6} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏭 Step 6: Plants, Factories & Unit Locations</Text>
          <Text style={styles.bannerSubtitle}>
            Add all operating plants, branches, or factories under this enterprise. You can add multiple units.
          </Text>
        </View>

        {units.map((unit, idx) => (
          <View key={unit.id || idx} style={styles.unitCard}>
            <View style={styles.unitHeader}>
              <Text style={styles.unitBadge}>Unit #{idx + 1}</Text>
              {units.length > 1 && (
                <TouchableOpacity
                  onPress={() => removePlantUnit(idx)}
                  style={styles.btnDelete}
                >
                  <Text style={styles.btnDeleteText}>✕ Remove Unit</Text>
                </TouchableOpacity>
              )}
            </View>

            <FormField
              label="Unit / Plant / Office Name *"
              placeholder="e.g. Unit 1 - Main Factory / Branch Office"
              value={unit.unitName}
              onChangeText={(v) => handleFieldChange(idx, 'unitName', v)}
              error={errors[`unit_${idx}_name`]}
            />

            <FormField
              label="Flat / Door / Building No."
              placeholder="Plot No. 45, Phase 2"
              value={unit.flatDoorBlock}
              onChangeText={(v) => handleFieldChange(idx, 'flatDoorBlock', v)}
            />

            <FormField
              label="Road / Street / Industrial Area"
              placeholder="e.g. Okhla Industrial Area"
              value={unit.roadStreet}
              onChangeText={(v) => handleFieldChange(idx, 'roadStreet', v)}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <FormField
                  label="City / Town"
                  placeholder="New Delhi"
                  value={unit.city}
                  onChangeText={(v) => handleFieldChange(idx, 'city', v)}
                />
              </View>
              <View style={styles.half}>
                <FormField
                  label="PIN Code *"
                  placeholder="110020"
                  value={unit.pinCode}
                  onChangeText={(v) => handleFieldChange(idx, 'pinCode', v)}
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors[`unit_${idx}_pincode`]}
                />
              </View>
            </View>

            {/* Unit Activity */}
            <Text style={styles.subLabel}>Unit Activity Type</Text>
            <View style={styles.activityRow}>
              {['Manufacturing', 'Services', 'Trading'].map((act) => {
                const isSelected = (unit.activity || '').toLowerCase() === act.toLowerCase();
                return (
                  <TouchableOpacity
                    key={act}
                    style={[styles.actBtn, isSelected && styles.actBtnSelected]}
                    onPress={() => handleFieldChange(idx, 'activity', act.toLowerCase())}
                  >
                    <Text style={[styles.actBtnText, isSelected && styles.actBtnTextSelected]}>
                      {act}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <FormField
              label="Main Product / Service at this Location"
              placeholder="e.g. Corrugated boxes / Cloud software development"
              value={unit.mainProduct}
              onChangeText={(v) => handleFieldChange(idx, 'mainProduct', v)}
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.btnAddUnit}
          onPress={addPlantUnit}
          activeOpacity={0.7}
        >
          <Text style={styles.btnAddUnitText}>+ Add Another Plant / Unit Location</Text>
        </TouchableOpacity>
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
          <Text style={styles.btnNextText}>CONTINUE TO BANK DETAILS →</Text>
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
  unitCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  btnDelete: { padding: 4 },
  btnDeleteText: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 4 },
  activityRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actBtnSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  actBtnText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  actBtnTextSelected: { color: COLORS.white, fontWeight: '700' },
  btnAddUnit: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnAddUnitText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
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
