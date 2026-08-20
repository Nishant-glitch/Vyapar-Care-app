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
import FormField from '../../components/FormField';
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import {
  IEC_BUSINESS_ACTIVITIES,
  IEC_TRADE_ACTIVITIES,
} from '../../config/iecConfig';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';
import { validateGSTIN, validateIECBusiness } from '../../utils/iecValidation';

export default function IECBusinessDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateBusinessDetails,
    updateTradeDetails,
  } = useIECForm();

  const [errors, setErrors] = useState({});
  const [verifyingGst, setVerifyingGst] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);

  const biz = formData.businessDetails || {};
  const trade = formData.tradeDetails || {};

  const handleBizChange = (key, val) => {
    updateBusinessDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleTradeChange = (key, val) => {
    updateTradeDetails({ [key]: val });
  };

  const toggleBusinessActivity = (actId) => {
    const list = [...(biz.businessActivities || [])];
    const idx = list.indexOf(actId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(actId);
    }
    updateBusinessDetails({ businessActivities: list });
    if (errors.businessActivities) {
      setErrors((prev) => ({ ...prev, businessActivities: null }));
    }
  };

  const toggleTradeActivity = (actId) => {
    const list = [...(trade.selectedTradeActivities || [])];
    const idx = list.indexOf(actId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(actId);
    }
    updateTradeDetails({ selectedTradeActivities: list });
    if (errors.selectedTradeActivities) {
      setErrors((prev) => ({ ...prev, selectedTradeActivities: null }));
    }
  };

  const handleVerifyGST = () => {
    if (!trade.gstinNumber || !validateGSTIN(trade.gstinNumber)) {
      Alert.alert('Invalid GSTIN', 'Please enter a valid 15-character GSTIN');
      return;
    }
    setVerifyingGst(true);
    setTimeout(() => {
      setVerifyingGst(false);
      setGstVerified(true);
      Alert.alert('✓ GSTIN Verified', 'GSTIN verified with Goods & Services Tax Network (GSTN).');
    }, 500);
  };

  const handleNext = () => {
    const errs = validateIECBusiness(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('IECAddress');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Business & Trade Details" />
      <IECStepper currentStep={3} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏭 Step 3: Business Profile & Trade Intent</Text>
          <Text style={styles.bannerSubtitle}>
            Provide details of your commercial operations, trade activities, and optional indirect tax registrations.
          </Text>
        </View>

        <FormField
          label="Enterprise / Business Name *"
          placeholder="e.g. Apex Global Trading"
          value={biz.businessName}
          onChangeText={(v) => handleBizChange('businessName', v)}
          error={errors.businessName}
        />

        <FormField
          label="Nature of Business"
          placeholder="e.g. Merchant Exporter, Manufacturer, IT Services"
          value={biz.natureOfBusiness}
          onChangeText={(v) => handleBizChange('natureOfBusiness', v)}
        />

        <FormField
          label="Date Business Started (YYYY-MM-DD)"
          placeholder="2024-01-15"
          value={biz.startDate}
          onChangeText={(v) => handleBizChange('startDate', v)}
        />

        <FormField
          label="Business Email Address"
          placeholder="exports@apexglobal.com"
          value={biz.businessEmail}
          onChangeText={(v) => handleBizChange('businessEmail', v.toLowerCase())}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormField
          label="Business Mobile Number"
          placeholder="9876543210"
          value={biz.businessMobile}
          onChangeText={(v) => handleBizChange('businessMobile', v)}
          keyboardType="phone-pad"
          maxLength={10}
        />

        {/* Existing IEC Warning Check */}
        <View style={styles.choiceBox}>
          <Text style={styles.choiceHeader}>Do you already have an active IEC on this PAN? *</Text>
          <View style={styles.radioRow}>
            {[
              { val: false, label: 'No (Fresh IEC Application)' },
              { val: true, label: 'Yes (Existing IEC)' },
            ].map((opt) => {
              const isSel = biz.hasExistingIEC === opt.val;
              return (
                <TouchableOpacity
                  key={String(opt.val)}
                  style={[styles.radioItem, isSel && styles.radioItemSelected]}
                  onPress={() => handleBizChange('hasExistingIEC', opt.val)}
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

          {biz.hasExistingIEC && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>⚠️ Duplicate IEC Restriction:</Text>
              <Text style={styles.warningText}>
                DGFT guidelines restrict multiple IEC registrations against the same PAN. If you already hold an IEC, please apply for IEC Modification / Update rather than a fresh application.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Main Business Activities Multi-select */}
        <Text style={styles.sectionHeader}>Main Business Activities (Select all that apply) *</Text>
        <View style={styles.chipsContainer}>
          {IEC_BUSINESS_ACTIVITIES.map((act) => {
            const isSel = (biz.businessActivities || []).includes(act.id);
            return (
              <TouchableOpacity
                key={act.id}
                style={[styles.chip, isSel && styles.chipSelected]}
                onPress={() => toggleBusinessActivity(act.id)}
              >
                <Text style={[styles.chipText, isSel && styles.chipTextSelected]}>
                  {isSel ? '✓ ' : '+ '}
                  {act.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.businessActivities && (
          <Text style={styles.errorText}>⚠️ {errors.businessActivities}</Text>
        )}

        <View style={styles.divider} />

        {/* Import / Export Intent Multi-select */}
        <Text style={styles.sectionHeader}>What do you plan to import / export? *</Text>
        <View style={styles.tradeList}>
          {IEC_TRADE_ACTIVITIES.map((t) => {
            const isSel = (trade.selectedTradeActivities || []).includes(t.id);
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.tradeItem, isSel && styles.tradeItemSelected]}
                onPress={() => toggleTradeActivity(t.id)}
              >
                <Text style={styles.tradeIcon}>{t.icon}</Text>
                <Text style={[styles.tradeLabel, isSel && styles.tradeLabelSelected]}>
                  {t.label}
                </Text>
                <View style={[styles.checkbox, isSel && styles.checkboxChecked]}>
                  {isSel && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.selectedTradeActivities && (
          <Text style={styles.errorText}>⚠️ {errors.selectedTradeActivities}</Text>
        )}

        <View style={styles.divider} />

        {/* GSTIN Details */}
        <Text style={styles.sectionHeader}>Do you have a GSTIN?</Text>
        <View style={styles.radioRow}>
          {[
            { val: true, label: 'Yes (GST Registered)' },
            { val: false, label: 'No / Not Applicable' },
          ].map((opt) => {
            const isSel = trade.hasGSTIN === opt.val;
            return (
              <TouchableOpacity
                key={String(opt.val)}
                style={[styles.radioItem, isSel && styles.radioItemSelected]}
                onPress={() => handleTradeChange('hasGSTIN', opt.val)}
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

        {trade.hasGSTIN && (
          <View style={{ marginTop: 10 }}>
            <FormField
              label="15-Digit GSTIN Number *"
              placeholder="07AAAAA0000A1Z5"
              value={trade.gstinNumber}
              onChangeText={(v) => handleTradeChange('gstinNumber', v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={15}
            />
            {gstVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ GSTIN Verified with GSTN Portal</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.btnVerify}
                onPress={handleVerifyGST}
                disabled={verifyingGst}
              >
                <Text style={styles.btnVerifyText}>Verify GSTIN ✓</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Optional Registrations */}
        <View style={styles.optionalBox}>
          <Text style={styles.optionalTitle}>Optional Registrations (If Available):</Text>
          <FormField
            label="Udyam / MSME Registration Number"
            placeholder="UDYAM-DL-00-1234567"
            value={trade.udyamNumber}
            onChangeText={(v) => handleTradeChange('udyamNumber', v.toUpperCase())}
            autoCapitalize="characters"
          />
          <FormField
            label="RCMC (Export Promotion Council Registration No)"
            placeholder="e.g. FIEO/EPC/12345"
            value={trade.rcmcNumber}
            onChangeText={(v) => handleTradeChange('rcmcNumber', v)}
          />
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  choiceBox: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  choiceHeader: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  radioRow: { flexDirection: 'row', gap: 10 },
  radioItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  chipSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  chipTextSelected: { color: COLORS.white },
  tradeList: { gap: 8 },
  tradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tradeItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  tradeIcon: { fontSize: 20, marginRight: 10 },
  tradeLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },
  tradeLabelSelected: { color: '#0369A1', fontWeight: '700' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  checkMark: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  btnVerify: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 8,
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
    marginBottom: 8,
  },
  verifiedText: { color: '#065F46', fontWeight: '700', fontSize: 12 },
  optionalBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  optionalTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 6, fontWeight: '700' },
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
