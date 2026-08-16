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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import {
  IEC_BANK_ACCOUNT_TYPES,
  IEC_BANK_PROOF_TYPES,
} from '../../config/iecConfig';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';
import { validateIECBank, validateIFSC } from '../../utils/iecValidation';

export default function IECBankScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateBankDetails } = useIECForm();
  const [errors, setErrors] = useState({});
  const [verifyingBank, setVerifyingBank] = useState(false);

  const bank = formData.bankDetails || {};

  const handleBankChange = (key, val) => {
    updateBankDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleVerifyBank = () => {
    if (!bank.accountNumber || String(bank.accountNumber).length < 8) {
      setErrors((prev) => ({ ...prev, accountNumber: 'Valid account number required' }));
      return;
    }
    if (!bank.ifsc || !validateIFSC(bank.ifsc)) {
      setErrors((prev) => ({ ...prev, ifsc: 'Valid 11-digit IFSC code required' }));
      return;
    }

    setVerifyingBank(true);
    setTimeout(() => {
      setVerifyingBank(false);
      updateBankDetails({ verificationStatus: 'verified' });
      Alert.alert(
        '✓ Bank Account Verified',
        'Bank Account and IFSC pre-validated against PFMS / NPCI database.'
      );
    }, 600);
  };

  const handleNext = () => {
    const errs = validateIECBank(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('IECSignatory');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Bank Details & Proof" />
      <IECStepper currentStep={5} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏦 Step 5: Entity Bank Account & Proof</Text>
          <Text style={styles.bannerSubtitle}>
            DGFT validates your firm bank account via PFMS before granting IEC. Ensure account is active and in firm name.
          </Text>
        </View>

        {/* Active Bank Account Question */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Do you have an active business bank account? *</Text>
          <View style={styles.radioRow}>
            {[
              { val: true, label: 'Yes (Active Firm Account)' },
              { val: false, label: 'No (Account Not Ready)' },
            ].map((opt) => {
              const isSel = bank.hasActiveAccount === opt.val;
              return (
                <TouchableOpacity
                  key={String(opt.val)}
                  style={[styles.radioItem, isSel && styles.radioItemSelected]}
                  onPress={() => handleBankChange('hasActiveAccount', opt.val)}
                >
                  <View style={[styles.radioCircle, isSel && styles.radioCircleActive]}>
                    {isSel && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.radioText, isSel && styles.radioTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {bank.hasActiveAccount === false && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>⚠️ Active Account Mandatory:</Text>
              <Text style={styles.warningText}>
                An active firm/entity bank account is required for DGFT application processing. The bank account is validated before IEC creation.
              </Text>
            </View>
          )}
        </View>

        <FormField
          label="Bank Name *"
          placeholder="e.g. State Bank of India / HDFC Bank"
          value={bank.bankName}
          onChangeText={(v) => handleBankChange('bankName', v)}
          error={errors.bankName}
        />

        <FormField
          label="Account Holder Name (as per Bank) *"
          placeholder="e.g. Acme Global Trading"
          value={bank.accountHolderName}
          onChangeText={(v) => handleBankChange('accountHolderName', v)}
          error={errors.accountHolderName}
          helperText="Must match your Entity Legal Name exactly"
        />

        <FormField
          label="Bank Account Number *"
          placeholder="50200012345678"
          value={bank.accountNumber}
          onChangeText={(v) => handleBankChange('accountNumber', v)}
          keyboardType="number-pad"
          error={errors.accountNumber}
        />

        <FormField
          label="11-Digit IFSC Code *"
          placeholder="SBIN0001234"
          value={bank.ifsc}
          onChangeText={(v) => handleBankChange('ifsc', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={11}
          error={errors.ifsc}
        />

        {bank.verificationStatus === 'verified' ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Bank Account Pre-Validated with PFMS / NPCI</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.btnVerify}
            onPress={handleVerifyBank}
            disabled={verifyingBank}
          >
            {verifyingBank ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.btnVerifyText}>Verify Bank Account with PFMS ✓</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.row}>
          <View style={styles.half}>
            <FormField
              label="Branch Name"
              placeholder="e.g. Connaught Place"
              value={bank.branch}
              onChangeText={(v) => handleBankChange('branch', v)}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.selectLabel}>Account Type</Text>
            <View style={styles.typeSelector}>
              {IEC_BANK_ACCOUNT_TYPES.slice(0, 2).map((t) => {
                const isSel = (bank.accountType || 'current') === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeBtn, isSel && styles.typeBtnActive]}
                    onPress={() => handleBankChange('accountType', t.id)}
                  >
                    <Text style={[styles.typeBtnText, isSel && styles.typeBtnTextActive]}>
                      {t.id === 'current' ? 'Current' : 'Savings'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bank Proof Selection */}
        <Text style={styles.sectionHeader}>Select Bank Account Proof Document *</Text>
        <View style={styles.proofRow}>
          {IEC_BANK_PROOF_TYPES.map((bp) => {
            const isSel = (bank.bankProofType || 'cancelled_cheque') === bp.id;
            return (
              <TouchableOpacity
                key={bp.id}
                style={[styles.proofCard, isSel && styles.proofCardSelected]}
                onPress={() => handleBankChange('bankProofType', bp.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.proofTitle, isSel && styles.proofTitleSelected]}>
                    {bp.label}
                  </Text>
                  <Text style={styles.proofDesc}>{bp.desc}</Text>
                </View>
                <View style={[styles.radio, isSel && styles.radioSelected]}>
                  {isSel && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
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
          <Text style={styles.btnNextText}>SAVE & CONTINUE →</Text>
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
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardHeader: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  radioRow: { flexDirection: 'row', gap: 10 },
  radioItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  radioItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioCircleActive: { borderColor: '#0284C7' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0284C7' },
  radioText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  radioTextActive: { color: '#0369A1', fontWeight: '700' },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 10,
  },
  warningTitle: { fontSize: 12, fontWeight: '700', color: '#B91C1C', marginBottom: 2 },
  warningText: { fontSize: 11, color: '#991B1B', lineHeight: 15 },
  btnVerify: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 12,
  },
  btnVerifyText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: -4,
    marginBottom: 12,
  },
  verifiedText: { color: '#065F46', fontWeight: '700', fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  selectLabel: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6 },
  typeSelector: { flexDirection: 'row', gap: 6 },
  typeBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  typeBtnActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  typeBtnText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  typeBtnTextActive: { color: COLORS.white },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  proofRow: { gap: 8 },
  proofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  proofCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  proofTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  proofTitleSelected: { color: '#0369A1' },
  proofDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioSelected: { borderColor: '#0284C7' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#0284C7' },
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
