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
import { validateUdyamAddress } from '../../utils/udyamValidation';

export default function UdyamAddressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateOfficialAddress } = useUdyamForm();
  const [errors, setErrors] = useState({});

  const addr = formData.officialAddress || {};

  const handleChange = (key, val) => {
    updateOfficialAddress({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateUdyamAddress(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('UdyamUnits');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Official Address" />
      <UdyamStepper currentStep={5} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📍 Step 5: Official & Registered Office Address</Text>
          <Text style={styles.bannerSubtitle}>
            This address will be printed on the official Udyam Certificate.
          </Text>
        </View>

        <FormField
          label="Flat / Door / Block / Building No. *"
          placeholder="e.g. Flat 302, Block B / Shop No. 12"
          value={addr.flatDoorBlock}
          onChangeText={(v) => handleChange('flatDoorBlock', v)}
          error={errors.flatDoorBlock}
        />

        <FormField
          label="Name of Premises / Building / Complex"
          placeholder="e.g. Prestige Tech Park"
          value={addr.premisesName}
          onChangeText={(v) => handleChange('premisesName', v)}
        />

        <FormField
          label="Road / Street / Locality *"
          placeholder="e.g. MG Road, Sector 18"
          value={addr.roadStreet}
          onChangeText={(v) => handleChange('roadStreet', v)}
          error={errors.roadStreet}
        />

        <FormField
          label="Area / Locality / Village"
          placeholder="e.g. Connaught Place"
          value={addr.locality}
          onChangeText={(v) => handleChange('locality', v)}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="City / Town *"
              placeholder="e.g. New Delhi"
              value={addr.city}
              onChangeText={(v) => handleChange('city', v)}
              error={errors.city}
            />
          </View>
          <View style={styles.half}>
            <FormField
              label="District"
              placeholder="e.g. Central Delhi"
              value={addr.district}
              onChangeText={(v) => handleChange('district', v)}
            />
          </View>
        </View>

        <FormField
          label="PIN Code (6 Digits) *"
          placeholder="110001"
          value={addr.pinCode}
          onChangeText={(v) => handleChange('pinCode', v)}
          keyboardType="number-pad"
          maxLength={6}
          error={errors.pinCode}
        />

        <View style={styles.divider} />

        {/* Primary Address Question */}
        <Text style={styles.sectionHeader}>Is this also your primary operating business address?</Text>
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[
              styles.choiceCard,
              addr.isPrimaryBusinessAddress && styles.choiceCardSelected,
            ]}
            onPress={() => handleChange('isPrimaryBusinessAddress', true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.choiceText,
                addr.isPrimaryBusinessAddress && styles.choiceTextSelected,
              ]}
            >
              Yes, Same Address
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.choiceCard,
              !addr.isPrimaryBusinessAddress && styles.choiceCardSelected,
            ]}
            onPress={() => handleChange('isPrimaryBusinessAddress', false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.choiceText,
                !addr.isPrimaryBusinessAddress && styles.choiceTextSelected,
              ]}
            >
              No, Plants/Units are elsewhere
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
          <Text style={styles.btnNextText}>CONTINUE TO PLANT / UNITS →</Text>
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
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 18 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  choiceRow: { flexDirection: 'row', gap: 10 },
  choiceCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  choiceCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  choiceText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  choiceTextSelected: { color: '#0369A1', fontWeight: '700' },
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
