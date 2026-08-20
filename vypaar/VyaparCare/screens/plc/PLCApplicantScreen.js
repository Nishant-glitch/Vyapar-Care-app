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
import FormField, { DateField, SelectField } from '../../components/FormField';
import PLCStepper from '../../components/PLCStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { usePLCForm } from '../../contexts/PLCFormContext';
import {
  digitsOnly,
  formatPAN,
  hasErrors,
  maskAadhaar,
  validateApplicant,
} from '../../utils/plcValidation';

export default function PLCApplicantScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateField, errors, setErrors, goNext } = usePLCForm();
  const applicant = formData.applicant;

  const handleNext = () => {
    const validationErrors = validateApplicant(applicant);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    goNext();
    navigation.navigate('PLCCompany');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="Company Registration" />

      {/* ---------- 7-Step Stepper ---------- */}
      <PLCStepper activeStep={0} />

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
            <Text style={styles.sectionTitle}>Step 1: Primary Applicant Details</Text>
            <Text style={styles.sectionSubtitle}>
              Please enter personal details of the main promoter / primary contact person.
            </Text>
          </View>

          <View style={styles.card}>
            <FormField
              label="Full Name (as per PAN)"
              required
              value={applicant.fullName}
              onChangeText={(t) => updateField('applicant', 'fullName', t)}
              placeholder="e.g. Ramesh Kumar Sharma"
              autoCapitalize="words"
              error={errors.fullName}
            />

            <FormField
              label="Father's / Mother's Name"
              required
              value={applicant.parentName}
              onChangeText={(t) => updateField('applicant', 'parentName', t)}
              placeholder="e.g. Suresh Kumar Sharma"
              autoCapitalize="words"
              error={errors.parentName}
            />

            <DateField
              label="Date of Birth"
              required
              value={applicant.dob}
              onChange={(iso) => updateField('applicant', 'dob', iso)}
              placeholder="DD/MM/YYYY"
              error={errors.dob}
            />

            <FormField
              label="PAN Number"
              required
              value={applicant.pan}
              onChangeText={(t) => updateField('applicant', 'pan', t)}
              format={formatPAN}
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              maxLength={10}
              error={errors.pan}
              hint="10-character alphanumeric PAN issued by IT Department"
            />

            <FormField
              label="Aadhaar / National ID Number"
              required
              value={applicant.aadhaar}
              onChangeText={(t) => updateField('applicant', 'aadhaar', t)}
              displayValue={maskAadhaar(applicant.aadhaar)}
              format={(t) => digitsOnly(t, 12)}
              placeholder="12-digit Aadhaar Number"
              keyboardType="number-pad"
              maxLength={12}
              error={errors.aadhaar}
            />

            <FormField
              label="Mobile Number (OTP & Updates)"
              required
              value={applicant.mobile}
              onChangeText={(t) => updateField('applicant', 'mobile', t)}
              format={(t) => digitsOnly(t, 10)}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.mobile}
            />

            <FormField
              label="Email Address (Official Communications)"
              required
              value={applicant.email}
              onChangeText={(t) => updateField('applicant', 'email', t)}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <FormField
              label="Residential Address"
              required
              value={applicant.address}
              onChangeText={(t) => updateField('applicant', 'address', t)}
              placeholder="Flat / House No, Street, Landmark"
              multiline
              numberOfLines={3}
              error={errors.address}
            />

            <SelectField
              label="State / Union Territory"
              required
              value={applicant.state}
              options={INDIAN_STATES}
              onSelect={(code) => updateField('applicant', 'state', code)}
              searchable
              error={errors.state}
              placeholder="Select State"
            />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <FormField
                  label="City"
                  required
                  value={applicant.city}
                  onChangeText={(t) => updateField('applicant', 'city', t)}
                  placeholder="e.g. New Delhi"
                  error={errors.city}
                />
              </View>
              <View style={styles.halfCol}>
                <FormField
                  label="District"
                  required
                  value={applicant.district}
                  onChangeText={(t) => updateField('applicant', 'district', t)}
                  placeholder="e.g. South Delhi"
                  error={errors.district}
                />
              </View>
            </View>

            <FormField
              label="PIN Code"
              required
              value={applicant.pincode}
              onChangeText={(t) => updateField('applicant', 'pincode', t)}
              format={(t) => digitsOnly(t, 6)}
              placeholder="6-digit PIN code"
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pincode}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- Sticky Bottom CTA ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.continueText}>SAVE & CONTINUE ›</Text>
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
