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
import { BANK_PROOF_OPTIONS } from '../../config/gstDocumentConfig';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import {
  digitsOnly,
  formatIFSC,
  hasErrors,
  validateAccountNumber,
  validateBank,
  validateIFSC,
} from '../../utils/gstValidation';

const ACCOUNT_TYPES = [
  { id: 'savings', label: 'Savings' },
  { id: 'current', label: 'Current' },
  { id: 'cash_credit', label: 'Cash Credit' },
  { id: 'overdraft', label: 'Overdraft (OD)' },
];

/** Step 3 — bank account details + bank proof */
export default function GSTBankScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateField, documents, errors, setErrors, goNext } = useGSTForm();
  const { upload, remove, progress, errors: uploadErrors, isUploading } =
    useDocumentUpload();

  const bank = formData.bank;
  const [submitted, setSubmitted] = useState(false);

  // bank proof ka document config se aata hai (id hamesha 'bank_proof')
  const proofDoc = documents.find((doc) => doc.id === 'bank_proof');
  const selectedProof = BANK_PROOF_OPTIONS.find((o) => o.id === bank.proofType);

  const set = (key) => (value) => updateField('bank', key, value);
  const errorFor = (key) => (submitted ? errors[key] : undefined);

  const handleProofChange = (proofId) => {
    console.log(`Bank proof type selected: ${proofId}`);
    updateField('bank', 'proofType', proofId);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.proofType;
      return next;
    });
  };

  const handleNext = () => {
    const found = validateBank(bank, proofDoc?.file);
    setErrors(found);
    setSubmitted(true);

    if (hasErrors(found)) {
      console.log('Bank validation failed:', Object.keys(found).join(', '));
      return;
    }

    console.log('Navigate to GST Documents');
    const next = goNext();
    navigation.navigate(next.route);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="GST Registration" />
      <GSTStepper activeStep={3} />

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
          <Text style={styles.sectionTitle}>Bank Account Details</Text>
          <Text style={styles.sectionHint}>
            Account business ke naam pe hona chahiye — refund isi me aata hai.
          </Text>

          <FormField
            label="Account Holder Name"
            required
            value={bank.accountHolder}
            onChangeText={set('accountHolder')}
            error={errorFor('accountHolder')}
            valid={bank.accountHolder.trim().length > 2}
            placeholder="Bank record jaisa naam"
            autoCapitalize="words"
          />

          <FormField
            label="Bank Name"
            required
            value={bank.bankName}
            onChangeText={set('bankName')}
            error={errorFor('bankName')}
            valid={bank.bankName.trim().length > 2}
            placeholder="e.g. State Bank of India"
            autoCapitalize="words"
          />

          <FormField
            label="Account Number"
            required
            value={bank.accountNumber}
            onChangeText={set('accountNumber')}
            error={errorFor('accountNumber')}
            valid={validateAccountNumber(bank.accountNumber)}
            placeholder="9 se 18 digit"
            keyboardType="number-pad"
            maxLength={18}
            format={(text) => digitsOnly(text, 18)}
          />

          <FormField
            label="Confirm Account Number"
            required
            value={bank.confirmAccountNumber}
            onChangeText={set('confirmAccountNumber')}
            error={errorFor('confirmAccountNumber')}
            valid={
              !!bank.confirmAccountNumber &&
              bank.confirmAccountNumber === bank.accountNumber
            }
            placeholder="Wahi number dobara"
            keyboardType="number-pad"
            maxLength={18}
            format={(text) => digitsOnly(text, 18)}
          />

          <FormField
            label="IFSC Code"
            required
            value={bank.ifsc}
            onChangeText={set('ifsc')}
            error={errorFor('ifsc')}
            valid={validateIFSC(bank.ifsc)}
            placeholder="HDFC0001234"
            autoCapitalize="characters"
            maxLength={11}
            format={formatIFSC}
            hint="11 character — 4 letters, 0, phir 6 character"
          />

          <SelectField
            label="Account Type"
            required
            value={bank.accountType}
            options={ACCOUNT_TYPES}
            onSelect={set('accountType')}
            error={errorFor('accountType')}
            placeholder="Account type chuniye"
          />

          {/* ---------- bank proof ---------- */}
          <View style={styles.proofBlock}>
            <Text style={styles.docsTitle}>Select Bank Proof Type</Text>
            <Text style={styles.docsHint}>
              Inme se koi ek document upload karna hoga.
            </Text>

            {BANK_PROOF_OPTIONS.map((option) => {
              const active = option.id === bank.proofType;
              return (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.radioRow,
                    active && styles.radioRowActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleProofChange(option.id)}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>

                  <View style={styles.radioText}>
                    <Text style={[styles.radioLabel, active && styles.radioLabelActive]}>
                      {option.label}
                    </Text>
                    <Text style={styles.radioHint}>{option.hint}</Text>
                  </View>
                </Pressable>
              );
            })}

            {errorFor('proofType') ? (
              <Text style={styles.errorText}>{errorFor('proofType')}</Text>
            ) : null}
          </View>

          {/* ---------- proof upload ---------- */}
          {selectedProof && proofDoc ? (
            <View style={styles.uploadBlock}>
              <DocumentUploadCard
                document={proofDoc}
                file={proofDoc.file}
                uploading={isUploading(proofDoc.id)}
                progress={progress[proofDoc.id] || 0}
                error={uploadErrors[proofDoc.id]}
                showLimits
                onUpload={() => upload(proofDoc.id, { fallbackName: 'bank-proof' })}
                onReplace={() => upload(proofDoc.id, { fallbackName: 'bank-proof' })}
                onDelete={() => remove(proofDoc.id)}
              />

              {submitted && errors.proofDocument ? (
                <Text style={styles.errorText}>⚠️ {errors.proofDocument}</Text>
              ) : null}
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
  docsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  docsHint: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 4,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 6,
  },

  /* radio */
  proofBlock: {
    marginTop: 4,
    marginBottom: 18,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  radioRowActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.lightBlue,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: COLORS.white,
  },
  radioActive: {
    borderColor: COLORS.primaryDark,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryDark,
  },
  radioText: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  radioLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  radioHint: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },

  uploadBlock: {
    marginBottom: 4,
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
