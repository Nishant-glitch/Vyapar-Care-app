import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { FINANCIAL_SERVICES } from '../config/servicesHub';
import { COLORS } from '../constants/theme';

const PARTNER_COLORS = [
  '#0284C7', // Sky blue
  '#059669', // Emerald
  '#C5991A', // Gold
  '#7C3AED', // Purple
  '#DC2626', // Red
];

const getPartnerInitial = (name = '') => {
  return name.trim().charAt(0).toUpperCase() || 'I';
};

export default function FinancialServicesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Extract insurance items from config or fallback
  const insuranceCategory = FINANCIAL_SERVICES?.categories?.find(
    (cat) => cat.id === 'insurance'
  );

  const insuranceItems = insuranceCategory?.items || [
    { id: 'two_wheeler_ins', name: 'Two Wheeler Insurance', partner: 'ProFin', type: 'insurance' },
    { id: 'car_ins', name: 'Car Insurance', partner: 'ProFin', type: 'insurance' },
    { id: 'health_ins', name: 'Health Insurance', partner: 'ProFin', type: 'insurance' },
    { id: 'term_life_ins', name: 'Term Life Insurance', partner: 'ProFin', type: 'insurance' },
    { id: 'investment_ins', name: 'Investment', partner: 'ProFin', type: 'insurance' },
  ];

  const handleApplyProduct = async (product) => {
    console.log(`Applied for: [${product.name}] via ProFin`);
    const targetUrl = FINANCIAL_SERVICES.profinUrl || 'https://profin.gstsuvidhakendra.org.in';
    try {
      await Linking.openURL(targetUrl);
    } catch (err) {
      console.warn('Could not open ProFin URL:', err);
    }
  };

  const renderProductItem = ({ item, index }) => {
    const color = PARTNER_COLORS[index % PARTNER_COLORS.length];
    const initial = getPartnerInitial(item.name);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.productCard,
          pressed && styles.productCardPressed,
        ]}
        onPress={() => handleApplyProduct(item)}
      >
        <View style={[styles.partnerLogoCircle, { backgroundColor: color }]}>
          <Text style={styles.partnerLogoText}>{initial}</Text>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.partnerMetaRow}>
            <Text style={styles.partnerName}>{item.partner || 'ProFin'}</Text>
            <Text style={styles.partnerDot}>•</Text>
            <Text style={styles.partnerTypeTag}>Insurance Plan</Text>
          </View>
        </View>

        <View style={styles.applyBtnWrap}>
          <Text style={styles.applyText}>Apply</Text>
          <Text style={styles.applyArrow}>→</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Insurance Services" />

      <FlatList
        data={insuranceItems}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Top ProFin Banner Card */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerContent}>
                <View style={styles.bannerIconCircle}>
                  <Text style={styles.bannerIcon}>🛡️</Text>
                </View>
                <View style={styles.bannerTextWrap}>
                  <View style={styles.bannerTitleRow}>
                    <Text style={styles.bannerTitle}>Insurance Services</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>OFFICIAL</Text>
                    </View>
                  </View>
                  <Text style={styles.bannerSubtitle}>
                    Vehicle • Health • Life • Investment
                  </Text>
                  <Text style={styles.bannerPoweredBy}>
                    Powered by{' '}
                    <Text style={styles.bannerLink}>profin.gstsuvidhakendra.org.in</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Products List Title Row */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>
                Available Insurance Plans ({insuranceItems.length})
              </Text>
              <Text style={styles.instantApplyPill}>⚡ Instant Online Apply</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerSection}>
            {/* Disclaimer Card */}
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerTitleRow}>
                <Text style={styles.disclaimerIcon}>ℹ️</Text>
                <Text style={styles.disclaimerHeading}>Partner Disclaimer & Terms</Text>
              </View>
              <Text style={styles.disclaimerText}>
                Insurance and financial products are provided by respective insurance companies and
                financial institutions through the ProFin platform. Vyapar Care Consultancy acts as
                a referral partner. All terms, policy coverage, and premium rates are determined
                solely by the respective insurers.
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerSection: {
    marginBottom: 8,
  },
  bannerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#C5991A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerIcon: {
    fontSize: 22,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B2B5E',
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  bannerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 3,
  },
  bannerPoweredBy: {
    fontSize: 11,
    color: '#94A3B8',
  },
  bannerLink: {
    color: '#0284C7',
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#1B2B5E',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  instantApplyPill: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  productCardPressed: {
    opacity: 0.85,
    backgroundColor: '#F8FAFC',
  },
  partnerLogoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerLogoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  productInfo: {
    flex: 1,
    paddingRight: 8,
  },
  productName: {
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#1B2B5E',
    marginBottom: 3,
  },
  partnerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  partnerDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 5,
  },
  partnerTypeTag: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  applyBtnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  applyText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#A16207',
    marginRight: 2,
  },
  applyArrow: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A16207',
  },
  footerSection: {
    marginTop: 12,
  },
  disclaimerCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disclaimerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  disclaimerIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  disclaimerHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  disclaimerText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
});
