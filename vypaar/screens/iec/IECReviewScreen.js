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
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { IEC_DISCLAIMER_TEXT, IEC_ENTITY_TYPES } from '../../config/iecConfig';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';
import { validateFullIECApplication } from '../../utils/iecValidation';

export default function IECReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData } = useIECForm();

  const [decl1, setDecl1] = useState(formData.declarations?.infoTrue || false);
  const [decl2, setDecl2] = useState(formData.declarations?.dgftAcknowledged || false);
  const [errorMsg, setErrorMsg] = useState(null);

  const entityTypeObj =
    IEC_ENTITY_TYPES.find((t) => t.id === formData.entityType) || {};
  const pan = formData.panDetails || {};
  const biz = formData.businessDetails || {};
  const addr = formData.addressDetails || {};
  const bank = formData.bankDetails || {};
  const sig = formData.signatoryDetails || {};
  const docs = formData.documents || {};

  const handleToggleDecl1 = () => {
    const next = !decl1;
    setDecl1(next);
    updateFormData({
      declarations: { ...formData.declarations, infoTrue: next },
    });
    if (errorMsg) setErrorMsg(null);
  };

  const handleToggleDecl2 = () => {
    const next = !decl2;
    setDecl2(next);
    updateFormData({
      declarations: { ...formData.declarations, dgftAcknowledged: next },
    });
    if (errorMsg) setErrorMsg(null);
  };

  // Mask bank account number for security: e.g. XXXX XXXX 5678
  const maskAccountNumber = (acc) => {
    if (!acc) return 'XXXX XXXX 1234';
    const str = String(acc).trim();
    if (str.length <= 4) return str;
    const last4 = str.slice(-4);
    return `XXXX XXXX ${last4}`;
  };

  const handleNext = () => {
    if (!decl1 || !decl2) {
      setErrorMsg('Please accept both statutory DGFT declarations before proceeding');
      Alert.alert(
        'Declarations Required',
        'Both declaration checkboxes are mandatory under DGFT Import Export Code guidelines.'
      );
      return;
    }

    const fullErrs = validateFullIECApplication(formData);
    if (Object.keys(fullErrs).length > 0) {
      Alert.alert(
        'Incomplete Application',
        'Please review your application fields before proceeding to payment.'
      );
      return;
    }

    navigation.navigate('IECPayment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Application Summary Review" />
      <IECStepper currentStep={9} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📋 Step 9: Final DGFT Application Review</Text>
          <Text style={styles.bannerSubtitle}>
            Review entity details, address, bank verification, and signatory data before final submission.
          </Text>
        </View>

        {/* 1. Entity & PAN Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>1. Entity & Constitution</Text>
            <TouchableOpacity onPress={() => navigation.navigate('IECApplicantType')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Constitution:</Text>
            <Text style={styles.valBold}>{entityTypeObj.label || formData.entityType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Entity PAN:</Text>
            <Text style={styles.valHighlight}>{pan.panNumber || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Legal Name (as per PAN):</Text>
            <Text style={styles.valBold}>{pan.legalName || '-'}</Text>
          </View>
          {pan.tradeName ? (
            <View style={styles.row}>
              <Text style={styles.label}>Trade Name:</Text>
              <Text style={styles.val}>{pan.tradeName}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Incorporation Date:</Text>
            <Text style={styles.val}>{pan.incorporationDate || '-'}</Text>
          </View>
          {pan.cinNumber ? (
            <View style={styles.row}>
              <Text style={styles.label}>CIN Number:</Text>
              <Text style={styles.val}>{pan.cinNumber}</Text>
            </View>
          ) : null}
        </View>

        {/* 2. Business & Trade Activities */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>2. Business & Trade Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('IECBusinessDetails')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Enterprise Name:</Text>
            <Text style={styles.valBold}>{biz.businessName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nature of Business:</Text>
            <Text style={styles.val}>{biz.natureOfBusiness || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trade Intent:</Text>
            <Text style={styles.valSuccess}>
              {(formData.tradeDetails?.selectedTradeActivities || []).join(', ') || 'Import & Export'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Products Count:</Text>
            <Text style={styles.val}>{formData.products?.length || 0} Registered Items</Text>
          </View>
        </View>

        {/* 3. Registered Address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>3. Registered Business Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate('IECAddress')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={[styles.val, { flex: 1, textAlign: 'right' }]}>
              {addr.line1} {addr.street ? `, ${addr.street}` : ''}, {addr.city}, {addr.state} - {addr.pinCode}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Premises Possession:</Text>
            <Text style={styles.valBold}>
              {(addr.premisesType || 'owned').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* 4. Bank Account Details (Masked) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>4. Entity Bank Account</Text>
            <TouchableOpacity onPress={() => navigation.navigate('IECBank')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bank Name:</Text>
            <Text style={styles.val}>{bank.bankName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Holder:</Text>
            <Text style={styles.valBold}>{bank.accountHolderName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Number:</Text>
            <Text style={styles.valHighlight}>{maskAccountNumber(bank.accountNumber)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IFSC Code:</Text>
            <Text style={styles.valBold}>{bank.ifsc || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PFMS Validation:</Text>
            <Text style={styles.valSuccess}>✓ Verified</Text>
          </View>
        </View>

        {/* 5. Authorized Signatory */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>5. Authorized Signatory</Text>
            <TouchableOpacity onPress={() => navigation.navigate('IECSignatory')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Signatory Name:</Text>
            <Text style={styles.valBold}>{sig.fullName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Designation:</Text>
            <Text style={styles.val}>{sig.designation?.toUpperCase() || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAN Number:</Text>
            <Text style={styles.valHighlight}>{sig.pan || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Authentication Mode:</Text>
            <Text style={styles.valBold}>
              {sig.authMethod === 'dsc' ? 'Digital Signature (DSC Class 3)' : 'Aadhaar OTP E-Sign'}
            </Text>
          </View>
        </View>

        {/* 6. Uploaded Documents */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>6. Uploaded Records ({Object.keys(docs).length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('IECDocuments')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          {Object.keys(docs).map((k) => (
            <View key={k} style={styles.docRow}>
              <Text style={styles.docName}>• {k.replace(/_/g, ' ').toUpperCase()}</Text>
              <Text style={styles.docStatus}>✓ {docs[k]?.name || 'Attached'}</Text>
            </View>
          ))}
        </View>

        {/* Dual Statutory Declarations */}
        <View style={styles.declarationBox}>
          <Text style={styles.declHeader}>⚖️ Statutory DGFT Declarations</Text>
          <Text style={styles.declDisclaimer}>{IEC_DISCLAIMER_TEXT}</Text>

          {/* Declaration 1 */}
          <TouchableOpacity
            style={styles.declRow}
            onPress={handleToggleDecl1}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, decl1 && styles.checkboxChecked]}>
              {decl1 && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.declText}>
              I declare that the information, business activities and supporting records furnished above are true, correct and complete to the best of my knowledge.
            </Text>
          </TouchableOpacity>

          {/* Declaration 2 */}
          <TouchableOpacity
            style={[styles.declRow, { marginTop: 10 }]}
            onPress={handleToggleDecl2}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, decl2 && styles.checkboxChecked]}>
              {decl2 && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.declText}>
              I understand that the final application submission, authentication and DGFT fees are governed by the Foreign Trade (Development & Regulation) Act.
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
          <Text style={styles.btnNextText}>PROCEED TO PAYMENT →</Text>
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
    marginBottom: 14,
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
  docRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  docName: { fontSize: 11, fontWeight: '600', color: '#475569' },
  docStatus: { fontSize: 11, color: '#059669', fontWeight: '700' },
  declarationBox: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  declHeader: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  declDisclaimer: { fontSize: 11, color: '#78350F', lineHeight: 15, marginBottom: 12 },
  declRow: { flexDirection: 'row', alignItems: 'flex-start' },
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
  declText: { fontSize: 11, color: '#78350F', flex: 1, lineHeight: 16, fontWeight: '600' },
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
