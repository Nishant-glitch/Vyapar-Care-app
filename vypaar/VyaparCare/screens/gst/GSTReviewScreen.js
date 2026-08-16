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
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import {
  GST_CONSTITUTIONS,
  GST_DISCLAIMER_TEXT,
  GST_POSSESSION_TYPES,
  GST_REASONS,
} from '../../config/gstConfig';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { validateFullGSTApplication } from '../../utils/gstValidation';

export default function GSTReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData, requiredDocuments } = useGSTForm();
  const [declared, setDeclared] = useState(formData.declarationAccepted || false);
  const [errorMsg, setErrorMsg] = useState(null);

  const constitutionObj = GST_CONSTITUTIONS.find(
    (c) => c.id === formData.constitution
  );
  const reasonObj = GST_REASONS.find(
    (r) => r.id === formData.registrationReason
  );
  const possessionObj = GST_POSSESSION_TYPES.find(
    (p) => p.id === formData.premisesDetails?.possessionType
  );

  const bDetails = formData.businessDetails || {};
  const premises = formData.premisesDetails || {};
  const bank = formData.bankDetails || {};
  const promoters = formData.promoters || [];
  const goods = formData.goodsServices || [];
  const uploads = formData.documents || {};

  const handleToggleDeclaration = () => {
    const next = !declared;
    setDeclared(next);
    updateFormData({ declarationAccepted: next });
    if (errorMsg) setErrorMsg(null);
  };

  const handleNext = () => {
    if (!declared) {
      setErrorMsg('Please accept the statutory declaration before proceeding');
      Alert.alert(
        'Declaration Required',
        'You must check the statutory legal declaration under CGST Act, 2017 to proceed.'
      );
      return;
    }

    const fullErrors = validateFullGSTApplication(formData);
    if (Object.keys(fullErrors).length > 0) {
      Alert.alert(
        'Incomplete Application',
        'Some required fields or documents are missing. Please review previous steps.'
      );
      return;
    }

    navigation.navigate('GSTPayment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Review GST Application" />
      <GSTStepper currentStep={8} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🔍 Step 8: Pre-Filing Application Review</Text>
          <Text style={styles.bannerSubtitle}>
            Carefully verify all details before payment and submission to the GST Portal.
          </Text>
        </View>

        {/* 1. Constitution & Reason */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>1. Constitution & Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GSTConstitution')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Business Entity:</Text>
            <Text style={styles.val}>{constitutionObj?.label || formData.constitution}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registration Basis:</Text>
            <Text style={styles.val}>{reasonObj?.label || formData.registrationReason}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Composition Scheme:</Text>
            <Text style={styles.val}>{formData.isComposition ? 'Yes (Opted In)' : 'No (Regular Scheme)'}</Text>
          </View>
        </View>

        {/* 2. Business Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>2. Business & PAN Information</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GSTBusinessDetails')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Legal Name (PAN):</Text>
            <Text style={styles.valBold}>{bDetails.legalName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trade Name:</Text>
            <Text style={styles.valBold}>{bDetails.tradeName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAN:</Text>
            <Text style={styles.valHighlight}>{bDetails.pan || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Commencement Date:</Text>
            <Text style={styles.val}>{bDetails.commencementDate || '-'}</Text>
          </View>
        </View>

        {/* 3. Promoters */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>3. Promoters / Signatories ({promoters.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GSTPromoters')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          {promoters.map((p, idx) => (
            <View key={idx} style={styles.subItem}>
              <Text style={styles.subItemTitle}>
                #{idx + 1}: {p.name} {p.isAuthorizedSignatory && '🌟 (Authorized Signatory)'}
              </Text>
              <Text style={styles.subItemText}>Mobile: {p.mobile} | Email: {p.email}</Text>
              <Text style={styles.subItemText}>PAN: {p.pan} | Aadhaar: {p.aadhaar}</Text>
            </View>
          ))}
        </View>

        {/* 4. Premises */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>4. Principal Place of Business</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GSTPremises')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Possession Nature:</Text>
            <Text style={styles.val}>{possessionObj?.label || premises.possessionType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={[styles.val, { flex: 1 }]}>
              {[
                premises.buildingNumber,
                premises.buildingName,
                premises.street,
                premises.city,
                premises.pinCode,
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
        </View>

        {/* 5. Goods & Services */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>5. Top Goods & Services ({goods.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GSTGoodsServices')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          {goods.map((g, idx) => (
            <View key={idx} style={styles.subItem}>
              <Text style={styles.subItemTitle}>
                {g.type === 'goods' ? 'HSN' : 'SAC'}: {g.hsnSacCode || 'Auto-classify'}
              </Text>
              <Text style={styles.subItemText}>{g.description}</Text>
            </View>
          ))}
        </View>

        {/* 6. Bank Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>6. Bank Account</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GSTBankDetails')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Number:</Text>
            <Text style={styles.val}>{bank.accountNumber || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Type:</Text>
            <Text style={styles.val}>{bank.accountType || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IFSC Code:</Text>
            <Text style={styles.valHighlight}>{bank.ifsc || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bank & Branch:</Text>
            <Text style={styles.val}>{bank.bankName} {bank.branch ? `(${bank.branch})` : ''}</Text>
          </View>
        </View>

        {/* 7. Documents Uploaded */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>7. Uploaded Documents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GSTDocuments')}>
              <Text style={styles.btnEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
          {requiredDocuments.map((d) => {
            const hasFile = !!uploads[d.id];
            return (
              <View key={d.id} style={styles.docRow}>
                <Text style={styles.docCheck}>{hasFile ? '✅' : '❌'}</Text>
                <Text style={[styles.docName, !hasFile && { color: '#DC2626' }]}>
                  {d.label} {d.required && '*'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Statutory Legal Notice & Declaration */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚖️ Statutory Legal Notice & Declaration</Text>
          <Text style={styles.disclaimerText}>{GST_DISCLAIMER_TEXT}</Text>

          <TouchableOpacity
            style={styles.declarationRow}
            onPress={handleToggleDeclaration}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                declared && styles.checkboxChecked,
              ]}
            >
              {declared && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.declarationText}>
              I hereby solemnly declare that all information furnished herein is true, correct and complete to the best of my knowledge and belief under the Central Goods and Services Tax Act, 2017.
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
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#2563EB', lineHeight: 18 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
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
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  btnEdit: { fontSize: 13, color: '#059669', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 12, color: '#64748B' },
  val: { fontSize: 12, color: COLORS.text, fontWeight: '600', textAlign: 'right' },
  valBold: { fontSize: 13, color: COLORS.text, fontWeight: '700', textAlign: 'right' },
  valHighlight: { fontSize: 12, color: '#059669', fontWeight: '700', textAlign: 'right' },
  subItem: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subItemTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  subItemText: { fontSize: 11, color: '#64748B' },
  docRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  docCheck: { fontSize: 13, marginRight: 8 },
  docName: { fontSize: 12, color: COLORS.text, flex: 1 },
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  disclaimerTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  disclaimerText: { fontSize: 11, color: '#B45309', lineHeight: 16, marginBottom: 14 },
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
  checkboxChecked: { backgroundColor: '#059669', borderColor: '#059669' },
  checkMark: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  declarationText: { fontSize: 12, color: '#78350F', flex: 1, lineHeight: 17, fontWeight: '600' },
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
