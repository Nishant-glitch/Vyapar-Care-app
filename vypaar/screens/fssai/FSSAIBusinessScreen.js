import React from 'react';
import {
  Platform,
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
import { FormField, SelectField, ToggleField } from '../../components/FormField';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { validateFSSAIBusiness } from '../../utils/fssaiValidation';

export default function FSSAIBusinessScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, updateBusinessDetails, errors, setErrors } = useFSSAIForm();
  const { businessDetails } = formState;

  const handleFieldChange = (field, value) => {
    updateBusinessDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateFSSAIBusiness(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('FSSAIPremises');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 3 — Food Business Details"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={3}
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
          <Text style={styles.sectionTitle}>Food Business Operations</Text>
          <Text style={styles.sectionSubtitle}>
            Provide commercial and operational details of the food enterprise.
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>🏪 Business & Operating Scope</Text>

          <FormField
            label="Food Business / Brand Name"
            required
            placeholder="e.g. Haldiram Sweets & Restaurant"
            value={businessDetails.foodBusinessName}
            onChangeText={(val) => handleFieldChange('foodBusinessName', val)}
            error={errors.foodBusinessName}
          />

          <FormField
            label="Nature of Food Business"
            placeholder="e.g. Casual Dining Restaurant & Sweet Counter"
            value={businessDetails.natureOfBusiness}
            onChangeText={(val) => handleFieldChange('natureOfBusiness', val)}
          />

          <FormField
            label="Specific Food Activity / Cuisines"
            placeholder="e.g. North Indian, Chinese, Chaat, Bakery, Sweets"
            value={businessDetails.activity}
            onChangeText={(val) => handleFieldChange('activity', val)}
          />

          <View style={styles.rowTwo}>
            <View style={styles.colTwo}>
              <FormField
                label="Business Start Date"
                placeholder="DD/MM/YYYY"
                value={businessDetails.businessStartDate}
                onChangeText={(val) => handleFieldChange('businessStartDate', val)}
                hint="Date operations began / will begin"
              />
            </View>
            <View style={styles.colTwo}>
              <FormField
                label="Total Food Handlers"
                placeholder="e.g. 8"
                keyboardType="number-pad"
                value={businessDetails.employeeCount}
                onChangeText={(val) => handleFieldChange('employeeCount', val)}
                hint="Kitchen & service staff"
              />
            </View>
          </View>

          <SelectField
            label="Annual Turnover Bracket"
            required
            options={[
              { id: 'up_to_12_lakh', label: 'Petty Food Business (Up to ₹12 Lakh / year)' },
              { id: '12_to_20_cr', label: 'Standard Turnover (₹12 Lakh to ₹20 Crore / year)' },
              { id: 'above_20_cr', label: 'Large Enterprise (Above ₹20 Crore / year)' },
            ]}
            value={businessDetails.annualTurnover}
            onValueChange={(val) => handleFieldChange('annualTurnover', val)}
            error={errors.annualTurnover}
          />

          <FormField
            label="Official Website / Social Media URL"
            placeholder="https://myfoodbusiness.com"
            keyboardType="url"
            autoCapitalize="none"
            value={businessDetails.website}
            onChangeText={(val) => handleFieldChange('website', val)}
          />
        </View>

        {/* Operating Status & Application Type */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>⚙️ Status & Application Scope</Text>

          <ToggleField
            label="Is the food business currently operational at this location?"
            value={businessDetails.isCurrentlyOperating}
            onValueChange={(val) => handleFieldChange('isCurrentlyOperating', val)}
            yesLabel="Yes, Operating"
            noLabel="No, Proposed"
          />

          <View style={styles.appTypeSection}>
            <Text style={styles.appTypeLabel}>Application Type:</Text>
            <View style={styles.appTypeGrid}>
              {[
                { id: 'new', label: 'New Application', desc: 'First-time registration' },
                { id: 'renewal', label: 'Renewal', desc: 'Renew existing license' },
                { id: 'modification', label: 'Modification', desc: 'Update details / category' },
              ].map((item) => {
                const active = businessDetails.applicationType === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.appTypeCard, active && styles.appTypeCardActive]}
                    onPress={() => handleFieldChange('applicationType', item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.appTypeTitle, active && styles.appTypeTitleActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.appTypeDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  colTwo: {
    flex: 1,
  },
  appTypeSection: {
    marginTop: 10,
  },
  appTypeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  appTypeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  appTypeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  appTypeCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  appTypeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 2,
  },
  appTypeTitleActive: {
    color: COLORS.primaryDark,
  },
  appTypeDesc: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
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
