import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList,
  Linking,
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
import { FINANCIAL_SERVICES } from '../config/servicesHub';
import { COLORS } from '../constants/theme';

const PARTNER_COLORS = [
  '#1B2B5E',
  '#C5991A',
  '#25D366',
  '#E74C3C',
  '#3498DB',
  '#9B59B6',
  '#D97706',
  '#0284C7',
];

const getPartnerInitial = (name = '') => {
  return name.trim().charAt(0).toUpperCase() || 'P';
};

export default function FinancialServicesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { defaultTab = 'credit_card' } = route.params || {};

  // Find initial tab index or fallback to first
  const initialCategory = FINANCIAL_SERVICES.categories.find(
    (cat) => cat.id === defaultTab
  ) || FINANCIAL_SERVICES.categories[0];

  const [activeCategoryId, setActiveCategoryId] = useState(initialCategory.id);

  const activeCategory =
    FINANCIAL_SERVICES.categories.find((cat) => cat.id === activeCategoryId) ||
    FINANCIAL_SERVICES.categories[0];

  const handleApplyProduct = async (product) => {
    console.log(`Applied for: [${product.name}] via ProFin`);
    const targetUrl = FINANCIAL_SERVICES.profinUrl || 'https://profin.gstsuvidhakendra.org.in';
    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch (err) {
      console.warn('Could not open ProFin URL:', err);
    }
  };

  const renderProductItem = ({ item, index }) => {
    const color = PARTNER_COLORS[index % PARTNER_COLORS.length];
    const initial = getPartnerInitial(item.partner || item.name);

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
            <Text style={styles.partnerName}>{item.partner}</Text>
            <Text style={styles.partnerDot}>•</Text>
            <Text style={styles.partnerTypeTag}>
              {activeCategory.title}
            </Text>
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
      <ScreenHeader title="Financial Services" />

      <FlatList
        data={activeCategory.items}
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
                  <Text style={styles.bannerIcon}>💳</Text>
                </View>
                <View style={styles.bannerTextWrap}>
                  <View style={styles.bannerTitleRow}>
                    <Text style={styles.bannerTitle}>ProFin Partner Services</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>OFFICIAL</Text>
                    </View>
                  </View>
                  <Text style={styles.bannerSubtitle}>
                    Credit Cards • Loans • Insurance • Banking
                  </Text>
                  <Text style={styles.bannerPoweredBy}>
                    Powered by{' '}
                    <Text style={styles.bannerLink}>profin.gstsuvidhakendra.org.in</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Category Tabs (Horizontal Scroll) */}
            <View style={styles.tabsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScrollContent}
              >
                {FINANCIAL_SERVICES.categories.map((cat) => {
                  const isActive = cat.id === activeCategoryId;
                  return (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.tabButton,
                        isActive && styles.tabButtonActive,
                      ]}
                      onPress={() => setActiveCategoryId(cat.id)}
                    >
                      <Text style={styles.tabIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.tabTitle,
                          isActive && styles.tabTitleActive,
                        ]}
                      >
                        {cat.title}
                      </Text>
                      <View
                        style={[
                          styles.tabBadge,
                          isActive && styles.tabBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tabBadgeText,
                            isActive && styles.tabBadgeTextActive,
                          ]}
                        >
                          {cat.items.length}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Products List Title Row */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>
                {activeCategory.title} Options ({activeCategory.items.length})
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
                Financial products are provided by respective banks and NBFCs through the ProFin
                platform. Vyapar Care Consultancy acts as a referral partner. All terms, conditions,
                interest rates, and eligibility criteria are determined solely by the respective
                financial institutions.
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
    backgroundColor: '#1B2B5E10',
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
  tabsWrapper: {
    marginBottom: 14,
  },
  tabsScrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
  },
  tabButtonActive: {
    backgroundColor: '#1B2B5E',
    borderColor: '#1B2B5E',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B2B5E',
    marginRight: 6,
  },
  tabTitleActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#C5991A',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
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
