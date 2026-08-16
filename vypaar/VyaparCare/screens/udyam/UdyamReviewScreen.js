import React, { useState } from 'react';
import {
  Alert,
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
import UdyamStepper from '../../components/UdyamStepper';
import {
  UDYAM_DISCLAIMER_TEXT,
  UDYAM_OPTIONAL_DOCUMENTS,
} from '../../config/udyamConfig';
import { COLORS } from '../../constants/theme';
import { useUdyamForm } from '../../contexts/UdyamFormContext';
import { formatINR } from '../../utils/currency';
import { pickFile } from '../../utils/pickFile';
import { validateFullUdyamApplication } from '../../utils/udyamValidation';

export default function UdyamReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateFormData,
    msmeCategory,
    setOptionalDocument,
    removeOptionalDocument,
  } = useUdyamForm();

  const [declared, setDeclared] = useState(formData.declarationAccepted || false);
  const [errorMsg, setErrorMsg] = useState(null);

  const aadhaar = formData.aadhaarDetails || {};
  const pan = formData.panDetails || {};
  const business = formData.businessDetails || {};
  const org = formData.organisationDetails || {};
  const addr = formData.officialAddress || {};
  const units = formData.plantUnits || [];
  const bank = formData.bankDetails || {};
  const nics = formData.selectedNICCodes || [];
  const fin = formData.financialDetails || {};
  const optUploads = formData.optionalDocuments || {};

  const handleToggleDeclaration = () => {
    const next = !declared;
    setDeclared(next);
    updateFormData({ declarationAccepted: next });
    if (errorMsg) setErrorMsg(null);
  };

  const handleUploadOpt = async (docId) => {
    try {
      const file = await pickFile();
      if (file) {
        setOptionalDocument(docId, file);
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message || 'Could not pick file');
    }
  };

  const handleNext = () => {
    if (!declared) {
      setErrorMsg('Please accept the statutory self-declaration before proceeding');
      Alert.alert('Declaration Required', 'You must check the statutory declaration to proceed.');
      return;
    }

    const fullErrs = validateFullUdyamApplication(formData);
    if (Object.keys(fullErrs).length > 0) {
      Alert.alert(
        'Incomplete Details',
        'Some required fields are missing. Please review previous steps.'
      );
      return;
    }

    navigation.navigate('UdyamPayment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Review Udyam Application" />
      <UdyamStepper currentStep={10} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📋 Step 10: Complete Application Summary</Text>
          <Text style={styles.bannerSubtitle}>
            Verify all details before payment. You can tap "Edit" on any section to modify.
          </Text>
        </View>

        {/* 1. Aadhaar & Applicant */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>1. Applicant & Aadhaar Verification</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UdyamAadhaar')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Name as per Aadhaar:</Text>
            <Text style={styles.valBold}>{aadhaar.nameAsPerAadhaar || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aadhaar Holder:</Text>
            <Text style={styles.val}>{aadhaar.aadhaarHolderType || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile (Aadhaar Linked):</Text>
            <Text style={styles.val}>{aadhaar.mobile || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aadhaar Verification:</Text>
            <Text style={styles.valSuccess}>✓ Verified with OTP</Text>
          </View>
        </View>

        {/* 2. PAN & GSTIN */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>2. PAN & Tax Verification</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UdyamPAN')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAN Number:</Text>
            <Text style={styles.valHighlight}>{pan.panNumber || 'No PAN'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Name on PAN:</Text>
            <Text style={styles.val}>{pan.nameAsPerPAN || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>GSTIN Status:</Text>
            <Text style={styles.val}>
              {pan.hasGSTIN === 'yes' ? pan.gstin : 'Not Applicable / Exempt'}
            </Text>
          </View>
        </View>

        {/* 3. Enterprise & Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>3. Enterprise & Organisation</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UdyamBusiness')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Enterprise Name:</Text>
            <Text style={styles.valBold}>{business.enterpriseName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Organisation Type:</Text>
            <Text style={styles.val}>{business.organisationType?.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Major Activity:</Text>
            <Text style={styles.val}>{business.majorActivity?.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Commencement Date:</Text>
            <Text style={styles.val}>{business.commencementDate || '-'}</Text>
          </View>
        </View>

        {/* 4. Official Address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>4. Official Address & Units ({units.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UdyamAddress')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registered Address:</Text>
            <Text style={[styles.val, { flex: 1 }]}>
              {[addr.flatDoorBlock, addr.premisesName, addr.roadStreet, addr.city, addr.pinCode]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Operating Units:</Text>
            <Text style={styles.val}>{units.map((u) => u.unitName).join(' | ')}</Text>
          </View>
        </View>

        {/* 5. Bank Account */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>5. Bank Details</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UdyamBank')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bank Name:</Text>
            <Text style={styles.val}>{bank.bankName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Number:</Text>
            <Text style={styles.val}>{bank.accountNumber || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IFSC Code:</Text>
            <Text style={styles.valHighlight}>{bank.ifsc || '-'}</Text>
          </View>
        </View>

        {/* 6. NIC Codes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>6. NIC Activities ({nics.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UdyamNIC')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          {nics.map((n, i) => (
            <View key={i} style={styles.subItem}>
              <Text style={styles.subTitle}>NIC {n.nic5} — {n.activity}</Text>
              <Text style={styles.subDesc}>{n.description}</Text>
            </View>
          ))}
        </View>

        {/* 7. Financials & Classification */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>7. Classification & Financials</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UdyamFinancials')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Calculated Category:</Text>
            <Text style={styles.valSuccess}>{msmeCategory.categoryLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Plant & Machinery WDV:</Text>
            <Text style={styles.val}>{formatINR(fin.investmentAmount || 0)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Domestic Turnover:</Text>
            <Text style={styles.val}>{formatINR(fin.domesticTurnover || 0)}</Text>
          </View>
        </View>

        {/* 8. Optional Internal Documents Section */}
        <View style={styles.optionalSection}>
          <Text style={styles.optionalHeader}>Optional Supporting Documents (Internal Verification)</Text>
          <Text style={styles.optionalSub}>
            Paperless filing is based on self-declaration. Uploading these documents is completely optional and strictly for internal verification.
          </Text>

          {UDYAM_OPTIONAL_DOCUMENTS.map((doc) => {
            const file = optUploads[doc.id];
            const isUploaded = !!file;

            return (
              <View key={doc.id} style={styles.optDocCard}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.optDocTitle}>
                    {doc.label} <Text style={styles.optionalTag}>(Optional)</Text>
                  </Text>
                  <Text style={styles.optDocHint}>{doc.hint}</Text>
                  {isUploaded && (
                    <Text style={styles.optFileName}>📄 {file.name}</Text>
                  )}
                </View>
                {isUploaded ? (
                  <TouchableOpacity
                    style={styles.btnRemoveOpt}
                    onPress={() => removeOptionalDocument(doc.id)}
                  >
                    <Text style={styles.btnRemoveOptText}>✕</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.btnUploadOpt}
                    onPress={() => handleUploadOpt(doc.id)}
                  >
                    <Text style={styles.btnUploadOptText}>+ Attach</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Statutory Legal Declaration */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚖️ Statutory Self-Declaration (MSMED Act)</Text>
          <Text style={styles.disclaimerText}>{UDYAM_DISCLAIMER_TEXT}</Text>

          <TouchableOpacity
            style={styles.declarationRow}
            onPress={handleToggleDeclaration}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, declared && styles.checkboxChecked]}>
              {declared && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.declarationText}>
              I hereby declare that all information furnished herein is true, correct and complete to the best of my knowledge and belief under the Micro, Small and Medium Enterprises Development Act, 2006.
            </Text>
          </TouchableOpacity>
          {errorMsg && <Text style={styles.errorText}>⚠️ {errorMsg}</Text>}
        </View>
      </ScrollView>

      {/* ---------- Footer ---------- */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 14) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.btnNext, pressed && styles.btnPressed]}
          onPress={handleNext}
        >
          <Text style={styles.btnNextText}>PROCEED TO SERVICE PAYMENT →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  banner: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#0284C7', lineHeight: 18 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
  btnEdit: { fontSize: 12, color: '#0284C7', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 12, color: '#64748B' },
  val: { fontSize: 12, color: COLORS.text, fontWeight: '600', textAlign: 'right' },
  valBold: { fontSize: 12, color: COLORS.text, fontWeight: '700', textAlign: 'right' },
  valHighlight: { fontSize: 12, color: '#0284C7', fontWeight: '700', textAlign: 'right' },
  valSuccess: { fontSize: 12, color: '#059669', fontWeight: '800', textAlign: 'right' },
  subItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subTitle: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  subDesc: { fontSize: 10, color: '#64748B' },
  optionalSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionalHeader: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 2 },
  optionalSub: { fontSize: 11, color: '#64748B', lineHeight: 15, marginBottom: 12 },
  optDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optDocTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  optionalTag: { fontSize: 11, color: '#0284C7', fontWeight: '600' },
  optDocHint: { fontSize: 10, color: '#64748B', marginTop: 1 },
  optFileName: { fontSize: 10, color: '#059669', fontWeight: '600', marginTop: 2 },
  btnUploadOpt: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnUploadOptText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  btnRemoveOpt: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnRemoveOptText: { fontSize: 11, color: '#DC2626', fontWeight: '700' },
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  disclaimerTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  disclaimerText: { fontSize: 11, color: '#B45309', lineHeight: 15, marginBottom: 12 },
  declarationRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#92400E',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  checkMark: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  declarationText: { fontSize: 11, color: '#78350F', flex: 1, lineHeight: 16, fontWeight: '600' },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 8, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btnNext: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.85 },
  btnNextText: { fontSize: 15, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
});
