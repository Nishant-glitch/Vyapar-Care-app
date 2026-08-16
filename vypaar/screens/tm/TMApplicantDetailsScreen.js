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
import TMStepper from '../../components/TMStepper';
import {
  FormField,
  SelectField,
} from '../../components/FormField';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import { formatCIN, formatPAN, validateTMApplicantDetails } from '../../utils/tmValidation';

export default function TMApplicantDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formState,
    updateApplicantDetails,
    addPartner,
    removePartner,
    updatePartner,
    errors,
    setErrors,
  } = useTMForm();

  const { applicantType, applicantDetails } = formState;

  const handleFieldChange = (field, value) => {
    updateApplicantDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateTMApplicantDetails(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('TMMarkDetails');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={2}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Applicant Details</Text>
          <Text style={styles.screenSubheading}>
            Enter legal identification and official correspondence address of the trademark owner for Form TM-A filing.
          </Text>
        </View>

        {/* 1. Core Identity Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>👤 Legal Identity & Contact</Text>

          <FormField
            label="Applicant Full / Legal Name"
            placeholder={
              applicantType === 'individual'
                ? 'e.g. Rahul Sharma'
                : 'e.g. Acme Innovations Private Limited'
            }
            value={applicantDetails.applicantLegalName}
            onChangeText={(v) => handleFieldChange('applicantLegalName', v)}
            error={errors.applicantLegalName}
            required
            autoCapitalize="words"
          />

          <FormField
            label="Trading Name / Brand Entity (if different)"
            placeholder="e.g. Acme Tech Solutions"
            value={applicantDetails.tradingName}
            onChangeText={(v) => handleFieldChange('tradingName', v)}
            helpText="Optional: Leave blank if trading under legal name"
          />

          <FormField
            label="Permanent Account Number (PAN)"
            placeholder="ABCDE1234F"
            value={applicantDetails.pan}
            onChangeText={(v) => handleFieldChange('pan', formatPAN(v))}
            error={errors.pan}
            required
            autoCapitalize="characters"
            maxLength={10}
          />

          <View style={styles.twoColRow}>
            <View style={styles.col}>
              <FormField
                label="Mobile Number"
                placeholder="9876543210"
                value={applicantDetails.mobile}
                onChangeText={(v) => handleFieldChange('mobile', v)}
                error={errors.mobile}
                required
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <View style={styles.col}>
              <FormField
                label="Email Address"
                placeholder="applicant@example.com"
                value={applicantDetails.email}
                onChangeText={(v) => handleFieldChange('email', v)}
                error={errors.email}
                required
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* 2. Applicant Type-Specific Section */}
        {applicantType === 'individual' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>👨‍💼 Individual KYC Details</Text>

            <FormField
              label="Father's / Mother's Name"
              placeholder="e.g. Ramesh Sharma"
              value={applicantDetails.fatherMotherName}
              onChangeText={(v) => handleFieldChange('fatherMotherName', v)}
            />

            <FormField
              label="Date of Birth (DD/MM/YYYY)"
              placeholder="15/08/1990"
              value={applicantDetails.dob}
              onChangeText={(v) => handleFieldChange('dob', v)}
              error={errors.dob}
              required
            />
          </View>
        )}

        {applicantType === 'proprietorship' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🏪 Proprietorship Details</Text>

            <FormField
              label="Sole Proprietor Full Name"
              placeholder="e.g. Amit Verma"
              value={applicantDetails.proprietorName}
              onChangeText={(v) => handleFieldChange('proprietorName', v)}
              error={errors.proprietorName}
              required
            />
          </View>
        )}

        {applicantType === 'partnership' && (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderWithBtn}>
              <Text style={styles.sectionTitle}>🤝 Partners Information</Text>
              <TouchableOpacity style={styles.addBtn} onPress={addPartner}>
                <Text style={styles.addBtnText}>+ Add Partner</Text>
              </TouchableOpacity>
            </View>

            {errors.partners ? (
              <Text style={styles.errorTextSmall}>{errors.partners}</Text>
            ) : null}

            {(applicantDetails.partners || []).map((partner, pIdx) => (
              <View key={`partner-${pIdx}`} style={styles.subEntityCard}>
                <View style={styles.subEntityHeader}>
                  <Text style={styles.subEntityTitle}>Partner {pIdx + 1}</Text>
                  {(applicantDetails.partners || []).length > 2 && (
                    <TouchableOpacity onPress={() => removePartner(pIdx)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label="Partner Full Name"
                  placeholder="e.g. Suresh Patel"
                  value={partner.fullName}
                  onChangeText={(v) => updatePartner(pIdx, 'fullName', v)}
                  error={errors[`partner_${pIdx}_fullName`]}
                  required
                />

                <FormField
                  label="Partner PAN"
                  placeholder="ABCDE1234F"
                  value={partner.pan}
                  onChangeText={(v) => updatePartner(pIdx, 'pan', formatPAN(v))}
                  error={errors[`partner_${pIdx}_pan`]}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
            ))}
          </View>
        )}

        {applicantType === 'llp' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>⚖️ LLP Details</Text>

            <FormField
              label="LLPIN (Limited Liability Partnership PIN)"
              placeholder="AAA-1234"
              value={applicantDetails.llpin}
              onChangeText={(v) => handleFieldChange('llpin', v)}
              error={errors.llpin}
              required
              autoCapitalize="characters"
            />

            <FormField
              label="Designated Partner / Signatory Name"
              placeholder="e.g. Vikram Singhania"
              value={applicantDetails.authorizedPersonName}
              onChangeText={(v) => handleFieldChange('authorizedPersonName', v)}
              error={errors.authorizedPersonName}
              required
            />
          </View>
        )}

        {(applicantType === 'pvt_ltd' || applicantType === 'public_ltd') && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🏢 Corporate Details</Text>

            <FormField
              label="Corporate Identification Number (CIN)"
              placeholder="U72900DL2026PTC123456"
              value={applicantDetails.cin}
              onChangeText={(v) => handleFieldChange('cin', formatCIN(v))}
              error={errors.cin}
              required
              autoCapitalize="characters"
              maxLength={21}
            />

            <FormField
              label="Authorized Director / Signatory Name"
              placeholder="e.g. Sunita Nair"
              value={applicantDetails.authorizedPersonName}
              onChangeText={(v) => handleFieldChange('authorizedPersonName', v)}
              error={errors.authorizedPersonName}
              required
            />

            <FormField
              label="Signatory Designation"
              placeholder="Director / Managing Director"
              value={applicantDetails.authorizedPersonDesignation}
              onChangeText={(v) => handleFieldChange('authorizedPersonDesignation', v)}
            />
          </View>
        )}

        {['trust', 'society', 'aop'].includes(applicantType) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📜 Entity Registration</Text>

            <FormField
              label="Registration / Trust Deed Number"
              placeholder="e.g. REG/SOC/2022/987"
              value={applicantDetails.registrationNumber}
              onChangeText={(v) => handleFieldChange('registrationNumber', v)}
            />

            <FormField
              label="Authorized Trustee / President Name"
              placeholder="e.g. Swami Anand"
              value={applicantDetails.authorizedPersonName}
              onChangeText={(v) => handleFieldChange('authorizedPersonName', v)}
              error={errors.authorizedPersonName}
              required
            />
          </View>
        )}

        {/* 3. Principal Place of Business / Address */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📍 Principal Place of Business</Text>

          <FormField
            label="Address Line 1 (Building / Floor / Street)"
            placeholder="e.g. Plot No. 42, Sector 18"
            value={applicantDetails.address1}
            onChangeText={(v) => handleFieldChange('address1', v)}
            error={errors.address1}
            required
          />

          <FormField
            label="Address Line 2 (Area / Landmark)"
            placeholder="e.g. Industrial Area Phase 2"
            value={applicantDetails.address2}
            onChangeText={(v) => handleFieldChange('address2', v)}
          />

          <View style={styles.twoColRow}>
            <View style={styles.col}>
              <FormField
                label="City / Town"
                placeholder="e.g. New Delhi"
                value={applicantDetails.city}
                onChangeText={(v) => handleFieldChange('city', v)}
                error={errors.city}
                required
              />
            </View>
            <View style={styles.col}>
              <FormField
                label="District"
                placeholder="e.g. South West Delhi"
                value={applicantDetails.district}
                onChangeText={(v) => handleFieldChange('district', v)}
              />
            </View>
          </View>

          <SelectField
            label="State / Union Territory"
            value={applicantDetails.state}
            onSelect={(val) => handleFieldChange('state', val)}
            options={INDIAN_STATES.map((s) => ({ id: s.code, label: s.name }))}
            error={errors.state}
            placeholder="Select State"
            required
          />

          <FormField
            label="PIN Code"
            placeholder="110001"
            value={applicantDetails.pinCode}
            onChangeText={(v) => handleFieldChange('pinCode', v)}
            error={errors.pinCode}
            required
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      </ScrollView>

      {/* Footer Navigation Buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerBtnRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← BACK</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>TRADEMARK DETAILS →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.85,
  },
  headerBlock: {
    marginBottom: 16,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  screenSubheading: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 4,
    lineHeight: 19,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E8EC',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  cardHeaderWithBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  addBtnText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold',
  },
  subEntityCard: {
    backgroundColor: '#FAFBFD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subEntityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subEntityTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  removeText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  errorTextSmall: {
    color: '#E74C3C',
    fontSize: 12,
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
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  footerBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueBtn: {
    flex: 2,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
