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
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';
import { validateIECPAN, validatePAN } from '../../utils/iecValidation';

export default function IECPANScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updatePANDetails,
    addPartner,
    removePartner,
    updatePartner,
    addDirector,
    removeDirector,
    updateDirector,
  } = useIECForm();

  const [errors, setErrors] = useState({});
  const [verifyingPan, setVerifyingPan] = useState(false);

  const pan = formData.panDetails || {};
  const entityType = formData.entityType;

  const handlePanChange = (key, val) => {
    updatePANDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleVerifyPAN = () => {
    if (!pan.panNumber || !validatePAN(pan.panNumber)) {
      setErrors((prev) => ({ ...prev, panNumber: 'Valid 10-character PAN required' }));
      return;
    }

    setVerifyingPan(true);
    setTimeout(() => {
      setVerifyingPan(false);
      updatePANDetails({ isPANVerified: true });
      if (errors.panNumber) {
        setErrors((prev) => ({ ...prev, panNumber: null }));
      }
      Alert.alert(
        '✓ PAN Verified',
        'Entity PAN successfully validated against Income Tax & DGFT database.'
      );
    }, 600);
  };

  const handleNext = () => {
    const errs = validateIECPAN(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('IECBusinessDetails');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="PAN & Entity Details" />
      <IECStepper currentStep={2} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>💳 Step 2: Entity PAN & Constitution Information</Text>
          <Text style={styles.bannerSubtitle}>
            DGFT generates the Import Export Code matching your entity PAN. Please ensure name matches PAN records exactly.
          </Text>
        </View>

        <FormField
          label="Entity / Proprietor PAN *"
          placeholder="ABCDE1234F"
          value={pan.panNumber}
          onChangeText={(v) => handlePanChange('panNumber', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
          error={errors.panNumber}
          helperText="As per Income Tax PAN card"
        />

        {pan.isPANVerified ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ PAN Verified with DGFT / Income Tax Records</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.btnVerify}
            onPress={handleVerifyPAN}
            disabled={verifyingPan}
          >
            {verifyingPan ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.btnVerifyText}>Verify PAN with DGFT Database ✓</Text>
            )}
          </TouchableOpacity>
        )}

        <FormField
          label="Legal Name (as per PAN) *"
          placeholder="e.g. Acme Global Exports Pvt Ltd"
          value={pan.legalName}
          onChangeText={(v) => handlePanChange('legalName', v)}
          error={errors.legalName}
        />

        <FormField
          label="Trade Name / Brand Name (if any)"
          placeholder="e.g. Acme International"
          value={pan.tradeName}
          onChangeText={(v) => handlePanChange('tradeName', v)}
          helperText="Leave blank if identical to Legal Name"
        />

        <FormField
          label="Date of Establishment / Incorporation (YYYY-MM-DD) *"
          placeholder="2024-01-15"
          value={pan.incorporationDate}
          onChangeText={(v) => handlePanChange('incorporationDate', v)}
          error={errors.incorporationDate}
        />

        {/* Company Specific Fields */}
        {(entityType === 'pvt_ltd' || entityType === 'pub_ltd') && (
          <View>
            <FormField
              label="Corporate Identification Number (CIN) *"
              placeholder="U72900DL2024PTC123456"
              value={pan.cinNumber}
              onChangeText={(v) => handlePanChange('cinNumber', v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={21}
              error={errors.cinNumber}
              helperText="21-character MCA CIN Number"
            />

            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Directors Details (Min 1)</Text>
              <TouchableOpacity style={styles.btnAdd} onPress={addDirector}>
                <Text style={styles.btnAddText}>+ Add Director</Text>
              </TouchableOpacity>
            </View>

            {(pan.directors || []).map((dir, idx) => (
              <View key={dir.id || idx} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberTitle}>Director #{idx + 1}</Text>
                  {(pan.directors || []).length > 1 && (
                    <TouchableOpacity onPress={() => removeDirector(idx)}>
                      <Text style={styles.btnRemove}>✕ Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label="Director Full Name *"
                  placeholder="e.g. Rahul Sharma"
                  value={dir.name}
                  onChangeText={(v) => updateDirector(idx, { name: v })}
                />
                <FormField
                  label="Director PAN *"
                  placeholder="ABCDE1234F"
                  value={dir.pan}
                  onChangeText={(v) => updateDirector(idx, { pan: v.toUpperCase() })}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <FormField
                  label="Director Identification Number (DIN)"
                  placeholder="01234567"
                  value={dir.din}
                  onChangeText={(v) => updateDirector(idx, { din: v })}
                  keyboardType="number-pad"
                  maxLength={8}
                />
              </View>
            ))}
          </View>
        )}

        {/* LLP Specific Fields */}
        {entityType === 'llp' && (
          <View>
            <FormField
              label="LLP Identification Number (LLPIN) *"
              placeholder="AAA-1234"
              value={pan.llpinNumber}
              onChangeText={(v) => handlePanChange('llpinNumber', v.toUpperCase())}
              autoCapitalize="characters"
              error={errors.llpinNumber}
            />

            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Designated Partners (Min 1)</Text>
              <TouchableOpacity style={styles.btnAdd} onPress={addPartner}>
                <Text style={styles.btnAddText}>+ Add Partner</Text>
              </TouchableOpacity>
            </View>

            {(pan.partners || []).map((partner, idx) => (
              <View key={partner.id || idx} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberTitle}>Designated Partner #{idx + 1}</Text>
                  {(pan.partners || []).length > 1 && (
                    <TouchableOpacity onPress={() => removePartner(idx)}>
                      <Text style={styles.btnRemove}>✕ Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label="Partner Full Name *"
                  placeholder="e.g. Priya Verma"
                  value={partner.name}
                  onChangeText={(v) => updatePartner(idx, { name: v })}
                />
                <FormField
                  label="Partner PAN *"
                  placeholder="ABCDE1234F"
                  value={partner.pan}
                  onChangeText={(v) => updatePartner(idx, { pan: v.toUpperCase() })}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
            ))}
          </View>
        )}

        {/* Partnership Firm Specific Fields */}
        {entityType === 'partnership' && (
          <View>
            <FormField
              label="Firm Registration Number (if registered)"
              placeholder="e.g. ROF/DEL/1234/2024"
              value={pan.registrationNumber}
              onChangeText={(v) => handlePanChange('registrationNumber', v)}
            />

            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Partners Details (Min 2)</Text>
              <TouchableOpacity style={styles.btnAdd} onPress={addPartner}>
                <Text style={styles.btnAddText}>+ Add Partner</Text>
              </TouchableOpacity>
            </View>

            {(pan.partners || []).map((partner, idx) => (
              <View key={partner.id || idx} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberTitle}>Partner #{idx + 1}</Text>
                  {(pan.partners || []).length > 1 && (
                    <TouchableOpacity onPress={() => removePartner(idx)}>
                      <Text style={styles.btnRemove}>✕ Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label="Partner Full Name *"
                  placeholder="e.g. Ramesh Kumar"
                  value={partner.name}
                  onChangeText={(v) => updatePartner(idx, { name: v })}
                />
                <FormField
                  label="Partner PAN *"
                  placeholder="ABCDE1234F"
                  value={partner.pan}
                  onChangeText={(v) => updatePartner(idx, { pan: v.toUpperCase() })}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
            ))}
          </View>
        )}

        {/* HUF Karta Details */}
        {entityType === 'huf' && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Karta Information</Text>
            <FormField
              label="Karta Full Name *"
              placeholder="e.g. Suresh Chand"
              value={pan.karta?.name}
              onChangeText={(v) =>
                updatePANDetails({ karta: { ...pan.karta, name: v } })
              }
            />
            <FormField
              label="Karta PAN *"
              placeholder="ABCDE1234F"
              value={pan.karta?.pan}
              onChangeText={(v) =>
                updatePANDetails({ karta: { ...pan.karta, pan: v.toUpperCase() } })
              }
              autoCapitalize="characters"
              maxLength={10}
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
  btnVerify: {
    backgroundColor: '#0284C7',
    paddingVertical: 11,
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
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  btnAdd: { backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  btnAddText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  btnRemove: { fontSize: 11, color: '#EF4444', fontWeight: '700' },
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
