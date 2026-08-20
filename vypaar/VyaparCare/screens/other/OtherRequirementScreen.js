import React, { useState } from 'react';
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
import {
  OTHER_GOVERNMENT_DEPARTMENTS,
  OTHER_URGENCY_LEVELS,
  getServiceSpecificQuestions,
} from '../../config/otherServicesConfig';
import { COLORS } from '../../constants/theme';
import { useOtherForm } from '../../contexts/OtherFormContext';
import { validateOtherRequirement } from '../../utils/otherServicesValidation';

export default function OtherRequirementScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateRequirementDetails } = useOtherForm();

  const [errors, setErrors] = useState({});
  const req = formData.requirementDetails || {};
  const serviceId = formData.selectedService?.id;
  const questionsConfig = getServiceSpecificQuestions(serviceId);

  const handleReqChange = (key, val) => {
    updateRequirementDetails({ [key]: val });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = () => {
    const errs = validateOtherRequirement(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('OtherBusiness');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Requirement Details" />
      <OtherServicesStepper currentStep={3} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📝 Step 3: Tell Us About Your Requirement</Text>
          <Text style={styles.bannerSubtitle}>
            Explain the situation, any government notice received, target outcome, and relevant timelines.
          </Text>
        </View>

        {/* Large Text Area */}
        <Text style={styles.inputLabel}>Describe Your Requirement in Detail *</Text>
        <TextInput
          style={[styles.textArea, errors.description && styles.inputError]}
          placeholder="Example: I have received a GST notice regarding ITC discrepancy between GSTR-2B and GSTR-3B for FY 2023-24. I need expert CA review, reconciliation statement, and legal reply submission."
          placeholderTextColor="#94A3B8"
          value={req.description}
          onChangeText={(v) => handleReqChange('description', v)}
          multiline
          numberOfLines={5}
        />
        {errors.description && (
          <Text style={styles.errorText}>⚠️ {errors.description}</Text>
        )}

        <View style={styles.helperPrompts}>
          <Text style={styles.helperTitle}>💡 What to mention:</Text>
          <Text style={styles.helperItem}>• What happened or what issue are you facing?</Text>
          <Text style={styles.helperItem}>• What exact result or resolution do you need?</Text>
          <Text style={styles.helperItem}>• Any previous application number or reference?</Text>
          <Text style={styles.helperItem}>• Any strict deadline or pending penalty?</Text>
        </View>

        <View style={styles.divider} />

        {/* Urgency Selection */}
        <Text style={styles.sectionHeader}>How urgent is this requirement? *</Text>
        <View style={styles.urgencyGrid}>
          {OTHER_URGENCY_LEVELS.map((u) => {
            const isSel = (req.urgency || 'normal') === u.id;
            return (
              <TouchableOpacity
                key={u.id}
                style={[styles.urgencyCard, isSel && styles.urgencyCardSelected]}
                onPress={() => handleReqChange('urgency', u.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.urgencyLabel, isSel && { color: u.color, fontWeight: '800' }]}>
                    {u.label}
                  </Text>
                  <Text style={styles.urgencyDesc}>{u.desc}</Text>
                </View>
                <View style={[styles.radio, isSel && styles.radioSelected]}>
                  {isSel && <View style={[styles.radioInner, { backgroundColor: u.color }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Deadline Date Input if urgent */}
        {(req.urgency === 'urgent' || req.urgency === 'govt_deadline' || req.urgency === 'within_3_days') && (
          <View style={styles.deadlineBox}>
            <FormField
              label="Target Deadline Date (YYYY-MM-DD) *"
              placeholder="e.g. 2026-08-25"
              value={req.deadlineDate}
              onChangeText={(v) => handleReqChange('deadlineDate', v)}
              error={errors.deadlineDate}
              helperText="Statutory due date or expected completion date"
            />
          </View>
        )}

        <View style={styles.divider} />

        {/* Government Department Involved */}
        <Text style={styles.sectionHeader}>Which department is involved?</Text>
        <View style={styles.deptGrid}>
          {OTHER_GOVERNMENT_DEPARTMENTS.map((d) => {
            const isSel = (req.department || 'gst') === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.deptChip, isSel && styles.deptChipSelected]}
                onPress={() => handleReqChange('department', d.id)}
              >
                <Text style={styles.deptIcon}>{d.icon}</Text>
                <Text style={[styles.deptText, isSel && styles.deptTextSelected]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {req.department === 'not_sure' && (
          <View style={styles.notSureBox}>
            <Text style={styles.notSureTitle}>✨ Don't worry!</Text>
            <Text style={styles.notSureText}>
              Our team will identify the appropriate department and statutory framework after reviewing your requirement details.
            </Text>
          </View>
        )}

        {/* Dynamic Reference Fields (if applicable for service) */}
        {questionsConfig.showNoticeFields && (
          <View style={styles.dynamicBox}>
            <Text style={styles.dynamicBoxTitle}>Statutory Reference Details</Text>
            <FormField
              label={questionsConfig.noticeLabel || 'Notice / Demand Number'}
              placeholder="e.g. ZA0708240012345 / DIN-12345"
              value={req.noticeNumber}
              onChangeText={(v) => handleReqChange('noticeNumber', v)}
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <FormField
                  label="Notice Date"
                  placeholder="YYYY-MM-DD"
                  value={req.noticeDate}
                  onChangeText={(v) => handleReqChange('noticeDate', v)}
                />
              </View>
              <View style={styles.half}>
                <FormField
                  label="Reply Due Date"
                  placeholder="YYYY-MM-DD"
                  value={req.replyDueDate}
                  onChangeText={(v) => handleReqChange('replyDueDate', v)}
                />
              </View>
            </View>
          </View>
        )}

        {/* Specific Question Options (e.g. GST amendment options) */}
        {questionsConfig.options && (
          <View style={styles.optionsBox}>
            <Text style={styles.optionsTitle}>{questionsConfig.optionsTitle}</Text>
            <View style={styles.optionsList}>
              {questionsConfig.options.map((opt) => {
                const isSel = req.selectedOption === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optItem, isSel && styles.optItemSelected]}
                    onPress={() => handleReqChange('selectedOption', opt)}
                  >
                    <Text style={[styles.optText, isSel && styles.optTextSelected]}>
                      {isSel ? '✓ ' : '• '}
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
    minHeight: 110,
  },
  inputError: { borderColor: '#DC2626' },
  errorText: { fontSize: 11, color: '#DC2626', marginTop: 4, fontWeight: '700' },
  helperPrompts: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helperTitle: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 2 },
  helperItem: { fontSize: 11, color: '#64748B', lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 10 },
  urgencyGrid: { gap: 8 },
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  urgencyCardSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  urgencyLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  urgencyDesc: { fontSize: 11, color: '#64748B', marginTop: 1 },
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
  deadlineBox: { marginTop: 10 },
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  deptChipSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  deptIcon: { fontSize: 12, marginRight: 6 },
  deptText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  deptTextSelected: { color: COLORS.white, fontWeight: '700' },
  notSureBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notSureTitle: { fontSize: 11, fontWeight: '800', color: '#92400E' },
  notSureText: { fontSize: 11, color: '#78350F', lineHeight: 15, marginTop: 2 },
  dynamicBox: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dynamicBoxTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  optionsBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionsTitle: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  optionsList: { gap: 6 },
  optItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  optItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  optText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  optTextSelected: { color: '#0369A1', fontWeight: '700' },
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
