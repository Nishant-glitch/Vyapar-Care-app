import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import OtherServicesStepper from '../../components/OtherServicesStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useOtherForm } from '../../contexts/OtherFormContext';

export default function OtherAdditionalScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateAdditionalInfo } = useOtherForm();

  const addInfo = formData.additionalInfo || {};

  const handleInfoChange = (key, val) => {
    updateAdditionalInfo({ [key]: val });
  };

  const handleNext = () => {
    navigation.navigate('OtherReview');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Additional Preferences" />
      <OtherServicesStepper currentStep={6} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📞 Step 6: Contact Preferences & Callback</Text>
          <Text style={styles.bannerSubtitle}>
            Specify how and when our legal / tax advisory team should reach out to you.
          </Text>
        </View>

        {/* Additional Notes */}
        <Text style={styles.inputLabel}>Anything else we should know?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any special instructions, historical background, or specific expectations..."
          placeholderTextColor="#94A3B8"
          value={addInfo.notes}
          onChangeText={(v) => handleInfoChange('notes', v)}
          multiline
          numberOfLines={4}
        />

        <View style={styles.divider} />

        {/* Preferred Contact Method */}
        <Text style={styles.sectionHeader}>Preferred Mode of Contact</Text>
        <View style={styles.radioRow}>
          {[
            { id: 'phone', label: 'Phone Call', icon: '📞' },
            { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
            { id: 'email', label: 'Email', icon: '✉️' },
          ].map((m) => {
            const isSel = (addInfo.preferredContactMethod || 'phone') === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.modeCard, isSel && styles.modeCardSelected]}
                onPress={() => handleInfoChange('preferredContactMethod', m.id)}
              >
                <Text style={styles.modeIcon}>{m.icon}</Text>
                <Text style={[styles.modeLabel, isSel && styles.modeLabelSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Preferred Contact Time */}
        <Text style={styles.sectionHeader}>Preferred Time to Call</Text>
        <View style={styles.timeGrid}>
          {[
            { id: 'morning', label: 'Morning (9 AM – 12 PM)' },
            { id: 'afternoon', label: 'Afternoon (12 PM – 4 PM)' },
            { id: 'evening', label: 'Evening (4 PM – 8 PM)' },
            { id: 'any_time', label: 'Any Time (Business Hours)' },
          ].map((t) => {
            const isSel = (addInfo.preferredContactTime || 'any_time') === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.timeChip, isSel && styles.timeChipSelected]}
                onPress={() => handleInfoChange('preferredContactTime', t.id)}
              >
                <Text style={[styles.timeText, isSel && styles.timeTextSelected]}>
                  {isSel ? '✓ ' : '+ '}
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Expert Callback Request Toggle */}
        <TouchableOpacity
          style={[styles.callbackBox, addInfo.requestCallback && styles.callbackBoxActive]}
          onPress={() => handleInfoChange('requestCallback', !addInfo.requestCallback)}
          activeOpacity={0.8}
        >
          <View style={styles.checkbox}>
            {addInfo.requestCallback && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.callbackTitle}>I would like an expert to call me</Text>
            <Text style={styles.callbackDesc}>
              Request a dedicated 1-on-1 phone briefing from our senior consultant.
            </Text>
          </View>
        </TouchableOpacity>

        {addInfo.requestCallback && (
          <View style={styles.callbackDetailsBox}>
            <FormField
              label="Preferred Callback Date (YYYY-MM-DD)"
              placeholder="e.g. 2026-08-20"
              value={addInfo.callbackDate}
              onChangeText={(v) => handleInfoChange('callbackDate', v)}
            />
            <FormField
              label="Alternate Phone Number (Optional)"
              placeholder="e.g. 9876500000"
              value={addInfo.callbackPhone}
              onChangeText={(v) => handleInfoChange('callbackPhone', v)}
              keyboardType="phone-pad"
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
          <Text style={styles.btnNextText}>REVIEW REQUEST →</Text>
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
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 12, color: '#0284C7', lineHeight: 17 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 6 },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    fontSize: 13,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 90,
  },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  radioRow: { flexDirection: 'row', gap: 8 },
  modeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  modeCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  modeIcon: { fontSize: 14, marginRight: 6 },
  modeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  modeLabelSelected: { color: '#0369A1', fontWeight: '700' },
  timeGrid: { gap: 6 },
  timeChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  timeChipSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  timeText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  timeTextSelected: { color: COLORS.white, fontWeight: '700' },
  callbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  callbackBoxActive: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#0284C7', fontSize: 12, fontWeight: 'bold' },
  callbackTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  callbackDesc: { fontSize: 11, color: '#64748B', marginTop: 1 },
  callbackDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
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
