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
import DocumentUploadCard from '../../components/DocumentUploadCard';
import FormField, { SelectField } from '../../components/FormField';
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { PREMISES_TYPES } from '../../config/gstDocumentConfig';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { digitsOnly, hasErrors, validateAddress, validatePIN } from '../../utils/gstValidation';

/** Step 2 — principal place of business ka address + premises proof */
export default function GSTAddressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateField, setTopLevel, documents, errors, setErrors, goNext } =
    useGSTForm();
  const { upload, remove, progress, errors: uploadErrors, isUploading } =
    useDocumentUpload();

  const address = formData.address;
  const premisesType = formData.premisesType;
  const [submitted, setSubmitted] = useState(false);

  // premises type badalte hi ye list apne aap badal jaati hai
  const addressDocs = documents.filter((doc) => doc.source === 'premises');

  const set = (key) => (value) => updateField('address', key, value);
  const errorFor = (key) => (submitted ? errors[key] : undefined);

  const handlePremisesChange = (typeId) => {
    console.log(`Premises type selected: ${typeId}`);
    setTopLevel('premisesType', typeId);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.premisesType;
      delete next.documents;
      return next;
    });
  };

  const handleNext = () => {
    const found = validateAddress(address, premisesType, addressDocs);
    setErrors(found);
    setSubmitted(true);

    if (hasErrors(found)) {
      console.log('Address validation failed:', Object.keys(found).join(', '));
      return;
    }

    console.log('Navigate to GST Bank Details');
    const next = goNext();
    navigation.navigate(next.route);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="GST Registration" />
      <GSTStepper activeStep={2} />

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
          <Text style={styles.sectionTitle}>Principal Place of Business</Text>
          <Text style={styles.sectionHint}>
            Jahan se business chalta hai — GST certificate pe yahi address aata hai.
          </Text>

          <FormField
            label="Address Line 1"
            required
            value={address.line1}
            onChangeText={set('line1')}
            error={errorFor('line1')}
            valid={address.line1.trim().length > 3}
            placeholder="Building / shop number, street"
          />

          <FormField
            label="Address Line 2"
            value={address.line2}
            onChangeText={set('line2')}
            placeholder="Landmark, floor (optional)"
          />

          <FormField
            label="Locality"
            required
            value={address.locality}
            onChangeText={set('locality')}
            error={errorFor('locality')}
            valid={address.locality.trim().length > 2}
            placeholder="Area / colony"
          />

          <FormField
            label="City"
            required
            value={address.city}
            onChangeText={set('city')}
            error={errorFor('city')}
            valid={address.city.trim().length > 2}
            placeholder="City ka naam"
            autoCapitalize="words"
          />

          <FormField
            label="District"
            required
            value={address.district}
            onChangeText={set('district')}
            error={errorFor('district')}
            valid={address.district.trim().length > 2}
            placeholder="District ka naam"
            autoCapitalize="words"
          />

          <SelectField
            label="State"
            required
            value={address.state}
            options={INDIAN_STATES}
            onSelect={set('state')}
            error={errorFor('state')}
            placeholder="State chuniye"
            searchable
          />

          <FormField
            label="PIN Code"
            required
            value={address.pincode}
            onChangeText={set('pincode')}
            error={errorFor('pincode')}
            valid={validatePIN(address.pincode)}
            placeholder="6 digit PIN"
            keyboardType="number-pad"
            maxLength={6}
            format={(text) => digitsOnly(text, 6)}
          />

          {/* ---------- premises type ---------- */}
          <View style={styles.premisesBlock}>
            <Text style={styles.fieldLabel}>
              Premises Type <Text style={styles.asterisk}>*</Text>
            </Text>

            <View style={styles.premisesGrid}>
              {PREMISES_TYPES.map((type) => {
                const active = type.id === premisesType;
                return (
                  <Pressable
                    key={type.id}
                    style={({ pressed }) => [
                      styles.premisesCard,
                      active && styles.premisesCardActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handlePremisesChange(type.id)}
                  >
                    <Text style={styles.premisesIcon}>{type.icon}</Text>
                    <Text
                      style={[styles.premisesLabel, active && styles.premisesLabelActive]}
                      numberOfLines={2}
                    >
                      {type.label}
                    </Text>
                    {active ? <Text style={styles.premisesCheck}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>

            {errorFor('premisesType') ? (
              <Text style={styles.errorText}>{errorFor('premisesType')}</Text>
            ) : null}
          </View>

          {/* ---------- premises ke documents ---------- */}
          {premisesType ? (
            <View style={styles.docsBlock}>
              <Text style={styles.docsTitle}>Address Proof Documents</Text>
              <Text style={styles.docsHint}>
                {PREMISES_TYPES.find((p) => p.id === premisesType)?.label} premises ke
                liye ye documents chahiye.
              </Text>

              {addressDocs.map((doc) => (
                <DocumentUploadCard
                  key={doc.id}
                  document={doc}
                  file={doc.file}
                  uploading={isUploading(doc.id)}
                  progress={progress[doc.id] || 0}
                  error={uploadErrors[doc.id]}
                  showLimits
                  onUpload={() => upload(doc.id, { fallbackName: doc.id })}
                  onReplace={() => upload(doc.id, { fallbackName: doc.id })}
                  onDelete={() => remove(doc.id)}
                />
              ))}

              {submitted && errors.documents ? (
                <Text style={styles.errorText}>⚠️ {errors.documents}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyDocs}>
              <Text style={styles.emptyDocsText}>
                Premises type chunne pe zaroori address proof documents yahan aayenge.
              </Text>
            </View>
          )}
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  asterisk: {
    color: COLORS.danger,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 6,
  },

  /* premises */
  premisesBlock: {
    marginBottom: 20,
  },
  premisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  premisesCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  premisesCardActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.lightBlue,
  },
  premisesIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  premisesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  premisesLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  premisesCheck: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.whatsapp,
  },

  /* documents */
  docsBlock: {
    marginTop: 4,
  },
  docsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  docsHint: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  emptyDocs: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyDocsText: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 18,
    textAlign: 'center',
  },

  /* footer */
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
