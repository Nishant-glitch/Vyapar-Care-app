import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { COLORS } from '../constants/theme';
import { formatINR } from '../utils/currency';

export default function PricingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const {
    service,
    serviceName = service?.title || 'Service Plans',
    plans = service?.plans || [],
    icon = service?.icon || '💼',
    subtitle = service?.subtitle || 'Select the ideal plan tailored for your business requirement',
    targetForm = service?.targetForm || null,
  } = route.params || {};

  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || null);

  const handleApply = (plan) => {
    console.log(`Applying for ${serviceName} - Plan: ${plan.name} (${plan.price})`);

    // Route based on target form or service type
    if (targetForm && targetForm !== 'OtherSelectService' && targetForm !== 'ServiceDetail') {
      navigation.navigate(targetForm, { selectedPlan: plan, service });
      return;
    }

    if (service?.id === 'iec' || serviceName.includes('IEC')) {
      navigation.navigate('IECApplicantType', { selectedPlan: plan });
      return;
    }

    if (service?.id === 'trademark' || serviceName.includes('Trademark')) {
      navigation.navigate('TMApplicantType', { selectedPlan: plan });
      return;
    }

    if (service?.id === 'udyam' || serviceName.includes('Udyam') || serviceName.includes('MSME')) {
      navigation.navigate('UdyamAadhaar', { selectedPlan: plan });
      return;
    }

    // Default flow: Launch OtherSelectService or ServiceDetail or PaymentSummary
    navigation.navigate('OtherSelectService', {
      selectedPlan: plan,
      serviceName: `${serviceName} (${plan.name})`,
      fee: plan.price,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title={`${serviceName} Pricing`} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Text style={styles.heroIcon}>{icon}</Text>
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>{serviceName}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
          </View>
        </View>

        {/* Plan Header Note */}
        <View style={styles.plansHeaderRow}>
          <Text style={styles.plansHeading}>Available Plans ({plans.length})</Text>
          <View style={styles.guaranteePill}>
            <Text style={styles.guaranteeText}>✓ 100% Transparent Fee</Text>
          </View>
        </View>

        {/* Plans List */}
        {plans.map((plan, index) => {
          const isSelected = selectedPlanId === plan.id;
          const isFeatured = index === 0;

          return (
            <Pressable
              key={plan.id || index}
              style={[
                styles.planCard,
                isSelected && styles.planCardActive,
                isFeatured && styles.planCardFeatured,
              ]}
              onPress={() => setSelectedPlanId(plan.id)}
            >
              {/* Featured / Popular ribbon */}
              {isFeatured && (
                <View style={styles.popularRibbon}>
                  <Text style={styles.popularRibbonText}>★ MOST POPULAR</Text>
                </View>
              )}

              {/* Plan Title & Price Header */}
              <View style={styles.planHeader}>
                <View style={styles.planTitleWrap}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.processingDays && (
                    <View style={styles.tatBadge}>
                      <Text style={styles.tatBadgeText}>⏱️ {plan.processingDays}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceWrap}>
                  <Text style={styles.priceText}>{formatINR(plan.price)}</Text>
                  <Text style={styles.priceSubtext}>All-inclusive fee</Text>
                </View>
              </View>

              {/* Plan Description */}
              {plan.description ? (
                <Text style={styles.planDesc}>{plan.description}</Text>
              ) : null}

              {/* What's Included */}
              {Array.isArray(plan.whatsIncluded) && plan.whatsIncluded.length > 0 && (
                <View style={styles.includedSection}>
                  <Text style={styles.includedHeading}>What's included in this plan:</Text>
                  {plan.whatsIncluded.map((item, idx) => (
                    <View key={idx} style={styles.includedRow}>
                      <Text style={styles.checkIcon}>✓</Text>
                      <Text style={styles.includedText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Apply Action Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.applyButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleApply(plan)}
              >
                <Text style={styles.applyButtonText}>Apply Now</Text>
                <Text style={styles.applyButtonArrow}>→</Text>
              </Pressable>
            </Pressable>
          );
        })}

        {/* Advisory Help Banner */}
        <View style={styles.helpBanner}>
          <Text style={styles.helpIcon}>💬</Text>
          <View style={styles.helpTextWrap}>
            <Text style={styles.helpTitle}>Confused about which plan to choose?</Text>
            <Text style={styles.helpSubtitle}>
              Our compliance managers will evaluate your turnover and recommend the right license.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1B2B5E10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroIcon: {
    fontSize: 24,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B2B5E',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  plansHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  plansHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B2B5E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guaranteePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardActive: {
    borderColor: '#C5991A',
  },
  planCardFeatured: {
    borderColor: '#1B2B5E40',
    borderWidth: 1.5,
  },
  popularRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#1B2B5E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  popularRibbonText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#DFB53B',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B2B5E',
    marginBottom: 4,
  },
  tatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tatBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#C5991A',
  },
  priceSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  planDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  includedSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  includedHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#25D366',
    marginRight: 6,
    marginTop: 1,
  },
  includedText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 16,
  },
  applyButton: {
    backgroundColor: '#C5991A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#C5991A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginRight: 6,
    letterSpacing: 0.3,
  },
  applyButtonArrow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  helpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 8,
    marginBottom: 10,
  },
  helpIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  helpTextWrap: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    lineHeight: 15,
  },
});
