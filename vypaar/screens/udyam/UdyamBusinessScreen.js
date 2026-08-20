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
import {
  UDYAM_MAJOR_ACTIVITIES,
  UDYAM_ORGANISATION_TYPES,
} from '../../config/udyamConfig';
import { COLORS } from '../../constants/theme';
import { useUdyamForm } from '../../contexts/UdyamFormContext';
import { validateUdyamBusiness } from '../../utils/udyamValidation';

export default function UdyamBusinessScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateBusinessDetails } = useUdyamForm();
  const [errors, setErrors] = useState({});

  const details = formData.businessDetails || {};

  const handleChange = (key, val) => {
    updateBusinessDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateUdyamBusiness(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('UdyamOrganisation');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Enterprise Details" />
      <UdyamStepper currentStep={3} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏢 Step 3: Enterprise & Organisation Type</Text>
          <Text style={styles.bannerSubtitle}>
            Specify your legal enterprise name, constitution type and primary business activity.
          </Text>
        </View>

        <FormField
          label="Name of Enterprise *"
          placeholder="e.g. Apex Innovations / Apex Technologies"
          value={details.enterpriseName}
          onChangeText={(v) => handleChange('enterpriseName', v)}
          error={errors.enterpriseName}
          helperText="As it will appear on your official Udyam Certificate"
        />

        <FormField
          label="Trade Name (Store / Brand Name)"
          placeholder="e.g. Apex Super Mart"
          value={details.tradeName}
          onChangeText={(v) => handleChange('tradeName', v)}
          helperText="Optional signboard or brand name"
        />

        <FormField
          label="Date of Commencement of Business (YYYY-MM-DD) *"
          placeholder="2026-01-15"
          value={details.commencementDate}
          onChangeText={(v) => handleChange('commencementDate', v)}
          error={errors.commencementDate}
        />

        <View style={styles.divider} />

        {/* Organisation Type Grid */}
        <Text style={styles.sectionHeader}>Type of Organisation *</Text>
        {errors.organisationType && (
          <Text style={styles.errorText}>⚠️ {errors.organisationType}</Text>
        )}

        <View style={styles.orgGrid}>
          {UDYAM_ORGANISATION_TYPES.map((org) => {
            const isSelected = details.organisationType === org.id;
            return (
              <TouchableOpacity
                key={org.id}
                style={[styles.orgCard, isSelected && styles.orgCardSelected]}
                onPress={() => handleChange('organisationType', org.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.orgIcon}>{org.icon}</Text>
                <Text style={[styles.orgLabel, isSelected && styles.orgLabelSelected]}>
                  {org.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Major Activity Selector */}
        <Text style={styles.sectionHeader}>Major Activity of Enterprise *</Text>
        {errors.majorActivity && (
          <Text style={styles.errorText}>⚠️ {errors.majorActivity}</Text>
        )}

        <View style={styles.actList}>
          {UDYAM_MAJOR_ACTIVITIES.map((act) => {
            const isSelected = details.majorActivity === act.id;
            return (
              <TouchableOpacity
                key={act.id}
                style={[styles.actItem, isSelected && styles.actItemSelected]}
                onPress={() => handleChange('majorActivity', act.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.actIcon}>{act.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actTitle, isSelected && styles.actTitleSelected]}>
                    {act.label}
                  </Text>
                  <Text style={styles.actDesc}>{act.desc}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
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
          <Text style={styles.btnNextText}>CONTINUE TO ORGANISATION DETAILS →</Text>
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
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#3730A3', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#4338CA', lineHeight: 18 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 18 },
  orgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  orgCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  orgCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  orgIcon: { fontSize: 24, marginBottom: 4 },
  orgLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  orgLabelSelected: { color: '#0369A1', fontWeight: '700' },
  actList: { gap: 10 },
  actItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  actItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  actIcon: { fontSize: 22, marginRight: 12 },
  actTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  actTitleSelected: { color: '#0369A1' },
  actDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
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
