import React, { useState } from 'react';
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
import FormField, { DateField, SelectField } from '../../components/FormField';
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import {
  digitsOnly,
  formatPAN,
  hasErrors,
  maskAadhaar,
  validateAadhaar,
  validateApplicant,
  validateEmail,
  validateMobile,
  validatePAN,
  validatePIN,
} from '../../utils/gstValidation';

/** Step 0 — applicant (proprietor / authorised signatory) ki details */
export default function GSTApplicantScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateField, errors, setErrors, goNext } = useGSTForm();

  const applicant = formData.applicant;

  // errors sirf "Next" dabaane ke baad dikhein — typing ke waqt nahi
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (value) => updateField('applicant', key, value);
  const errorFor = (key) => (submitted ? errors[key] : undefined);

  const handleNext = () => {
    const found = validateApplicant(applicant);
    setErrors(found);
    setSubmitted(true);

    if (hasErrors(found)) {
      console.log('Applicant validation failed:', Object.keys(found).join(', '));
      return;
    }

    console.log('Navigate to GST Business Details');
    const next = goNext();
    navigation.navigate(next.route);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="GST Registration" />
      <GSTStepper activeStep={0} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Applicant Details</Text>
          <Text style={styles.sectionHint}>
            Proprietor ya authorised signatory ki details — PAN aur Aadhaar se hi
            verification hota hai.
          </Text>

          <FormField
            label="Full Name"
            required
            value={applicant.fullName}
            onChangeText={set('fullName')}
            error={errorFor('fullName')}
            valid={applicant.fullName.trim().length >= 3}
            placeholder="PAN card jaisa naam"
            autoCapitalize="words"
          />

          <FormField
            label="Father's / Mother's Name"
            required
            value={applicant.parentName}
            onChangeText={set('parentName')}
            error={errorFor('parentName')}
            valid={applicant.parentName.trim().length >= 3}
            placeholder="Pita / mata ka naam"
            autoCapitalize="words"
          />

          <DateField
            label="Date of Birth"
            required
            value={applicant.dob}
            onChange={set('dob')}
            error={errorFor('dob')}
            maxYear={new Date().getFullYear()}
          />

          <FormField
            label="PAN Number"
            required
            value={applicant.pan}
            onChangeText={set('pan')}
            error={errorFor('pan')}
            valid={validatePAN(applicant.pan)}
            placeholder="ABCDE1234F"
            autoCapitalize="characters"
            maxLength={10}
            format={formatPAN}
            hint="10 character — 5 letters, 4 digits, 1 letter"
          />

          <FormField
            label="Aadhaar Number"
            required
            value={applicant.aadhaar}
            onChangeText={set('aadhaar')}
            error={errorFor('aadhaar')}
            valid={validateAadhaar(applicant.aadhaar)}
            placeholder="12 digit Aadhaar"
            keyboardType="number-pad"
            maxLength={12}
            format={(text) => digitsOnly(text, 12)}
            // focus hatte hi masked — screen pe poora number khula nahi rehta
            displayValue={maskAadhaar(applicant.aadhaar)}
          />

          <FormField
            label="Mobile Number"
            required
            value={applicant.mobile}
            onChangeText={set('mobile')}
            error={errorFor('mobile')}
            valid={validateMobile(applicant.mobile)}
            placeholder="10 digit mobile"
            keyboardType="number-pad"
            maxLength={10}
            format={(text) => digitsOnly(text, 10)}
          />

          <FormField
            label="Email Address"
            required
            value={applicant.email}
            onChangeText={set('email')}
            error={errorFor('email')}
            valid={validateEmail(applicant.email)}
            placeholder="naam@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            label="Residential Address"
            required
            value={applicant.address}
            onChangeText={set('address')}
            error={errorFor('address')}
            valid={applicant.address.trim().length > 5}
            placeholder="House / street / area / landmark"
            multiline
          />

          <SelectField
            label="State"
            required
            value={applicant.state}
            options={INDIAN_STATES}
            onSelect={set('state')}
            error={errorFor('state')}
            placeholder="State chuniye"
            searchable
          />

          <FormField
            label="District"
            required
            value={applicant.district}
            onChangeText={set('district')}
            error={errorFor('district')}
            valid={applicant.district.trim().length > 2}
            placeholder="District ka naam"
            autoCapitalize="words"
          />

          <FormField
            label="PIN Code"
            required
            value={applicant.pincode}
            onChangeText={set('pincode')}
            error={errorFor('pincode')}
            valid={validatePIN(applicant.pincode)}
            placeholder="6 digit PIN"
            keyboardType="number-pad"
            maxLength={6}
            format={(text) => digitsOnly(text, 6)}
          />

          {submitted && hasErrors(errors) ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                {Object.keys(errors).length} field theek karne hain.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- fixed footer ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>NEXT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  pressed: {
    opacity: 0.85,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 18,
  },

  errorBanner: {
    backgroundColor: '#FDECEA',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  errorBannerText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
