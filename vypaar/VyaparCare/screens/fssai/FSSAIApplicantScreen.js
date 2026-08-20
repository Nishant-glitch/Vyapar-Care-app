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
import { FSSAI_CONSTITUTIONS } from '../../config/fssaiConfig';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { formatCIN, formatPAN, validateFSSAIApplicant } from '../../utils/fssaiValidation';

export default function FSSAIApplicantScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formState,
    updateFormState,
    updateApplicantDetails,
    addPartner,
    removePartner,
    updatePartner,
    addDirector,
    removeDirector,
    updateDirector,
    errors,
    setErrors,
  } = useFSSAIForm();

  const { constitution, applicantDetails } = formState;

  const handleFieldChange = (field, value) => {
    updateApplicantDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateFSSAIApplicant(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('FSSAIBusiness');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 2 — Applicant & Constitution Details"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={2}
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
          <Text style={styles.sectionTitle}>Business Constitution</Text>
          <Text style={styles.sectionSubtitle}>
            Select the legal structure of your food business.
          </Text>
        </View>

        {/* Constitution Grid */}
        <View style={styles.constitutionGrid}>
          {FSSAI_CONSTITUTIONS.map((c) => {
            const isSelected = constitution === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.constCard, isSelected && styles.constCardActive]}
                onPress={() => updateFormState({ constitution: c.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.constIcon}>{c.icon}</Text>
                <Text style={[styles.constLabel, isSelected && styles.constLabelActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 1: Business Legal & Trade Name */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>🏢 Entity Legal Information</Text>

          <FormField
            label="Business Legal Name / Applicant Name"
            required
            placeholder="e.g. Ramesh Kumar / Haldiram Snacks Pvt Ltd"
            value={applicantDetails.businessLegalName}
            onChangeText={(val) => handleFieldChange('businessLegalName', val)}
            error={errors.businessLegalName}
          />

          <FormField
            label="Trade / Brand / Outlet Name"
            placeholder="e.g. Royal Sweets & Restaurant"
            value={applicantDetails.tradeName}
            onChangeText={(val) => handleFieldChange('tradeName', val)}
            hint="Display name that appears on your signboard and menu"
          />

          <FormField
            label="Authorized Contact Person Name"
            required
            placeholder="e.g. Ramesh Kumar"
            value={applicantDetails.applicantName}
            onChangeText={(val) => handleFieldChange('applicantName', val)}
            error={errors.applicantName}
          />

          <FormField
            label="Father's / Spouse's Name"
            placeholder="e.g. Suresh Kumar"
            value={applicantDetails.fatherOrMotherName}
            onChangeText={(val) => handleFieldChange('fatherOrMotherName', val)}
          />

          <FormField
            label="Date of Birth / Incorporation Date"
            placeholder="DD/MM/YYYY"
            value={applicantDetails.dob}
            onChangeText={(val) => handleFieldChange('dob', val)}
          />
        </View>

        {/* Section 2: Contact & Identity Credentials */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>🪪 Identity & Contact Details</Text>

          <FormField
            label="Applicant / Entity PAN"
            required
            placeholder="e.g. ABCDE1234F"
            autoCapitalize="characters"
            maxLength={10}
            value={applicantDetails.pan}
            onChangeText={(val) => handleFieldChange('pan', formatPAN(val))}
            error={errors.pan}
            hint="Proprietor PAN for proprietorship; Firm/Company PAN for registered entities"
          />

          <FormField
            label="Mobile Number"
            required
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            maxLength={10}
            value={applicantDetails.mobile}
            onChangeText={(val) => handleFieldChange('mobile', val)}
            error={errors.mobile}
            hint="Will receive FoSCoS OTPs and inspection SMS alerts"
          />

          <FormField
            label="Email Address"
            required
            placeholder="e.g. contact@royalsweets.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={applicantDetails.email}
            onChangeText={(val) => handleFieldChange('email', val)}
            error={errors.email}
            hint="Official FoSCoS registration certificate will be emailed here"
          />
        </View>

        {/* Section 3: Residential / Correspondence Address */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>📍 Correspondence / Personal Address</Text>

          <FormField
            label="Address Line 1"
            required
            placeholder="Flat / Building / House No., Street"
            value={applicantDetails.address1}
            onChangeText={(val) => handleFieldChange('address1', val)}
            error={errors.address1}
          />

          <FormField
            label="Address Line 2"
            placeholder="Locality / Sector / Area / Landmark"
            value={applicantDetails.address2}
            onChangeText={(val) => handleFieldChange('address2', val)}
          />

          <View style={styles.rowTwo}>
            <View style={styles.colTwo}>
              <FormField
                label="City / Town"
                required
                placeholder="e.g. New Delhi"
                value={applicantDetails.city}
                onChangeText={(val) => handleFieldChange('city', val)}
                error={errors.city}
              />
            </View>
            <View style={styles.colTwo}>
              <FormField
                label="District"
                placeholder="e.g. South Delhi"
                value={applicantDetails.district}
                onChangeText={(val) => handleFieldChange('district', val)}
              />
            </View>
          </View>

          <SelectField
            label="State / UT"
            required
            options={INDIAN_STATES}
            value={applicantDetails.state}
            onValueChange={(val) => handleFieldChange('state', val)}
            error={errors.state}
          />

          <FormField
            label="PIN Code"
            required
            placeholder="e.g. 110001"
            keyboardType="number-pad"
            maxLength={6}
            value={applicantDetails.pinCode}
            onChangeText={(val) => handleFieldChange('pinCode', val)}
            error={errors.pinCode}
          />
        </View>

        {/* Section 4: Dynamic Constitution Specific Sub-forms */}
        {constitution === 'partnership' && (
          <View style={styles.formCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderTitle}>🤝 Partnership Firm Partners</Text>
              <TouchableOpacity style={styles.addBtnSmall} onPress={addPartner}>
                <Text style={styles.addBtnSmallText}>+ Add Partner</Text>
              </TouchableOpacity>
            </View>

            {errors.partners && <Text style={styles.errorInline}>{errors.partners}</Text>}

            {applicantDetails.partners.map((partner, idx) => (
              <View key={`partner-${idx}`} style={styles.partnerBlock}>
                <View style={styles.blockTitleRow}>
                  <Text style={styles.blockTitle}>Partner {idx + 1}</Text>
                  {applicantDetails.partners.length > 2 && (
                    <TouchableOpacity onPress={() => removePartner(idx)}>
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label={`Partner ${idx + 1} Full Name`}
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={partner.name}
                  onChangeText={(val) => updatePartner(idx, { name: val })}
                  error={errors[`partner_${idx}_name`]}
                />

                <View style={styles.rowTwo}>
                  <View style={styles.colTwo}>
                    <FormField
                      label="Mobile Number"
                      placeholder="e.g. 9811122233"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={partner.mobile}
                      onChangeText={(val) => updatePartner(idx, { mobile: val })}
                      error={errors[`partner_${idx}_mobile`]}
                    />
                  </View>
                  <View style={styles.colTwo}>
                    <FormField
                      label="Email"
                      placeholder="partner@firm.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={partner.email}
                      onChangeText={(val) => updatePartner(idx, { email: val })}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {constitution === 'llp' && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>⚖️ LLP Registration Details</Text>
            <FormField
              label="LLP Identification Number (LLPIN)"
              required
              placeholder="e.g. AAB-1234"
              autoCapitalize="characters"
              value={applicantDetails.llpin}
              onChangeText={(val) => handleFieldChange('llpin', val)}
              error={errors.llpin}
            />
            <FormField
              label="Designated Partner Name"
              placeholder="e.g. Amit Verma"
              value={applicantDetails.authorizedSignatory}
              onChangeText={(val) => handleFieldChange('authorizedSignatory', val)}
            />
          </View>
        )}

        {(constitution === 'pvt_ltd' || constitution === 'public_ltd') && (
          <View style={styles.formCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeaderTitle}>🏢 Company Incorporation & Directors</Text>
              <TouchableOpacity style={styles.addBtnSmall} onPress={addDirector}>
                <Text style={styles.addBtnSmallText}>+ Add Director</Text>
              </TouchableOpacity>
            </View>

            <FormField
              label="Corporate Identification Number (CIN)"
              required
              placeholder="e.g. U72200DL2026PTC123456"
              autoCapitalize="characters"
              maxLength={21}
              value={applicantDetails.cin}
              onChangeText={(val) => handleFieldChange('cin', formatCIN(val))}
              error={errors.cin}
            />

            <FormField
              label="Authorized Signatory / Director Name"
              placeholder="e.g. Vikramaditya Singhania"
              value={applicantDetails.authorizedSignatory}
              onChangeText={(val) => handleFieldChange('authorizedSignatory', val)}
            />

            {applicantDetails.directors.map((dir, idx) => (
              <View key={`dir-${idx}`} style={styles.partnerBlock}>
                <View style={styles.blockTitleRow}>
                  <Text style={styles.blockTitle}>Director {idx + 1}</Text>
                  {applicantDetails.directors.length > 2 && (
                    <TouchableOpacity onPress={() => removeDirector(idx)}>
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label="Director Name"
                  placeholder="Full Name"
                  value={dir.name}
                  onChangeText={(val) => updateDirector(idx, { name: val })}
                />

                <View style={styles.rowTwo}>
                  <View style={styles.colTwo}>
                    <FormField
                      label="Director DIN (8-digit)"
                      placeholder="e.g. 01234567"
                      keyboardType="number-pad"
                      maxLength={8}
                      value={dir.din}
                      onChangeText={(val) => updateDirector(idx, { din: val })}
                    />
                  </View>
                  <View style={styles.colTwo}>
                    <FormField
                      label="Director PAN"
                      placeholder="e.g. ABCDE1234F"
                      autoCapitalize="characters"
                      maxLength={10}
                      value={dir.pan}
                      onChangeText={(val) => updateDirector(idx, { pan: formatPAN(val) })}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 12,
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
  constitutionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  constCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  constCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  constIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  constLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  constLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  addBtnSmall: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  addBtnSmallText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  colTwo: {
    flex: 1,
  },
  partnerBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  errorInline: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: 8,
    fontWeight: '600',
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
