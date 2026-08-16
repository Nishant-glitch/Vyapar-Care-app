import React from 'react';
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
import ScreenHeader from '../../components/ScreenHeader';
import FSSAIStepper from '../../components/FSSAIStepper';
import { FormField, SelectField } from '../../components/FormField';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { validateFSSAIPremises } from '../../utils/fssaiValidation';

export default function FSSAIPremisesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, updatePremisesDetails, errors, setErrors } = useFSSAIForm();
  const { premisesDetails } = formState;

  const handleFieldChange = (field, value) => {
    updatePremisesDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateFSSAIPremises(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('FSSAIProducts');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 4 — Business Premises Details"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={4}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Physical Food Premises</Text>
          <Text style={styles.sectionSubtitle}>
            Provide the exact physical location where food is prepared, stored, served or sold.
          </Text>
        </View>

        {/* Premises Ownership Type */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>📍 Premises Ownership Type</Text>

          <View style={styles.premisesGrid}>
            {[
              { id: 'owned', label: 'Owned', icon: '🏠', hint: 'Property Deed / Tax' },
              { id: 'rented', label: 'Rented', icon: '📝', hint: 'Rent Agreement + NOC' },
              { id: 'leased', label: 'Leased', icon: '🏢', hint: 'Commercial Lease' },
              { id: 'shared', label: 'Shared / Consent', icon: '🤝', hint: 'Owner Consent Letter' },
              { id: 'other', label: 'Other', icon: '📍', hint: 'Establishment Proof' },
            ].map((p) => {
              const isSelected = premisesDetails.premisesType === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pTypeCard, isSelected && styles.pTypeCardActive]}
                  onPress={() => handleFieldChange('premisesType', p.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pTypeIcon}>{p.icon}</Text>
                  <Text style={[styles.pTypeLabel, isSelected && styles.pTypeLabelActive]}>
                    {p.label}
                  </Text>
                  <Text style={styles.pTypeHint}>{p.hint}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Address Fields */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>📫 Premises Complete Address</Text>

          <FormField
            label="Premises / Shop / Unit Name"
            required
            placeholder="e.g. Shop No. 4, Ground Floor, Central Market"
            value={premisesDetails.premisesName}
            onChangeText={(val) => handleFieldChange('premisesName', val)}
            error={errors.premisesName}
          />

          <FormField
            label="Address Line 1"
            required
            placeholder="Plot / House / Shop No., Building Name"
            value={premisesDetails.address1}
            onChangeText={(val) => handleFieldChange('address1', val)}
            error={errors.address1}
          />

          <FormField
            label="Address Line 2"
            placeholder="Street / Road / Main Market"
            value={premisesDetails.address2}
            onChangeText={(val) => handleFieldChange('address2', val)}
          />

          <FormField
            label="Locality / Sector / Landmark"
            placeholder="e.g. Near Metro Station Gate No. 2"
            value={premisesDetails.locality}
            onChangeText={(val) => handleFieldChange('locality', val)}
          />

          <View style={styles.rowTwo}>
            <View style={styles.colTwo}>
              <FormField
                label="City / Town"
                required
                placeholder="e.g. New Delhi"
                value={premisesDetails.city}
                onChangeText={(val) => handleFieldChange('city', val)}
                error={errors.city}
              />
            </View>
            <View style={styles.colTwo}>
              <FormField
                label="District"
                required
                placeholder="e.g. South Delhi"
                value={premisesDetails.district}
                onChangeText={(val) => handleFieldChange('district', val)}
                error={errors.district}
              />
            </View>
          </View>

          <SelectField
            label="State / UT"
            required
            options={INDIAN_STATES}
            value={premisesDetails.state}
            onValueChange={(val) => handleFieldChange('state', val)}
            error={errors.state}
          />

          <FormField
            label="PIN Code"
            required
            placeholder="e.g. 110001"
            keyboardType="number-pad"
            maxLength={6}
            value={premisesDetails.pinCode}
            onChangeText={(val) => handleFieldChange('pinCode', val)}
            error={errors.pinCode}
          />
        </View>

        {/* Verification Note */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>ℹ️</Text>
          <Text style={styles.infoBannerText}>
            FoSCoS Food Safety Officers (FSO) will verify this address during documentation scrutiny or on-site physical inspection.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>SAVE & CONTINUE →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  premisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pTypeCard: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  pTypeCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  pTypeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  pTypeLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  pTypeLabelActive: {
    color: COLORS.primaryDark,
  },
  pTypeHint: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  colTwo: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  infoBannerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  continueBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
