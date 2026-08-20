import React, { useState } from 'react';
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
import FormField from '../../components/FormField';
import ScreenHeader from '../../components/ScreenHeader';
import UdyamStepper from '../../components/UdyamStepper';
import { UDYAM_ORGANISATION_TYPES } from '../../config/udyamConfig';
import { COLORS } from '../../constants/theme';
import { useUdyamForm } from '../../contexts/UdyamFormContext';
import { validateUdyamOrganisation } from '../../utils/udyamValidation';

export default function UdyamOrganisationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateOrganisationDetails } = useUdyamForm();
  const [errors, setErrors] = useState({});

  const orgType = formData.businessDetails?.organisationType || 'proprietorship';
  const org = formData.organisationDetails || {};
  const aadhaar = formData.aadhaarDetails || {};
  const pan = formData.panDetails || {};

  const orgObj = UDYAM_ORGANISATION_TYPES.find((o) => o.id === orgType);

  const handleChange = (key, val) => {
    updateOrganisationDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handlePartnerChange = (idx, field, val) => {
    const current = org.partners || [];
    const updated = [...current];
    updated[idx] = { ...updated[idx], [field]: val };
    updateOrganisationDetails({ partners: updated });
    if (errors.partners) {
      setErrors((prev) => ({ ...prev, partners: null }));
    }
  };

  const addPartner = () => {
    const current = org.partners || [];
    updateOrganisationDetails({
      partners: [
        ...current,
        { id: `p_${Date.now()}`, name: '', pan: '', mobile: '', isManaging: false },
      ],
    });
  };

  const removePartner = (idx) => {
    const current = org.partners || [];
    if (current.length <= 1) return;
    updateOrganisationDetails({
      partners: current.filter((_, i) => i !== idx),
    });
  };

  const handleNext = () => {
    const errs = validateUdyamOrganisation(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('UdyamAddress');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title={`${orgObj?.label || 'Organisation'} Details`} />
      <UdyamStepper currentStep={4} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            {orgObj?.icon} Step 4: {orgObj?.label} Information
          </Text>
          <Text style={styles.bannerSubtitle}>
            Specific constitutional details required by the Ministry of MSME.
          </Text>
        </View>

        {/* 1. Sole Proprietorship View */}
        {orgType === 'proprietorship' && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Sole Proprietorship Structure</Text>
            <Text style={styles.summarySub}>
              In a proprietorship, the business identity is linked with the proprietor.
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Proprietor Name:</Text>
              <Text style={styles.infoVal}>{aadhaar.nameAsPerAadhaar || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Proprietor PAN:</Text>
              <Text style={styles.infoValHighlight}>{pan.panNumber || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aadhaar Number:</Text>
              <Text style={styles.infoVal}>XXXXXXXX{aadhaar.aadhaarNumber?.slice(-4)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Verified Mobile:</Text>
              <Text style={styles.infoVal}>{aadhaar.mobile || 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* 2. Partnership Firm Form */}
        {orgType === 'partnership' && (
          <View>
            <FormField
              label="Partnership Firm Name *"
              placeholder="e.g. Sharma & Sons Enterprises"
              value={org.firmName}
              onChangeText={(v) => handleChange('firmName', v)}
              error={errors.firmName}
            />

            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Partners Details (Min 2 Partners)</Text>
            {errors.partners && (
              <Text style={styles.errorText}>⚠️ {errors.partners}</Text>
            )}

            {(org.partners || []).map((partner, idx) => (
              <View key={partner.id || idx} style={styles.partnerCard}>
                <View style={styles.partnerHeader}>
                  <Text style={styles.partnerBadge}>Partner #{idx + 1}</Text>
                  {(org.partners || []).length > 1 && (
                    <TouchableOpacity onPress={() => removePartner(idx)}>
                      <Text style={styles.btnRemove}>✕ Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label="Partner Full Name *"
                  placeholder="e.g. Amit Sharma"
                  value={partner.name}
                  onChangeText={(v) => handlePartnerChange(idx, 'name', v)}
                />
                <FormField
                  label="Partner PAN"
                  placeholder="ABCDE1234F"
                  value={partner.pan}
                  onChangeText={(v) => handlePartnerChange(idx, 'pan', v.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <FormField
                  label="Partner Mobile"
                  placeholder="9876543210"
                  value={partner.mobile}
                  onChangeText={(v) => handlePartnerChange(idx, 'mobile', v)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.btnAdd} onPress={addPartner}>
              <Text style={styles.btnAddText}>+ Add Another Partner</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. LLP Form */}
        {orgType === 'llp' && (
          <View>
            <FormField
              label="LLP Legal Name *"
              placeholder="e.g. Apex Logix LLP"
              value={org.llpName}
              onChangeText={(v) => handleChange('llpName', v)}
              error={errors.llpName}
            />
            <FormField
              label="LLP Identification Number (LLPIN) *"
              placeholder="AAA-1234"
              value={org.llpin}
              onChangeText={(v) => handleChange('llpin', v.toUpperCase())}
              autoCapitalize="characters"
              error={errors.llpin}
            />
            <FormField
              label="Designated Partner Name"
              placeholder="e.g. Suresh Kumar"
              value={org.authorizedSignatory}
              onChangeText={(v) => handleChange('authorizedSignatory', v)}
            />
          </View>
        )}

        {/* 4. Company Form (Private / Public Limited) */}
        {(orgType === 'pvt_ltd' || orgType === 'public_ltd') && (
          <View>
            <FormField
              label="Company Name (as per MCA) *"
              placeholder="e.g. Apex Global Solutions Private Limited"
              value={org.companyName}
              onChangeText={(v) => handleChange('companyName', v)}
              error={errors.companyName}
            />
            <FormField
              label="Corporate Identification Number (CIN) (21 Characters) *"
              placeholder="U72200DL2026PTC123456"
              value={org.cin}
              onChangeText={(v) => handleChange('cin', v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={21}
              error={errors.cin}
            />
            <FormField
              label="Authorized Signatory / Director Name"
              placeholder="e.g. Ramesh Kumar"
              value={org.authorizedSignatory}
              onChangeText={(v) => handleChange('authorizedSignatory', v)}
            />
          </View>
        )}

        {/* 5. HUF Form */}
        {orgType === 'huf' && (
          <View>
            <FormField
              label="Karta Full Name *"
              placeholder="e.g. Suresh Sharma"
              value={org.kartaName}
              onChangeText={(v) => handleChange('kartaName', v)}
              error={errors.kartaName}
            />
          </View>
        )}

        {/* 6. Society / Trust / Cooperative Form */}
        {(orgType === 'society' || orgType === 'trust' || orgType === 'cooperative') && (
          <View>
            <FormField
              label="Organisation / Trust Registration Number"
              placeholder="REG/2026/00123"
              value={org.registrationNumber}
              onChangeText={(v) => handleChange('registrationNumber', v)}
            />
            <FormField
              label="Authorized Person / Managing Trustee"
              placeholder="e.g. Dr. Rajesh Verma"
              value={org.authorizedSignatory}
              onChangeText={(v) => handleChange('authorizedSignatory', v)}
            />
          </View>
        )}
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
          <Text style={styles.btnNextText}>CONTINUE TO OFFICIAL ADDRESS →</Text>
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
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#0284C7', lineHeight: 18 },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 4 },
  summarySub: { fontSize: 12, color: '#64748B', marginBottom: 14, lineHeight: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#64748B' },
  infoVal: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  infoValHighlight: { fontSize: 12, fontWeight: '700', color: '#0284C7' },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: '600' },
  partnerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  partnerBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  btnRemove: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  btnAdd: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnAddText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
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
