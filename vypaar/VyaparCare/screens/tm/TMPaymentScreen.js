import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import TMStepper from '../../components/TMStepper';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useTMForm } from '../../contexts/TMFormContext';
import { formatINR } from '../../utils/currency';

export default function TMPaymentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { formState, getFees, submitApplication, isSubmitting } = useTMForm();

  const [paymentOption, setPaymentOption] = useState('full');

  const fees = getFees();
  const payableAmount = paymentOption === 'full' ? fees.totalPayable : fees.advanceAmount;

  const handlePayNow = async () => {
    try {
      const res = await submitApplication(user);
      const appId = res?.application_id || 'TM-2026-000001';

      navigation.navigate('PaymentGateway', {
        amount: payableAmount,
        service: {
          id: 'trademark',
          title: `Trademark Application — ${formState.markDetails?.trademarkName || 'Brand'}`,
          applicationId: appId,
        },
        onPaymentSuccess: () => {
          navigation.navigate('TMConfirmation', {
            applicationId: appId,
            amountPaid: payableAmount,
          });
        },
      });
    } catch (err) {
      console.error('Payment submission failed:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={9}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Fee Breakdown & Payment</Text>
          <Text style={styles.screenSubheading}>
            Transparent calculation of official IP India government filing fees and legal professional services.
          </Text>
        </View>

        {/* Fee Category Badge */}
        <View style={styles.categoryCard}>
          <Text style={styles.categoryTitle}>Applied Fee Category</Text>
          <Text style={styles.categoryName}>{fees.feeCategoryLabel}</Text>
          <Text style={styles.categorySub}>
            {fees.isConcessionCategory
              ? '🎉 50% Concession rate applied for Individual/Startup/MSME'
              : 'Standard statutory rate for Body Corporate / Legal Entities'}
          </Text>
        </View>

        {/* Transparent Cost Breakdown Table */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>💳 Cost Summary</Text>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Professional Legal & Filing Fee</Text>
            <Text style={styles.feeVal}>{formatINR(fees.serviceFee)}</Text>
          </View>

          <View style={styles.feeRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.feeLabel}>
                Official IP India Govt Fee ({fees.numClasses} {fees.numClasses === 1 ? 'Class' : 'Classes'})
              </Text>
              <Text style={styles.feeSub}>
                ₹{fees.perClassGovtFee.toLocaleString('en-IN')} × {fees.numClasses} {fees.numClasses === 1 ? 'class' : 'classes'} (Included in package)
              </Text>
            </View>
            <Text style={styles.feeVal}>{formatINR(fees.totalGovtFee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Application Amount</Text>
            <Text style={styles.totalVal}>{formatINR(fees.totalPayable)}</Text>
          </View>
        </View>

        {/* Payment Mode Selection */}
        <View style={styles.optionsSection}>
          <Text style={styles.optionsTitle}>Select Payment Option</Text>

          <Pressable
            style={[
              styles.optionCard,
              paymentOption === 'full' && styles.optionCardActive,
            ]}
            onPress={() => setPaymentOption('full')}
          >
            <View style={styles.optionRadio}>
              {paymentOption === 'full' && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionHeading}>
                Pay Full Amount — {formatINR(fees.totalPayable)}
              </Text>
              <Text style={styles.optionDesc}>
                Immediate end-to-end filing with IP India without payment interruptions.
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.optionCard,
              paymentOption === 'advance' && styles.optionCardActive,
            ]}
            onPress={() => setPaymentOption('advance')}
          >
            <View style={styles.optionRadio}>
              {paymentOption === 'advance' && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionHeading}>
                50% Advance Today — {formatINR(fees.advanceAmount)}
              </Text>
              <Text style={styles.optionDesc}>
                Pay 50% professional fee now; balance {formatINR(fees.balanceAmount)} payable upon TM-A draft approval.
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Inclusions Checkmarks */}
        <View style={styles.inclusionsCard}>
          <Text style={styles.inclusionsTitle}>Everything Included in this Package:</Text>
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.checkText}>Form TM-A drafting and official IP India e-filing</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.checkText}>Official TM Application Number generation</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.checkText}>Form TM-48 Power of Attorney execution</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.checkText}>Real-time journal & examination tracking alerts</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Payment Action Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.payBtn,
            isSubmitting && styles.payBtnDisabled,
            pressed && styles.pressed,
          ]}
          onPress={handlePayNow}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.payBtnText}>
              PROCEED TO PAY {formatINR(payableAmount)} 🔒
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.85,
  },
  headerBlock: {
    marginBottom: 16,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  screenSubheading: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 4,
    lineHeight: 19,
  },
  categoryCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0C4A6E',
    marginTop: 2,
  },
  categorySub: {
    fontSize: 12,
    color: '#0284C7',
    marginTop: 4,
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E8EC',
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 13.5,
    color: '#334155',
  },
  feeSub: {
    fontSize: 11.5,
    color: COLORS.grayText,
    marginTop: 2,
  },
  feeVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  optionsSection: {
    marginBottom: 16,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  optionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  optionDesc: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
    lineHeight: 16,
  },
  inclusionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E8EC',
  },
  inclusionsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    fontSize: 14,
    color: COLORS.whatsapp,
    fontWeight: 'bold',
    marginRight: 8,
  },
  checkText: {
    fontSize: 12.5,
    color: '#475569',
    flex: 1,
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
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  payBtn: {
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
