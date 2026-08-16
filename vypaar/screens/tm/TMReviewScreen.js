import React, { useState } from 'react';
import {
  Image,
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
import { CheckboxField } from '../../components/FormField';
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import {
  TM_APPLICANT_TYPES,
  TM_MARK_TYPES,
  NICE_CLASSES,
  TM_DISCLAIMER_TEXT,
} from '../../config/trademarkConfig';
import { validateFullTMApplication } from '../../utils/tmValidation';

export default function TMReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, documents = [], setErrors } = useTMForm();

  const [isDeclared, setIsDeclared] = useState(false);
  const [declarationError, setDeclarationError] = useState(null);

  const {
    applicantType,
    isStartupClaimed,
    isMSMEClaimed,
    applicantDetails = {},
    markDetails = {},
    selectedClasses = [],
    classDescriptions = {},
    usageDetails = {},
    agentDetails = {},
  } = formState;

  const typeConfig =
    TM_APPLICANT_TYPES.find((t) => t.id === applicantType) || TM_APPLICANT_TYPES[0];
  const markTypeConfig =
    TM_MARK_TYPES.find((m) => m.id === markDetails.markType) || TM_MARK_TYPES[0];

  const handleEdit = (route) => {
    navigation.navigate(route);
  };

  const handleContinue = () => {
    if (!isDeclared) {
      setDeclarationError('Please accept the statutory declaration before proceeding to payment.');
      return;
    }

    const fullVal = validateFullTMApplication(formState, documents);
    const hasErrors = Object.values(fullVal).some((errObj) => Object.keys(errObj).length > 0);

    if (hasErrors) {
      setDeclarationError('Some required information or documents are missing. Please review highlighted steps.');
      return;
    }

    setDeclarationError(null);
    navigation.navigate('TMPayment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={8}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Review & Verify Application</Text>
          <Text style={styles.screenSubheading}>
            Carefully verify all applicant details, trademark representations and classifications before proceeding to official fee calculation and payment.
          </Text>
        </View>

        {declarationError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{declarationError}</Text>
          </View>
        )}

        {/* 1. Applicant Details Summary */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>👤 Applicant Information</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEdit('TMApplicantDetails')}
            >
              <Text style={styles.editBtnText}>EDIT ✏️</Text>
            </TouchableOpacity>
          </View>

          <ReviewRow label="Applicant Type" value={typeConfig.label} />
          <ReviewRow label="Applicant / Legal Name" value={applicantDetails.applicantLegalName} />
          {applicantDetails.tradingName ? (
            <ReviewRow label="Trading Name" value={applicantDetails.tradingName} />
          ) : null}
          <ReviewRow label="PAN Number" value={applicantDetails.pan} />
          <ReviewRow label="Mobile & Email" value={`${applicantDetails.mobile} | ${applicantDetails.email}`} />
          <ReviewRow
            label="Principal Address"
            value={`${applicantDetails.address1}, ${applicantDetails.city}, ${applicantDetails.state} - ${applicantDetails.pinCode}`}
          />
          {(isStartupClaimed || isMSMEClaimed) && (
            <ReviewRow
              label="Concession Status"
              value={isStartupClaimed ? '🚀 DPIIT Startup (50% Fee Waived)' : '🏭 MSME / Udyam (50% Fee Waived)'}
              highlight
            />
          )}
        </View>

        {/* 2. Trademark Details Summary */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🎯 Trademark & Representation</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEdit('TMMarkDetails')}
            >
              <Text style={styles.editBtnText}>EDIT ✏️</Text>
            </TouchableOpacity>
          </View>

          <ReviewRow label="Mark Type" value={markTypeConfig.label} />
          {markDetails.trademarkName ? (
            <ReviewRow label="Trademark Name" value={markDetails.trademarkName} highlight />
          ) : null}

          {markDetails.logoFile ? (
            <View style={styles.logoRow}>
              <Text style={styles.rowLabel}>Uploaded Artwork:</Text>
              {markDetails.logoFile.uri ? (
                <Image
                  source={{ uri: markDetails.logoFile.uri }}
                  style={styles.logoThumb}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.rowValue}>{markDetails.logoFile.name}</Text>
              )}
            </View>
          ) : null}

          {markDetails.isColourClaimed && (
            <ReviewRow label="Colour Claim" value={markDetails.colourDescription} />
          )}

          {markDetails.isOtherLanguage && (
            <>
              <ReviewRow label="Foreign Language" value={markDetails.languageName} />
              <ReviewRow label="Transliteration" value={markDetails.transliteration} />
              <ReviewRow label="English Meaning" value={markDetails.translation} />
            </>
          )}

          {markDetails.description ? (
            <ReviewRow label="Description" value={markDetails.description} />
          ) : null}
        </View>

        {/* 3. Classes & Goods/Services */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📦 Selected Classes & Goods</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEdit('TMClasses')}
            >
              <Text style={styles.editBtnText}>EDIT ✏️</Text>
            </TouchableOpacity>
          </View>

          {selectedClasses.map((cls) => {
            const clsInfo = NICE_CLASSES.find((n) => n.classNumber === cls);
            return (
              <View key={`review-cls-${cls}`} style={styles.classReviewItem}>
                <Text style={styles.classReviewHeading}>
                  Class {cls} — {clsInfo?.title} ({clsInfo?.type === 'goods' ? 'Goods' : 'Services'})
                </Text>
                <Text style={styles.classReviewDesc}>
                  {classDescriptions[cls] || clsInfo?.shortDescription}
                </Text>
              </View>
            );
          })}
        </View>

        {/* 4. Usage Status */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📅 Usage Status</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEdit('TMUsage')}
            >
              <Text style={styles.editBtnText}>EDIT ✏️</Text>
            </TouchableOpacity>
          </View>

          <ReviewRow
            label="Usage Basis"
            value={
              usageDetails.usageStatus === 'used'
                ? 'Already in Use (Prior Use Claimed)'
                : 'Proposed to be Used'
            }
          />
          {usageDetails.usageStatus === 'used' && (
            <>
              <ReviewRow label="Date of First Use" value={usageDetails.firstUseDate} highlight />
              <ReviewRow label="First Use Place" value={usageDetails.firstUsePlace} />
              <ReviewRow label="Goods/Services Used" value={usageDetails.goodsServicesUsed} />
            </>
          )}
        </View>

        {/* 5. Document Checklist Status */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📄 Supporting Documents</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEdit('TMDocuments')}
            >
              <Text style={styles.editBtnText}>EDIT ✏️</Text>
            </TouchableOpacity>
          </View>

          {documents.map((doc) => {
            const isUploaded =
              doc.status === 'uploaded' ||
              doc.status === 'approved' ||
              !!doc.file ||
              !!doc.fileUrl;
            return (
              <View key={doc.id} style={styles.docStatusRow}>
                <Text
                  style={[
                    styles.docCheckIcon,
                    isUploaded ? styles.docCheckSuccess : styles.docCheckPending,
                  ]}
                >
                  {isUploaded ? '✓' : '⚠️'}
                </Text>
                <Text style={styles.docLabelText} numberOfLines={1}>
                  {doc.label}
                </Text>
                <Text
                  style={[
                    styles.docStatusBadge,
                    isUploaded ? styles.badgeUploaded : styles.badgeMissing,
                  ]}
                >
                  {isUploaded ? 'Uploaded' : doc.required ? 'Required' : 'Optional'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* 6. Statutory Disclaimer Box */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚖️ Statutory Legal Notice & Disclaimer</Text>
          <Text style={styles.disclaimerBody}>{TM_DISCLAIMER_TEXT}</Text>
        </View>

        {/* 7. Declaration Checkbox */}
        <View style={styles.declarationSection}>
          <CheckboxField
            label="I hereby declare that all particulars stated in this application are true and correct to the best of my knowledge, and the trademark is owned by the applicant as declared under the Trade Marks Act, 1999."
            value={isDeclared}
            onValueChange={(val) => {
              setIsDeclared(val);
              if (val) setDeclarationError(null);
            }}
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
            style={({ pressed }) => [
              styles.continueBtn,
              !isDeclared && styles.continueBtnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>CONTINUE TO PAYMENT →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ReviewRow({ label, value, highlight = false }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.rowLabel}>{label}:</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
        {value || '—'}
      </Text>
    </View>
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
  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderColor: '#E74C3C',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#C0392B',
    fontSize: 13,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E8EC',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  editBtn: {
    backgroundColor: '#FFF8E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  editBtnText: {
    color: COLORS.gold,
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  reviewRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.grayText,
    width: 130,
  },
  rowValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '500',
  },
  rowValueHighlight: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoThumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  classReviewItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  classReviewHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  classReviewDesc: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 16,
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  docCheckIcon: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: 'bold',
  },
  docCheckSuccess: {
    color: COLORS.whatsapp,
  },
  docCheckPending: {
    color: '#E74C3C',
  },
  docLabelText: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.primaryDark,
  },
  docStatusBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeUploaded: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  badgeMissing: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  disclaimerCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 6,
  },
  disclaimerBody: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 17,
  },
  declarationSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
