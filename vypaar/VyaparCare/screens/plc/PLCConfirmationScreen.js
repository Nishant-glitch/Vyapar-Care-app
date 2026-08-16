import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { getStateByCode } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { usePLCForm } from '../../contexts/PLCFormContext';
import { formatCurrency } from '../../utils/plcValidation';

export default function PLCConfirmationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { resetForm } = usePLCForm();

  const applicationId = route.params?.applicationId || 'PLC-2026-000123';
  const applicationData = route.params?.applicationData || {};

  const { applicant = {}, company = {}, calculatedFees = {} } = applicationData;

  const totalFee = calculatedFees.totalFee || 15000;
  const advanceAmount = calculatedFees.advanceAmount || 7500;
  const balanceAmount = calculatedFees.balanceAmount || 7500;

  const handleContinuePayment = () => {
    // Navigate to existing PaymentGateway screen with pre-filled service & fee info
    navigation.navigate('PaymentGateway', {
      service: {
        id: 'pvt-ltd-reg',
        name: 'Private Limited Company Registration',
        amount: advanceAmount,
        totalAmount: totalFee,
        applicationId,
      },
    });
  };

  const handleDone = () => {
    resetForm();
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Application Submitted" showBack={false} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Success Banner ---------- */}
        <View style={styles.successBlock}>
          <View style={styles.successCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Application Submitted Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your incorporation filing application has been registered with VyaparCare legal desk.
          </Text>

          <View style={styles.idBadge}>
            <Text style={styles.idLabel}>APPLICATION ID</Text>
            <Text style={styles.idNumber}>{applicationId}</Text>
          </View>
        </View>

        {/* ---------- Summary Card ---------- */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Company & Applicant Overview</Text>

          <SummaryRow
            label="Proposed Name"
            value={company.proposedName1 || 'Private Limited Company'}
            isBold
          />
          {company.proposedName2 ? (
            <SummaryRow label="Alternative Name" value={company.proposedName2} />
          ) : null}
          <SummaryRow label="Primary Applicant" value={applicant.fullName || '—'} />
          <SummaryRow
            label="ROC Jurisdiction"
            value={getStateByCode(company.registeredState)?.label || company.registeredState || 'Delhi'}
          />
          <SummaryRow
            label="Proposed Directors"
            value={`${company.directorCount || 2} Directors`}
          />
          <SummaryRow
            label="Authorized Capital"
            value={formatCurrency(company.authorizedCapital || 100000)}
          />
          <SummaryRow label="Filing Mode" value="SPICe+ MCA Integration" />
        </View>

        {/* ---------- Transparent Fee Breakdown Card ---------- */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Transparent Fee Breakdown</Text>
          <Text style={styles.cardSub}>
            Standard professional service fee with 50% advance payment terms.
          </Text>

          <FeeRow
            label="Professional Incorporation Fee"
            amount={formatCurrency(totalFee)}
          />
          <FeeRow
            label="Certificate of Incorporation (COI)"
            amount="Included"
            isFree
          />
          <FeeRow
            label="PAN & TAN Generation"
            amount="Included"
            isFree
          />
          <FeeRow
            label="DIN for up to 2 Directors"
            amount="Included"
            isFree
          />
          <FeeRow
            label="MCA SPICe+ Name & Filing Govt Fee"
            amount={calculatedFees.mcaGovtFee === 0 ? '₹0 (Waived)' : formatCurrency(calculatedFees.mcaGovtFee || 0)}
            isFree={calculatedFees.mcaGovtFee === 0}
          />
          <FeeRow
            label="ROC & State Stamp Duty"
            amount="As per State ROC"
          />

          <View style={styles.divider} />

          <FeeRow
            label="Total Service Fee"
            amount={formatCurrency(totalFee)}
            isBold
          />
          <FeeRow
            label="Balance on Filing (50%)"
            amount={formatCurrency(balanceAmount)}
            isMuted
          />

          <View style={styles.highlightRow}>
            <View>
              <Text style={styles.advanceLabel}>Payable Advance Today (50%)</Text>
              <Text style={styles.advanceSub}>Remaining ₹7,500 after MCA verification</Text>
            </View>
            <Text style={styles.advanceAmount}>{formatCurrency(advanceAmount)}</Text>
          </View>
        </View>

        {/* ---------- Next Steps Banner ---------- */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>🚀 Next Steps in Your Incorporation</Text>
          <StepItem
            number="1"
            title="Advance Payment"
            desc="Pay the 50% advance fee to assign a dedicated Chartered Accountant."
          />
          <StepItem
            number="2"
            title="Name Reservation & DSC"
            desc="We obtain Digital Signatures and file name reservation on MCA portal."
          />
          <StepItem
            number="3"
            title="SPICe+ Final Filing"
            desc="Preparation of MoA/AoA, INC-9 declarations, and filing with ROC."
          />
          <StepItem
            number="4"
            title="Certificate of Incorporation"
            desc="Receive your official COI, PAN, and TAN delivered in 7-10 business days."
          />
        </View>
      </ScrollView>

      {/* ---------- Sticky Bottom Payment CTA ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
          onPress={handleContinuePayment}
        >
          <Text style={styles.payButtonText}>
            CONTINUE TO PAYMENT ({formatCurrency(advanceAmount)}) ›
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
          onPress={handleDone}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, isBold }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}:</Text>
      <Text style={[styles.summaryValue, isBold && styles.boldText]}>
        {value}
      </Text>
    </View>
  );
}

function FeeRow({ label, amount, isFree, isBold, isMuted }) {
  return (
    <View style={styles.feeRow}>
      <Text style={[styles.feeLabel, isMuted && styles.mutedText]}>{label}</Text>
      <Text
        style={[
          styles.feeAmount,
          isFree && styles.freeAmount,
          isBold && styles.boldAmount,
          isMuted && styles.mutedText,
        ]}
      >
        {amount}
      </Text>
    </View>
  );
}

function StepItem({ number, title, desc }) {
  return (
    <View style={styles.stepItemRow}>
      <View style={styles.stepNumberCircle}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepItemContent}>
        <Text style={styles.stepItemTitle}>{title}</Text>
        <Text style={styles.stepItemDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  pressed: {
    opacity: 0.85,
  },
  successBlock: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successCheck: {
    fontSize: 28,
    color: COLORS.whatsapp,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  idBadge: {
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  idLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.grayText,
    letterSpacing: 1,
  },
  idNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  summaryLabel: {
    width: 140,
    fontSize: 13,
    color: COLORS.grayText,
  },
  summaryValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  boldText: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  feeLabel: {
    fontSize: 13,
    color: COLORS.textDark,
  },
  feeAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  freeAmount: {
    color: '#27AE60',
    fontWeight: 'bold',
  },
  boldAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  mutedText: {
    color: COLORS.grayText,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  advanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  advanceSub: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
  },
  advanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  nextStepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  nextStepsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepItemContent: {
    flex: 1,
  },
  stepItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  stepItemDesc: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  payButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  homeButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  homeButtonText: {
    color: COLORS.grayText,
    fontSize: 14,
    fontWeight: '600',
  },
});
