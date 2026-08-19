import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckboxField } from '../../components/FormField';
import PLCStepper from '../../components/PLCStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { BUSINESS_ACTIVITIES, DISCLAIMER_TEXT, OFFICE_PREMISES_TYPES } from '../../config/plcDocumentConfig';
import { getStateByCode } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { usePLCForm } from '../../contexts/PLCFormContext';
import { submitPLCApplication } from '../../lib/database';
import {
  formatCurrency,
  maskAadhaar,
  validateApplicant,
  validateCompanyDetails,
  validateDirectors,
  validateDocumentUploads,
  validateRegisteredOffice,
  validateSubscribers,
} from '../../utils/plcValidation';

export default function PLCReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    documents,
    documentSummary,
    calculatedFees,
    goToStep,
    goPrev,
  } = usePLCForm();

  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { applicant, company, directors, subscribers, office, business } = formData;

  const handleEditSection = (stepIndex, screenName) => {
    goToStep(stepIndex);
    navigation.navigate(screenName);
  };

  const handleFinalSubmit = async () => {
    if (!declarationChecked) {
      Alert.alert(
        'Declaration Required',
        'Please accept the statutory declaration and verify that all information provided is accurate.'
      );
      return;
    }

    // Run complete pre-flight check across all 6 steps
    const appErr = validateApplicant(applicant);
    const compErr = validateCompanyDetails(company);
    const dirErr = validateDirectors(directors, company.directorCount);
    const subErr = validateSubscribers(subscribers, company.subscriberCount);
    const offErr = validateRegisteredOffice(office);
    const docErr = validateDocumentUploads(documents);

    if (
      Object.keys(appErr).length > 0 ||
      Object.keys(compErr).length > 0 ||
      Object.keys(dirErr).length > 0 ||
      Object.keys(subErr).length > 0 ||
      Object.keys(offErr).length > 0 ||
      Object.keys(docErr).length > 0
    ) {
      Alert.alert(
        'Incomplete Application',
        'Some required fields or mandatory documents are missing. Please complete all steps before final submission.'
      );
      return;
    }

    try {
      setSubmitting(true);

      const submissionPayload = {
        applicant,
        company,
        directors,
        subscribers,
        office,
        business,
        documents: documents.map((d) => ({
          id: d.id,
          label: d.label,
          category: d.category,
          required: d.required,
          status: d.status,
          isReused: d.isReused,
          file: d.file ? { name: d.file.name, size: d.file.size, mimeType: d.file.mimeType } : null,
        })),
        calculatedFees,
      };

      const result = await submitPLCApplication(submissionPayload);

      setSubmitting(false);

      if (result && (result.applicationId || result.application_id)) {
        navigation.replace('PLCConfirmation', {
          applicationId: result.applicationId || result.application_id,
          applicationData: submissionPayload,
        });
      } else {
        throw new Error('Failed to obtain application ID from server.');
      }
    } catch (err) {
      setSubmitting(false);
      console.error('PLC submission error:', err);
      Alert.alert('Submission Error', err.message || 'Failed to submit PLC application. Please try again.');
    }
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
      <PLCStepper activeStep={6} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.sectionTitle}>Step 7: Final Review & Submission</Text>
          <Text style={styles.sectionSubtitle}>
            Please review all company details, directors, registered office, and uploaded documents before submission.
          </Text>
        </View>

        {/* ================================================================= */}
        {/* SECTION 1: APPLICANT SUMMARY */}
        {/* ================================================================= */}
        <View style={styles.card}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>1. Applicant Details</Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => handleEditSection(0, 'PLCApplicant')}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </Pressable>
          </View>

          <ReviewRow label="Full Name" value={applicant.fullName} />
          <ReviewRow label="Father / Mother" value={applicant.parentName} />
          <ReviewRow label="DOB" value={applicant.dob} />
          <ReviewRow label="PAN Number" value={applicant.pan} isMono />
          <ReviewRow label="Aadhaar / ID" value={maskAadhaar(applicant.aadhaar)} isMono />
          <ReviewRow label="Mobile" value={applicant.mobile} />
          <ReviewRow label="Email" value={applicant.email} />
          <ReviewRow
            label="Address"
            value={`${applicant.address || ''}, ${applicant.city || ''}, ${getStateByCode(applicant.state)?.label || applicant.state || ''} - ${applicant.pincode || ''}`}
          />
        </View>

        {/* ================================================================= */}
        {/* SECTION 2: COMPANY SUMMARY */}
        {/* ================================================================= */}
        <View style={styles.card}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>2. Proposed Company Details</Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => handleEditSection(1, 'PLCCompany')}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </Pressable>
          </View>

          <ReviewRow label="Option 1 Name" value={company.proposedName1} isBold />
          <ReviewRow label="Option 2 Name" value={company.proposedName2} />
          <ReviewRow
            label="ROC State"
            value={getStateByCode(company.registeredState)?.label || company.registeredState}
          />
          <ReviewRow
            label="Business Activity"
            value={BUSINESS_ACTIVITIES.find((a) => a.id === company.mainActivity)?.label || company.mainActivity}
          />
          <ReviewRow
            label="Authorized Capital"
            value={formatCurrency(company.authorizedCapital)}
            isBold
          />
          <ReviewRow
            label="Paid-up Capital"
            value={formatCurrency(company.paidUpCapital)}
          />
          <ReviewRow label="Directors Count" value={company.directorCount} />
          <ReviewRow label="Shareholders Count" value={company.subscriberCount} />
        </View>

        {/* ================================================================= */}
        {/* SECTION 3: DIRECTORS & SUBSCRIBERS SUMMARY */}
        {/* ================================================================= */}
        <View style={styles.card}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>3. Directors & Shareholders</Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => handleEditSection(2, 'PLCDirectors')}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </Pressable>
          </View>

          {directors.map((dir, i) => (
            <View key={dir.id || i} style={styles.nestedSummaryBlock}>
              <Text style={styles.nestedTitle}>
                Director {i + 1}: {dir.fullName}
              </Text>
              <Text style={styles.nestedSub}>
                PAN: {dir.pan || '—'} | Mobile: {dir.mobile || '—'}
              </Text>
              <Text style={styles.nestedSub}>
                DIN Status:{' '}
                {dir.hasDIN
                  ? `Existing DIN (${dir.din})`
                  : 'New DIN Application (Included)'}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          {subscribers.map((sub, i) => (
            <View key={sub.id || i} style={styles.nestedSummaryBlock}>
              <Text style={styles.nestedTitle}>
                Shareholder {i + 1}: {sub.fullName} {sub.isDirector ? '(Also Director)' : ''}
              </Text>
              <Text style={styles.nestedSub}>
                Shares: {sub.sharesCount || '—'} ({sub.shareholdingPercent || '0'}% Shareholding)
              </Text>
            </View>
          ))}
        </View>

        {/* ================================================================= */}
        {/* SECTION 4: REGISTERED OFFICE SUMMARY */}
        {/* ================================================================= */}
        <View style={styles.card}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>4. Registered Office</Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => handleEditSection(3, 'PLCOffice')}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </Pressable>
          </View>

          <ReviewRow
            label="Premises Status"
            value={OFFICE_PREMISES_TYPES.find((p) => p.id === office.premisesType)?.label || office.premisesType}
            isBold
          />
          <ReviewRow
            label="Full Address"
            value={`${office.line1 || ''}, ${office.line2 || ''}, ${office.locality || ''}, ${office.city || ''}, ${getStateByCode(office.state)?.label || office.state || ''} - ${office.pincode || ''}`}
          />
          {office.ownerName ? (
            <ReviewRow label="Property Owner" value={office.ownerName} />
          ) : null}
        </View>

        {/* ================================================================= */}
        {/* SECTION 5: BUSINESS DETAILS SUMMARY */}
        {/* ================================================================= */}
        <View style={styles.card}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>5. Business Activities</Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => handleEditSection(4, 'PLCBusiness')}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </Pressable>
          </View>

          <ReviewRow label="Products/Services" value={business.productsServices} />
          <ReviewRow label="Expected Turnover" value={business.turnover} />
          <ReviewRow label="Commencement" value={business.startDate} />
        </View>

        {/* ================================================================= */}
        {/* SECTION 6: DOCUMENTS SUMMARY */}
        {/* ================================================================= */}
        <View style={styles.card}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>6. Document Uploads</Text>
            <Pressable
              style={styles.editBtn}
              onPress={() => handleEditSection(5, 'PLCDocuments')}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </Pressable>
          </View>

          <View style={styles.docSummaryBadgeRow}>
            <Text style={styles.docSummaryCount}>
              ✓ {documentSummary.uploaded} of {documentSummary.total} documents satisfied
            </Text>
            <Text style={styles.docSummaryPct}>{documentSummary.percent}%</Text>
          </View>
        </View>

        {/* ================================================================= */}
        {/* SECTION 7: STATUTORY DISCLAIMER & DECLARATION */}
        {/* ================================================================= */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerHeading}>⚖️ Statutory Legal Disclaimer</Text>
          <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>

          <View style={styles.divider} />

          <CheckboxField
            label="I hereby declare that all particulars, documents, and statements submitted herein are true, correct, and complete to the best of my knowledge under the provisions of the Companies Act, 2013 and applicable MCA rules."
            value={declarationChecked}
            onValueChange={setDeclarationChecked}
          />
        </View>
      </ScrollView>

      {/* ---------- Sticky Bottom Final Submission CTA ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            (!declarationChecked || submitting) && styles.submitButtonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={handleFinalSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitText}>SUBMIT APPLICATION ›</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ReviewRow({ label, value, isBold, isMono }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}:</Text>
      <Text
        style={[
          styles.reviewValue,
          isBold && styles.boldValue,
          isMono && styles.monoValue,
        ]}
        numberOfLines={3}
      >
        {value || '—'}
      </Text>
    </View>
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
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E8F0FE',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  reviewRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  reviewLabel: {
    width: 120,
    fontSize: 13,
    color: COLORS.grayText,
  },
  reviewValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  boldValue: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  monoValue: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  nestedSummaryBlock: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  nestedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  nestedSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  docSummaryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F8F0',
    padding: 10,
    borderRadius: 8,
  },
  docSummaryCount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E7E34',
  },
  docSummaryPct: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  disclaimerCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F9E79F',
  },
  disclaimerHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7D6608',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#7D6608',
    lineHeight: 18,
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
  submitButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
