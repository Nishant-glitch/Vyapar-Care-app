import React, { useState } from 'react';
import {
  Alert,
  Platform,
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
import { CheckboxField } from '../../components/FormField';
import { FSSAI_DISCLAIMER_TEXT, FSSAI_KOB_TYPES, FSSAI_CONSTITUTIONS } from '../../config/fssaiConfig';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { validateFullFSSAIApplication } from '../../utils/fssaiValidation';

export default function FSSAIReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, documents, eligibility } = useFSSAIForm();
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const {
    kob,
    constitution,
    licenseType,
    applicantDetails,
    businessDetails,
    premisesDetails,
    products,
    specificDetails,
  } = formState;

  const currentKob = FSSAI_KOB_TYPES.find((k) => k.id === kob);
  const currentConst = FSSAI_CONSTITUTIONS.find((c) => c.id === constitution);

  const handleProceedToPayment = () => {
    if (!declarationAccepted) {
      Alert.alert('Declaration Required', 'Please confirm the statutory declaration before proceeding to payment.');
      return;
    }

    const {
      eligibilityErrors,
      applicantErrors,
      businessErrors,
      premisesErrors,
      productErrors,
      specificErrors,
      documentErrors,
    } = validateFullFSSAIApplication(formState, documents);

    const hasErrors =
      Object.keys(eligibilityErrors).length > 0 ||
      Object.keys(applicantErrors).length > 0 ||
      Object.keys(businessErrors).length > 0 ||
      Object.keys(premisesErrors).length > 0 ||
      Object.keys(productErrors).length > 0 ||
      Object.keys(specificErrors).length > 0 ||
      Object.keys(documentErrors).length > 0;

    if (hasErrors) {
      setValidationErrors({
        ...eligibilityErrors,
        ...applicantErrors,
        ...businessErrors,
        ...premisesErrors,
        ...productErrors,
        ...specificErrors,
        ...documentErrors,
      });
      Alert.alert(
        'Incomplete Application',
        'Some required fields or documents are incomplete. Please review and update the highlighted sections.'
      );
      return;
    }

    navigation.navigate('FSSAIPayment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 9 — Review Application Summary"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={9}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Application Summary & Pre-Flight Review</Text>
          <Text style={styles.sectionSubtitle}>
            Please verify all details before payment. You can jump directly to any step to make corrections.
          </Text>
        </View>

        {/* Section 1: Business Type & FoSCoS Eligibility */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>1. Business Type & Eligibility</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FSSAIEligibility')}>
              <Text style={styles.editLink}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Kind of Business (KoB):</Text>
            <Text style={styles.dataValue}>{currentKob ? `${currentKob.icon} ${currentKob.label}` : kob}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Recommended License:</Text>
            <Text style={[styles.dataValue, { color: eligibility.badgeColor, fontWeight: 'bold' }]}>
              {eligibility.label}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Turnover Bracket:</Text>
            <Text style={styles.dataValue}>
              {businessDetails.annualTurnover === 'up_to_12_lakh'
                ? 'Up to ₹12 Lakh'
                : businessDetails.annualTurnover === '12_to_20_cr'
                ? '₹12 Lakh to ₹20 Crore'
                : 'Above ₹20 Crore'}
            </Text>
          </View>
        </View>

        {/* Section 2: Applicant & Constitution */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>2. Applicant & Legal Entity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FSSAIApplicant')}>
              <Text style={styles.editLink}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Business Legal Name:</Text>
            <Text style={styles.dataValue}>{applicantDetails.businessLegalName || '—'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Trade / Brand Name:</Text>
            <Text style={styles.dataValue}>{applicantDetails.tradeName || '—'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Constitution:</Text>
            <Text style={styles.dataValue}>{currentConst ? currentConst.label : constitution}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Authorized Person:</Text>
            <Text style={styles.dataValue}>{applicantDetails.applicantName || '—'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>PAN Number:</Text>
            <Text style={styles.dataValue}>{applicantDetails.pan || '—'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Mobile / Email:</Text>
            <Text style={styles.dataValue}>{`${applicantDetails.mobile || '—'} / ${applicantDetails.email || '—'}`}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Correspondence Address:</Text>
            <Text style={styles.dataValue}>{`${applicantDetails.address1}, ${applicantDetails.city}, PIN: ${applicantDetails.pinCode}`}</Text>
          </View>
        </View>

        {/* Section 3: Food Business Operations */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>3. Food Business Scope</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FSSAIBusiness')}>
              <Text style={styles.editLink}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Food Business Name:</Text>
            <Text style={styles.dataValue}>{businessDetails.foodBusinessName || '—'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Operating Status:</Text>
            <Text style={styles.dataValue}>{businessDetails.isCurrentlyOperating ? 'Operational' : 'Proposed'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Food Handlers / Employees:</Text>
            <Text style={styles.dataValue}>{businessDetails.employeeCount || '—'}</Text>
          </View>
        </View>

        {/* Section 4: Premises Details */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>4. Premises Location</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FSSAIPremises')}>
              <Text style={styles.editLink}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Premises Name:</Text>
            <Text style={styles.dataValue}>{premisesDetails.premisesName || '—'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Premises Type:</Text>
            <Text style={styles.dataValue}>{premisesDetails.premisesType.toUpperCase()}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Complete Address:</Text>
            <Text style={styles.dataValue}>{`${premisesDetails.address1}, ${premisesDetails.locality || ''}, ${premisesDetails.city}, ${premisesDetails.district}, PIN: ${premisesDetails.pinCode}`}</Text>
          </View>
        </View>

        {/* Section 5: Products & Categories */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>5. Products ({products.length} items)</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FSSAIProducts')}>
              <Text style={styles.editLink}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          {products.map((p, idx) => (
            <View key={`review-p-${idx}`} style={styles.productReviewItem}>
              <Text style={styles.productReviewName}>
                {idx + 1}. {p.productName}
              </Text>
              <Text style={styles.productReviewCat}>Category {p.categoryCode} • {p.capacity || 'Standard Output'}</Text>
            </View>
          ))}
        </View>

        {/* Section 6: Uploaded Documents */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>6. Supporting Documents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FSSAIDocumentsUpload')}>
              <Text style={styles.editLink}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          {documents.map((doc) => {
            const isUploaded = doc.status === 'uploaded' || doc.file;
            return (
              <View key={doc.id} style={styles.docStatusRow}>
                <Text style={styles.docStatusLabel} numberOfLines={1}>
                  {doc.label}
                </Text>
                <Text style={[styles.docStatusValue, isUploaded ? styles.docStatusOk : styles.docStatusMissing]}>
                  {isUploaded ? '✓ Uploaded' : doc.required ? '✕ Missing' : 'Optional'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Statutory Legal Disclaimer Notice */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerHeader}>⚖️ STATUTORY NOTICE & LEGAL DISCLAIMER</Text>
          <Text style={styles.disclaimerText}>{FSSAI_DISCLAIMER_TEXT}</Text>
        </View>

        {/* Applicant Declaration Checkbox */}
        <View style={styles.declarationCard}>
          <CheckboxField
            label="I hereby declare that all particulars, information and supporting documents provided in this application are true, accurate and complete to the best of my knowledge. I understand that any false statement may attract penal provisions under the Food Safety and Standards Act, 2006."
            value={declarationAccepted}
            onValueChange={setDeclarationAccepted}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.continueBtn, !declarationAccepted && styles.continueBtnDisabled]}
          onPress={handleProceedToPayment}
          disabled={!declarationAccepted}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>PROCEED TO PAYMENT →</Text>
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
    marginBottom: 14,
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
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  editLink: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  dataLabel: {
    fontSize: 12.5,
    color: '#64748B',
    flex: 1,
  },
  dataValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1.3,
    textAlign: 'right',
  },
  productReviewItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  productReviewName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  productReviewCat: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  docStatusLabel: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    marginRight: 8,
  },
  docStatusValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  docStatusOk: {
    color: COLORS.whatsapp,
  },
  docStatusMissing: {
    color: COLORS.danger,
  },
  disclaimerCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 14,
  },
  disclaimerHeader: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 17,
  },
  declarationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
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
  continueBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
