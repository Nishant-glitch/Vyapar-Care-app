import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField, { DateField, MultiSelectField, SelectField, ToggleField } from '../../components/FormField';
import PLCStepper from '../../components/PLCStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { usePLCForm } from '../../contexts/PLCFormContext';
import {
  BUSINESS_ACTIVITIES,
  DYNAMIC_ACTIVITY_FIELDS,
  NATURE_OF_BUSINESS_OPTIONS,
  TURNOVER_BRACKETS,
} from '../../config/plcDocumentConfig';
import {
  hasErrors,
  validateBusinessDetails,
} from '../../utils/plcValidation';

export default function PLCBusinessScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateField,
    updateBusinessAdditionalField,
    errors,
    setErrors,
    goNext,
    goPrev,
  } = usePLCForm();

  const business = formData.business;
  const dynamicFieldDefs = DYNAMIC_ACTIVITY_FIELDS[business.mainActivity] || [];

  const handleNext = () => {
    const validationErrors = validateBusinessDetails(business, dynamicFieldDefs);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    goNext();
    navigation.navigate('PLCDocuments');
  };

  const handleBack = () => {
    goPrev();
    navigation.goBack();
  };

  const handleNatureToggle = (optionId) => {
    const current = business.natureOfBusiness || [];
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    updateField('business', 'natureOfBusiness', next);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="Company Registration" onBack={handleBack} />

      {/* ---------- 7-Step Stepper ---------- */}
      <PLCStepper activeStep={4} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={styles.sectionTitle}>Step 5: Business Activities & Details</Text>
            <Text style={styles.sectionSubtitle}>
              Specify your industry sector, commercial activities, turnover expectations, and specialized operational details.
            </Text>
          </View>

          {/* ---------- General Business Activities ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Primary Business Information</Text>

            <SelectField
              label="Main Activity Sector"
              required
              value={business.mainActivity}
              options={BUSINESS_ACTIVITIES}
              onSelect={(val) => {
                updateField('business', 'mainActivity', val);
                updateField('company', 'mainActivity', val);
              }}
              error={errors.mainActivity}
            />

            <MultiSelectField
              label="Nature of Business (Select all that apply)"
              required
              options={NATURE_OF_BUSINESS_OPTIONS}
              values={business.natureOfBusiness}
              onToggle={handleNatureToggle}
              error={errors.natureOfBusiness}
              hint="Tap tags to select business models you plan to operate."
            />

            <FormField
              label="Primary Products / Services Offered"
              required
              value={business.productsServices}
              onChangeText={(t) => updateField('business', 'productsServices', t)}
              placeholder="e.g. Mobile app development, SaaS subscription, IT consulting"
              error={errors.productsServices}
            />

            <FormField
              label="Detailed Business Description (Main Object Clause)"
              required
              value={business.description}
              onChangeText={(t) => updateField('business', 'description', t)}
              placeholder="Describe what your company intends to manufacture, trade, or provide..."
              multiline
              numberOfLines={4}
              error={errors.description}
              hint="This description will be drafted into the company's Memorandum of Association (MOA)."
            />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <FormField
                  label="Primary Product / Service Name"
                  value={business.primaryProduct}
                  onChangeText={(t) => updateField('business', 'primaryProduct', t)}
                  placeholder="e.g. Cloud ERP"
                  error={errors.primaryProduct}
                />
              </View>
              <View style={styles.halfCol}>
                <FormField
                  label="HSN / SAC Code (if known)"
                  value={business.hsnSac}
                  onChangeText={(t) => updateField('business', 'hsnSac', t)}
                  placeholder="e.g. 998314"
                  error={errors.hsnSac}
                />
              </View>
            </View>

            <SelectField
              label="Expected Annual Turnover in Year 1"
              required
              value={business.turnover}
              options={TURNOVER_BRACKETS}
              onSelect={(val) => updateField('business', 'turnover', val)}
              error={errors.turnover}
            />

            <DateField
              label="Proposed Business Start Date"
              required
              value={business.startDate}
              onChange={(iso) => updateField('business', 'startDate', iso)}
              placeholder="DD/MM/YYYY"
              minYear={new Date().getFullYear() - 1}
              maxYear={new Date().getFullYear() + 2}
              error={errors.startDate}
            />

            <FormField
              label="Company Website / Domain (if any)"
              value={business.website}
              onChangeText={(t) => updateField('business', 'website', t)}
              placeholder="https://example.com"
              keyboardType="url"
              autoCapitalize="none"
              error={errors.website}
            />
          </View>

          {/* ---------- Dynamic Industry-Specific Fields ---------- */}
          {dynamicFieldDefs.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>
                Industry-Specific Details ({BUSINESS_ACTIVITIES.find((a) => a.id === business.mainActivity)?.label})
              </Text>
              <Text style={styles.cardSub}>
                Additional information required for statutory classification and ROC compliance.
              </Text>

              {dynamicFieldDefs.map((field) => {
                const val = business.additionalFields?.[field.key] || '';
                const err = errors[`additional_${field.key}`];

                if (field.type === 'select') {
                  return (
                    <SelectField
                      key={field.key}
                      label={field.label}
                      required={field.required}
                      value={val}
                      options={field.options}
                      onSelect={(opt) => updateBusinessAdditionalField(field.key, opt)}
                      placeholder={field.placeholder}
                      error={err}
                    />
                  );
                }

                return (
                  <FormField
                    key={field.key}
                    label={field.label}
                    required={field.required}
                    value={val}
                    onChangeText={(t) => updateBusinessAdditionalField(field.key, t)}
                    placeholder={field.placeholder}
                    error={err}
                  />
                );
              })}
            </View>
          ) : null}

          {/* ---------- Existing Business Conversion ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Existing Business Takeover / Conversion</Text>
            <ToggleField
              label="Is this company taking over or converting an existing Proprietorship or Partnership firm?"
              value={business.isExistingBusiness}
              onValueChange={(val) => updateField('business', 'isExistingBusiness', val)}
              yesLabel="Yes"
              noLabel="No, Brand New Startup"
            />

            {business.isExistingBusiness ? (
              <FormField
                label="Existing Firm Name & GSTIN / Registration"
                value={business.existingBusinessDetails}
                onChangeText={(t) => updateField('business', 'existingBusinessDetails', t)}
                placeholder="Enter existing trade name, proprietor name, and GSTIN..."
                multiline
                numberOfLines={3}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- Sticky Bottom CTA ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.continueText}>CONTINUE TO DOCUMENTS ›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  pressed: {
    opacity: 0.85,
  },
  headerBlock: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 3,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginBottom: 14,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  continueButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
