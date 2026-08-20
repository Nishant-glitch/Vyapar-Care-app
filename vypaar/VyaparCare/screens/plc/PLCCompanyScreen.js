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
import FormField, { SelectField } from '../../components/FormField';
import PLCStepper from '../../components/PLCStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { usePLCForm } from '../../contexts/PLCFormContext';
import {
  BUSINESS_ACTIVITIES,
  CAPITAL_PRESETS,
} from '../../config/plcDocumentConfig';
import {
  digitsOnly,
  formatCurrency,
  hasErrors,
  validateCompanyDetails,
} from '../../utils/plcValidation';

export default function PLCCompanyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateField,
    setDirectorCount,
    setSubscriberCount,
    errors,
    setErrors,
    goNext,
    goPrev,
  } = usePLCForm();

  const company = formData.company;

  const handleNext = () => {
    const validationErrors = validateCompanyDetails(company);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    goNext();
    navigation.navigate('PLCDirectors');
  };

  const handleBack = () => {
    goPrev();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="Company Registration" onBack={handleBack} />

      {/* ---------- 7-Step Stepper ---------- */}
      <PLCStepper activeStep={1} />

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
            <Text style={styles.sectionTitle}>Step 2: Proposed Company Details</Text>
            <Text style={styles.sectionSubtitle}>
              Provide name choices, capital structure, registered state, and director/shareholder counts.
            </Text>
          </View>

          {/* ---------- Proposed Names Card ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Proposed Company Names (RUN / SPICe+)</Text>
            <Text style={styles.cardSub}>
              Give 2 distinct name options ending with 'Private Limited'. MCA approves the first available name.
            </Text>

            <FormField
              label="Proposed Name — Option 1 (Primary Preference)"
              required
              value={company.proposedName1}
              onChangeText={(t) => updateField('company', 'proposedName1', t)}
              placeholder="e.g. Acme Technologies Private Limited"
              error={errors.proposedName1}
              hint="Must be unique and not clash with existing registered companies or trademarks."
            />

            <FormField
              label="Proposed Name — Option 2 (Secondary Preference)"
              required
              value={company.proposedName2}
              onChangeText={(t) => updateField('company', 'proposedName2', t)}
              placeholder="e.g. Acme Innovations Private Limited"
              error={errors.proposedName2}
            />

            <SelectField
              label="Registered Office State (ROC Jurisdiction)"
              required
              value={company.registeredState}
              options={INDIAN_STATES}
              onSelect={(code) => updateField('company', 'registeredState', code)}
              searchable
              error={errors.registeredState}
              placeholder="Select State"
            />

            <SelectField
              label="Main Business Activity"
              required
              value={company.mainActivity}
              options={BUSINESS_ACTIVITIES}
              onSelect={(val) => updateField('company', 'mainActivity', val)}
              error={errors.mainActivity}
              placeholder="Select Primary Activity"
            />

            <FormField
              label="Brief Business Objects / Description"
              required
              value={company.description}
              onChangeText={(t) => updateField('company', 'description', t)}
              placeholder="Describe the main business objects (e.g. IT solutions, consulting, e-commerce)..."
              multiline
              numberOfLines={4}
              error={errors.description}
            />
          </View>

          {/* ---------- Capital Structure Card ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Share Capital Structure</Text>

            {/* Zero MCA fee banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerIcon}>💡</Text>
              <Text style={styles.infoBannerText}>
                <Text style={styles.bold}>Zero MCA Filing Fee:</Text> For authorized capital up to ₹15,00,000, Government MCA filing fees are completely waived under the SPICe+ scheme.
              </Text>
            </View>

            <Text style={styles.fieldLabel}>
              Authorized Share Capital <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.presetsRow}>
              {CAPITAL_PRESETS.slice(0, 4).map((preset) => {
                const active = Number(company.authorizedCapital) === preset.value;
                return (
                  <Pressable
                    key={preset.value}
                    style={[styles.presetChip, active && styles.presetChipActive]}
                    onPress={() => {
                      updateField('company', 'authorizedCapital', preset.value);
                      if (Number(company.paidUpCapital) > preset.value) {
                        updateField('company', 'paidUpCapital', preset.value);
                      }
                    }}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>
                      {formatCurrency(preset.value)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <FormField
              label="Custom Authorized Capital Amount (₹)"
              required
              value={String(company.authorizedCapital || '')}
              onChangeText={(t) => updateField('company', 'authorizedCapital', Number(digitsOnly(t)))}
              keyboardType="number-pad"
              placeholder="100000"
              error={errors.authorizedCapital}
              displayValue={formatCurrency(company.authorizedCapital)}
            />

            <FormField
              label="Paid-up Share Capital Amount (₹)"
              required
              value={String(company.paidUpCapital || '')}
              onChangeText={(t) => updateField('company', 'paidUpCapital', Number(digitsOnly(t)))}
              keyboardType="number-pad"
              placeholder="100000"
              error={errors.paidUpCapital}
              displayValue={formatCurrency(company.paidUpCapital)}
              hint="Amount initially invested by shareholders (must be ≤ Authorized Capital)."
            />
          </View>

          {/* ---------- Directors & Shareholders Counts Card ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Directors & Shareholders Count</Text>

            {/* Stepper for Director Count */}
            <View style={styles.counterRow}>
              <View style={styles.counterTextWrap}>
                <Text style={styles.counterTitle}>Number of Directors</Text>
                <Text style={styles.counterSub}>Minimum 2 required by law (up to 15)</Text>
                {errors.directorCount ? (
                  <Text style={styles.error}>{errors.directorCount}</Text>
                ) : null}
              </View>

              <View style={styles.stepperWrap}>
                <Pressable
                  style={[styles.stepperBtn, company.directorCount <= 2 && styles.stepperBtnDisabled]}
                  onPress={() => setDirectorCount(company.directorCount - 1)}
                  disabled={company.directorCount <= 2}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </Pressable>

                <Text style={styles.stepperValue}>{company.directorCount}</Text>

                <Pressable
                  style={[styles.stepperBtn, company.directorCount >= 15 && styles.stepperBtnDisabled]}
                  onPress={() => setDirectorCount(company.directorCount + 1)}
                  disabled={company.directorCount >= 15}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Stepper for Subscriber Count */}
            <View style={styles.counterRow}>
              <View style={styles.counterTextWrap}>
                <Text style={styles.counterTitle}>Number of Shareholders / Subscribers</Text>
                <Text style={styles.counterSub}>Minimum 2 required (usually directors themselves)</Text>
                {errors.subscriberCount ? (
                  <Text style={styles.error}>{errors.subscriberCount}</Text>
                ) : null}
              </View>

              <View style={styles.stepperWrap}>
                <Pressable
                  style={[styles.stepperBtn, company.subscriberCount <= 2 && styles.stepperBtnDisabled]}
                  onPress={() => setSubscriberCount(company.subscriberCount - 1)}
                  disabled={company.subscriberCount <= 2}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </Pressable>

                <Text style={styles.stepperValue}>{company.subscriberCount}</Text>

                <Pressable
                  style={[styles.stepperBtn, company.subscriberCount >= 200 && styles.stepperBtnDisabled]}
                  onPress={() => setSubscriberCount(company.subscriberCount + 1)}
                  disabled={company.subscriberCount >= 200}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- Sticky Bottom CTA ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.continueText}>CONTINUE TO DIRECTORS ›</Text>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF5FB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D4E6F1',
  },
  infoBannerIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#2471A3',
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  asterisk: {
    color: COLORS.danger,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  presetChipActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.lightBlue,
  },
  presetText: {
    fontSize: 12,
    color: COLORS.grayText,
  },
  presetTextActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  counterTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  counterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  counterSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9F9',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  stepperValue: {
    width: 42,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
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
