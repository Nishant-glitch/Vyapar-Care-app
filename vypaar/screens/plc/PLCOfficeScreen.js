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
import { OFFICE_PREMISES_TYPES } from '../../config/plcDocumentConfig';
import {
  digitsOnly,
  hasErrors,
  validateRegisteredOffice,
} from '../../utils/plcValidation';

export default function PLCOfficeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateField, errors, setErrors, goNext, goPrev } = usePLCForm();
  const office = formData.office;

  const currentPremises =
    OFFICE_PREMISES_TYPES.find((p) => p.id === office.premisesType) ||
    OFFICE_PREMISES_TYPES[1];

  const handleNext = () => {
    const validationErrors = validateRegisteredOffice(office);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    goNext();
    navigation.navigate('PLCBusiness');
  };

  const handleBack = () => {
    goPrev();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Company Registration" onBack={handleBack} />

      {/* ---------- 7-Step Stepper ---------- */}
      <PLCStepper activeStep={3} />

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
            <Text style={styles.sectionTitle}>Step 4: Registered Office Details</Text>
            <Text style={styles.sectionSubtitle}>
              Select the premises ownership status and enter the official registered office address.
            </Text>
          </View>

          {/* ---------- Premises Ownership Status ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>
              Registered Office Status <Text style={styles.asterisk}>*</Text>
            </Text>
            <Text style={styles.cardSub}>
              Select whether the company office premises is owned, rented, or shared with consent.
            </Text>

            <View style={styles.premisesGrid}>
              {OFFICE_PREMISES_TYPES.map((type) => {
                const active = office.premisesType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    style={[styles.premisesCard, active && styles.premisesCardActive]}
                    onPress={() => updateField('office', 'premisesType', type.id)}
                  >
                    <Text style={styles.premisesIcon}>{type.icon}</Text>
                    <Text
                      style={[
                        styles.premisesLabel,
                        active && styles.premisesLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text style={styles.premisesDesc} numberOfLines={2}>
                      {type.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {errors.premisesType ? (
              <Text style={styles.error}>{errors.premisesType}</Text>
            ) : null}

            {/* Dynamic Documents Preview for this premises type */}
            <View style={styles.docChecklistBox}>
              <Text style={styles.docChecklistTitle}>
                Required Documents for {currentPremises.label} Office:
              </Text>
              {currentPremises.documents.map((doc, idx) => (
                <View key={doc.id || idx} style={styles.docChecklistRow}>
                  <Text style={styles.docChecklistCheck}>✓</Text>
                  <Text style={styles.docChecklistText}>{doc.label}</Text>
                </View>
              ))}
              <Text style={styles.docChecklistNote}>
                * You can upload these documents in Step 6 (Document Upload).
              </Text>
            </View>
          </View>

          {/* ---------- Address Fields ---------- */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Registered Office Address</Text>
            <Text style={styles.cardSub}>
              This will be the official communication address registered with MCA & Income Tax Department.
            </Text>

            <FormField
              label="Address Line 1 (Building / Flat / Plot No.)"
              required
              value={office.line1}
              onChangeText={(t) => updateField('office', 'line1', t)}
              placeholder="e.g. Unit 402, 4th Floor, Tower B, Business Park"
              error={errors.line1}
            />

            <FormField
              label="Address Line 2 (Street / Road / Sector)"
              value={office.line2}
              onChangeText={(t) => updateField('office', 'line2', t)}
              placeholder="e.g. Sector 62, Commercial Area"
              error={errors.line2}
            />

            <FormField
              label="Locality / Landmark"
              required
              value={office.locality}
              onChangeText={(t) => updateField('office', 'locality', t)}
              placeholder="e.g. Near Metro Station"
              error={errors.locality}
            />

            <SelectField
              label="State / UT"
              required
              value={office.state}
              options={INDIAN_STATES}
              onSelect={(code) => updateField('office', 'state', code)}
              searchable
              error={errors.state}
              placeholder="Select State"
            />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <FormField
                  label="City"
                  required
                  value={office.city}
                  onChangeText={(t) => updateField('office', 'city', t)}
                  placeholder="e.g. Noida"
                  error={errors.city}
                />
              </View>
              <View style={styles.halfCol}>
                <FormField
                  label="District"
                  required
                  value={office.district}
                  onChangeText={(t) => updateField('office', 'district', t)}
                  placeholder="e.g. Gautam Buddha Nagar"
                  error={errors.district}
                />
              </View>
            </View>

            <FormField
              label="PIN Code"
              required
              value={office.pincode}
              onChangeText={(t) => updateField('office', 'pincode', t)}
              format={(t) => digitsOnly(t, 6)}
              placeholder="6-digit PIN code"
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pincode}
            />

            {['rented', 'consent'].includes(office.premisesType) ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.cardSubHeading}>Property Owner / Landlord Information</Text>

                <FormField
                  label="Property Owner Full Name"
                  value={office.ownerName}
                  onChangeText={(t) => updateField('office', 'ownerName', t)}
                  placeholder="e.g. Rajesh Singhania"
                  error={errors.ownerName}
                />

                <FormField
                  label="Owner Contact / Mobile Number"
                  value={office.ownerContact}
                  onChangeText={(t) => updateField('office', 'ownerContact', t)}
                  format={(t) => digitsOnly(t, 10)}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={errors.ownerContact}
                />
              </>
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
          <Text style={styles.continueText}>CONTINUE TO BUSINESS DETAILS ›</Text>
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
  cardSubHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 8,
    marginBottom: 10,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginBottom: 14,
    lineHeight: 17,
  },
  asterisk: {
    color: COLORS.danger,
  },
  premisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  premisesCard: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    padding: 12,
  },
  premisesCardActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.lightBlue,
  },
  premisesIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  premisesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.grayText,
  },
  premisesLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  premisesDesc: {
    fontSize: 11,
    color: '#888888',
    marginTop: 3,
    lineHeight: 14,
  },
  docChecklistBox: {
    backgroundColor: '#F8FBF8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D5E8D4',
    marginTop: 6,
  },
  docChecklistTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#274E13',
    marginBottom: 8,
  },
  docChecklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  docChecklistCheck: {
    fontSize: 12,
    color: COLORS.whatsapp,
    fontWeight: 'bold',
    marginRight: 6,
    marginTop: 1,
  },
  docChecklistText: {
    flex: 1,
    fontSize: 12,
    color: '#333333',
    lineHeight: 16,
  },
  docChecklistNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.grayText,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 14,
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    marginBottom: 8,
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
