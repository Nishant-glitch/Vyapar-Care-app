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
import OtherServicesStepper from '../../components/OtherServicesStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useOtherForm } from '../../contexts/OtherFormContext';
import { formatINR } from '../../utils/currency';

export default function OtherPaymentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { fees, submit, submitting } = useOtherForm();
  const [payMethod, setPayMethod] = useState('upi');

  const handlePayAndSubmit = async (isPaid = true) => {
    try {
      const result = await submit(user, isPaid);
      navigation.navigate('OtherConfirmation', {
        applicationId: result?.application_id || result?.applicationId || result?.id || 'OTHER-2026-000001',
        submittedAt: result?.submittedAt || new Date().toISOString(),
        isPaid,
      });
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Request could not be submitted.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Consultation & Service Quote" />
      <OtherServicesStepper currentStep={8} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Quote Breakdown Card */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteCardTitle}>Service Quote & Consultation Fee</Text>
          <Text style={styles.quoteCardSub}>
            Professional advisory, document verification, and case feasibility review
          </Text>

          <View style={styles.quoteRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.quoteLabel}>Initial Expert Consultation & Scrutiny</Text>
              <Text style={styles.quoteHint}>
                Case evaluation, law research & customized filing roadmap
              </Text>
            </View>
            <Text style={styles.quoteVal}>{formatINR(fees.serviceFee || 2500)}</Text>
          </View>

          {fees.isCustomQuote && (
            <View>
              {fees.governmentFee > 0 && (
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Government Statutory Fees</Text>
                  <Text style={styles.quoteVal}>{formatINR(fees.governmentFee)}</Text>
                </View>
              )}
              {fees.gst > 0 && (
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>GST (18%)</Text>
                  <Text style={styles.quoteVal}>{formatINR(fees.gst)}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalVal}>{formatINR(fees.totalPayable || 2500)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionHeader}>Select Payment Mode</Text>
        <View style={styles.methodList}>
          {[
            { id: 'upi', label: 'UPI / Google Pay / PhonePe / Paytm', icon: '📱' },
            { id: 'card', label: 'Credit Card / Debit Card', icon: '💳' },
            { id: 'netbanking', label: 'Net Banking (All Indian Banks)', icon: '🏛️' },
          ].map((m) => {
            const isSelected = payMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodItem, isSelected && styles.methodItemSelected]}
                onPress={() => setPayMethod(m.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                  {m.label}
                </Text>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Flexible Option Note */}
        <View style={styles.flexibleNote}>
          <Text style={styles.flexibleTitle}>💡 Free Consultation Option Available:</Text>
          <Text style={styles.flexibleText}>
            You can either pay now for immediate priority appointment booking, or submit your requirement first to receive a tailored quotation from our team.
          </Text>
        </View>

        {/* Free Submission Button */}
        <TouchableOpacity
          style={styles.btnFreeSubmit}
          onPress={() => handlePayAndSubmit(false)}
          disabled={submitting}
        >
          <Text style={styles.btnFreeSubmitText}>
            ✉️ Submit Request for Quote & Free Review
          </Text>
        </TouchableOpacity>
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
          onPress={() => handlePayAndSubmit(true)}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.btnNextText}>
              PAY {formatINR(fees.totalPayable || 2500)} & BOOK CONSULTATION →
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  quoteCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  quoteCardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 2 },
  quoteCardSub: { fontSize: 11, color: '#64748B', marginBottom: 12 },
  quoteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  quoteLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  quoteHint: { fontSize: 10, color: '#64748B', marginTop: 1 },
  quoteVal: { fontSize: 14, fontWeight: '800', color: COLORS.primaryDark },
  totalBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  totalLabel: { fontSize: 11, fontWeight: '800', color: '#0369A1', letterSpacing: 0.5 },
  totalVal: { fontSize: 18, fontWeight: '900', color: '#0284C7' },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  methodList: { gap: 8, marginBottom: 14 },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  methodItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  methodIcon: { fontSize: 18, marginRight: 10 },
  methodLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, flex: 1 },
  methodLabelSelected: { color: '#0369A1', fontWeight: '700' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#0284C7' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#0284C7' },
  flexibleNote: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
  },
  flexibleTitle: { fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  flexibleText: { fontSize: 11, color: '#78350F', lineHeight: 15 },
  btnFreeSubmit: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  btnFreeSubmitText: { fontSize: 12, fontWeight: '700', color: '#334155' },
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
