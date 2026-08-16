import React from 'react';
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS } from '../constants/theme';
import { useFetch } from '../hooks/useFetch';
import { getServiceById } from '../lib/database';
import { formatINR } from '../utils/currency';

const DEFAULT_SERVICE = {
  title: 'Private Limited Company Registration',
  icon: '🏢',
  iconBg: '#E8F0FE',
  subtitle: 'Incorporate your Private Limited Company with MCA.',
  fee: 15000,
  advancePercent: 50,
  processingTime: '7-10 Working Days',
  included: [
    'Certificate of Incorporation (COI)',
    'PAN & TAN Generation',
    'DIN for up to 2 Directors',
    'Government fees, only if actually included in the selected package',
  ],
};

/** DB row ya list item — dono ko ek shape me le aata hai */
const normalize = (row) => {
  if (!row) return DEFAULT_SERVICE;
  const isTMService =
    row.id === 'trademark' ||
    row.id === 'tm-reg' ||
    String(row.name || row.title || '').toLowerCase().includes('trademark') ||
    String(row.name || row.title || '').toLowerCase().includes('tm');

  const isFSSAIService =
    row.id === 'fssai' ||
    row.id === 'fssai-reg' ||
    String(row.name || row.title || '').toLowerCase().includes('fssai') ||
    String(row.name || row.title || '').toLowerCase().includes('food');

  const isPLCService =
    row.id === 'pvt-ltd-reg' ||
    String(row.name || row.title || '').toLowerCase().includes('private limited') ||
    String(row.name || row.title || '').toLowerCase().includes('company');

  const isMSMEService =
    row.id === 'msme-reg' ||
    row.id === 'udyam-reg' ||
    String(row.name || row.title || '').toLowerCase().includes('msme') ||
    String(row.name || row.title || '').toLowerCase().includes('udyam');

  const isITRService =
    row.id === 'itr' ||
    row.id === 'itr-filing' ||
    row.id === 'income-tax' ||
    String(row.name || row.title || '').toLowerCase().includes('income tax') ||
    String(row.name || row.title || '').toLowerCase().includes('itr');

  const isIECService =
    row.id === 'iec' ||
    row.id === 'iec-reg' ||
    row.id === 'import-export-code' ||
    String(row.name || row.title || '').toLowerCase().includes('iec') ||
    String(row.name || row.title || '').toLowerCase().includes('import export');

  const isOtherService =
    row.id === 'other' ||
    row.id === 'other-services' ||
    String(row.name || row.title || '').toLowerCase().includes('other service');

  let base = {
    title: 'GST Registration',
    icon: '📋',
    iconBg: '#E8F0FE',
    subtitle: 'New GST Registration for Proprietorship, Partnership or Private Limited.',
    fee: 10000,
    advancePercent: 50,
    processingTime: '3-5 Working Days',
    included: ['GST Number', 'GST Certificate', 'All Government Fees'],
  };

  if (isOtherService) {
    base = {
      title: 'Other Services',
      icon: '⚙️',
      iconBg: '#ECEFF1',
      subtitle: 'Tell us your requirement and our team will guide you.',
      fee: 2500,
      advancePercent: 100,
      processingTime: 'Varies',
      included: [
        'Expert Consultation',
        'Document Guidance',
      ],
    };
  } else if (isIECService) {
    base = {
      title: 'Import Export Code (IEC)',
      icon: '🌐',
      iconBg: '#E0F2FE',
      subtitle: 'IEC registration required for import and export businesses.',
      fee: 4000,
      advancePercent: 100,
      processingTime: '3–5 Working Days',
      included: [
        'IEC Certificate',
        'DGFT Application',
        'Government Fees',
      ],
    };
  } else if (isITRService) {
    base = {
      title: 'Income Tax Return Filing',
      icon: '📊',
      iconBg: '#ECFDF5',
      subtitle: 'Annual income tax return filing for individuals and businesses.',
      fee: 3000,
      advancePercent: 100,
      processingTime: '2–3 Working Days',
      included: [
        'ITR Filing',
        'Acknowledgment (ITR-V)',
        'Computation Sheet',
      ],
    };
  } else if (isMSMEService) {
    base = {
      title: 'MSME / Udyam Registration',
      icon: '🏭',
      iconBg: '#E0F2FE',
      subtitle: 'Udyam registration for micro, small and medium enterprises.',
      fee: 2000,
      advancePercent: 100,
      processingTime: '1–2 Working Days',
      included: [
        'Udyam Certificate',
        'Udyam Number',
        'Application Filing',
      ],
    };
  } else if (isFSSAIService) {
    base = {
      title: 'FSSAI Food License',
      icon: '🍽️',
      iconBg: '#ECFDF5',
      subtitle: 'Food business license registration for manufacturers, traders and restaurants.',
      fee: 5000,
      advancePercent: 50,
      processingTime: '5–7 Working Days',
      included: [
        'FSSAI Registration Certificate',
        'Application Filing',
        'Government Fees',
      ],
    };
  } else if (isTMService) {
    base = {
      title: 'Trademark Registration',
      icon: '®️',
      iconBg: '#FEF3C7',
      subtitle: 'Protect your brand name and logo with a registered trademark.',
      fee: 8000,
      advancePercent: 50,
      processingTime: '5–7 Working Days',
      included: [
        'Trademark Application',
        'TM Number',
        'Government Fees — 1 Class',
      ],
    };
  } else if (isPLCService) {
    base = DEFAULT_SERVICE;
  }

  return {
    ...base,
    ...row,
    title: row.detail_title || row.detailTitle || row.name || base.title,
    subtitle: row.description || row.subtitle || base.subtitle,
    fee: row.fee ?? base.fee,
    advancePercent: row.advance_percent ?? row.advancePercent ?? base.advancePercent,
    processingTime:
      row.processing_days || row.processingTime || base.processingTime,
    included: row.included?.length ? row.included : base.included,
    iconBg: row.iconBg || base.iconBg,
  };
};

export default function ServiceDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const picked = route.params?.service;
  const serviceId = route.params?.serviceId || picked?.id;

  const needsFetch = !picked?.fee && !!serviceId;

  const { data: fetched, loading, error, reload } = useFetch(
    () => getServiceById(serviceId),
    [serviceId],
    { demoData: null, enabled: needsFetch }
  );

  const service = normalize(fetched || picked);

  const isFSSAIService =
    service.id === 'fssai' ||
    service.id === 'fssai-reg' ||
    String(service.title || '').toLowerCase().includes('fssai') ||
    String(service.title || '').toLowerCase().includes('food');

  const isTMService =
    service.id === 'trademark' ||
    service.id === 'tm-reg' ||
    String(service.title || '').toLowerCase().includes('trademark') ||
    String(service.title || '').toLowerCase().includes('tm');

  const isPLCService =
    service.id === 'pvt-ltd-reg' ||
    String(service.title || '').toLowerCase().includes('private limited') ||
    String(service.title || '').toLowerCase().includes('company');

  const isGSTService =
    service.id === 'gst-reg' ||
    String(service.title || '').toLowerCase().includes('gst');

  const isMSMEService =
    service.id === 'msme-reg' ||
    service.id === 'udyam-reg' ||
    String(service.title || '').toLowerCase().includes('msme') ||
    String(service.title || '').toLowerCase().includes('udyam');

  const isITRService =
    service.id === 'itr' ||
    service.id === 'itr-filing' ||
    service.id === 'income-tax' ||
    String(service.title || '').toLowerCase().includes('income tax') ||
    String(service.title || '').toLowerCase().includes('itr');

  const isIECService =
    service.id === 'iec' ||
    service.id === 'iec-reg' ||
    service.id === 'import-export-code' ||
    String(service.title || '').toLowerCase().includes('iec') ||
    String(service.title || '').toLowerCase().includes('import export');

  const isOtherService =
    service.id === 'other' ||
    service.id === 'other-services' ||
    String(service.title || '').toLowerCase().includes('other service');

  const handleContinue = () => {
    if (isOtherService) {
      // Launch 9-Step Other Services Dynamic Consultation Flow
      navigation.navigate('OtherSelectService');
      return;
    }

    if (isIECService) {
      // Launch 12-Step DGFT Import Export Code (IEC) Flow
      navigation.navigate('IECApplicantType');
      return;
    }

    if (isITRService) {
      // Launch 12-Step Income Tax Return Filing Flow
      navigation.navigate('ITRProfile');
      return;
    }

    if (isMSMEService) {
      // Launch 12-Step Udyam Registration Assistance Flow
      navigation.navigate('UdyamAadhaar');
      return;
    }

    if (isFSSAIService) {
      // Launch 11-Step FSSAI Food License Flow
      navigation.navigate('FSSAIEligibility');
      return;
    }

    if (isTMService) {
      // Launch 10-Step Form TM-A Trademark Registration Flow
      navigation.navigate('TMApplicantType');
      return;
    }

    if (isPLCService) {
      // Launch 7-Step Private Limited Company Registration Form
      navigation.navigate('PLCApplicant');
      return;
    }

    if (isGSTService) {
      // Launch 10-Step Form GST REG-01 Registration Flow
      navigation.navigate('GSTConstitution');
      return;
    }

    navigation.navigate('PaymentSummary', {
      service,
      fee: service.fee,
      advancePercent: service.advancePercent,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title={service.title} />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}

      {!loading && !error ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- icon + title ---------- */}
          <View style={styles.titleRow}>
            <View style={[styles.iconCircle, { backgroundColor: service.iconBg }]}>
              <Text style={styles.icon}>{service.icon}</Text>
            </View>

            <View style={styles.titleTextWrap}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {service.subtitle}
              </Text>
            </View>
          </View>

          {/* ---------- details ---------- */}
          <View style={styles.detailsBlock}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service Fee</Text>
              <Text style={styles.detailFee}>{formatINR(service.fee)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Processing Time</Text>
              <Text style={styles.detailValue}>{service.processingTime}</Text>
            </View>
          </View>

          {/* ---------- what's included ---------- */}
          <Text style={styles.sectionHeading}>What's Included</Text>

          {service.included.map((item) => (
            <View key={item} style={styles.checkRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {/* ---------- fixed footer ---------- */}
      {!loading && !error ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>CONTINUE</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.85,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 20,
  },
  titleTextWrap: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.grayText,
    lineHeight: 19,
    marginTop: 5,
  },
  detailsBlock: {
    marginTop: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  detailFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 20,
    marginBottom: 14,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  check: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.whatsapp,
    width: 24,
  },
  checkText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  continueButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
