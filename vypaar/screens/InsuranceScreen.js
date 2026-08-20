import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTopBar from '../components/AppTopBar';
import BottomNav from '../components/BottomNav';
import ProfileDrawerModal from '../components/ProfileDrawerModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import { INSURANCE_SERVICES_LIST } from '../config/servicesHub';
import { COLORS } from '../constants/theme';

export default function InsuranceScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleGetQuote = async (item) => {
    console.log(`Get Quote for: [${item.title}] via ProFin`);
    const targetUrl = item.link || 'https://profin.gstsuvidhakendra.org.in';
    try {
      await Linking.openURL(targetUrl);
    } catch (err) {
      console.warn('Could not open ProFin URL:', err);
    }
  };

  const renderInsuranceCard = ({ item }) => (
    <View style={styles.insuranceCard}>
      {/* Top Row: Icon + Title & Starting Price */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
        </View>

        <View style={styles.titleWrap}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.badge && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.priceHighlight}>{item.startingPrice}</Text>
        </View>
      </View>

      {/* Subtitle */}
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

      {/* Feature Pills / Highlights */}
      {Array.isArray(item.highlights) && item.highlights.length > 0 && (
        <View style={styles.highlightsContainer}>
          {item.highlights.map((h, i) => (
            <View key={i} style={styles.highlightPill}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Bottom Action Row */}
      <View style={styles.cardActionRow}>
        <View style={styles.tagWrap}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.getQuoteBtn,
            pressed && styles.getQuoteBtnPressed,
          ]}
          onPress={() => handleGetQuote(item)}
        >
          <Text style={styles.getQuoteText}>Get Quote</Text>
          <Text style={styles.getQuoteArrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B2B5E' }} edges={['left', 'right', 'top']}>
      <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        {/* Persistent App Top Bar */}
      <AppTopBar
        title="Insurance Services"
        onOpenProfile={() => setProfileModalVisible(true)}
      />

      <FlatList
        data={INSURANCE_SERVICES_LIST}
        keyExtractor={(item) => item.id}
        renderItem={renderInsuranceCard}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 85 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1B2B5E"
            colors={['#1B2B5E', '#C5991A']}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Hero Banner: Protect What Matters */}
            <View style={styles.heroBanner}>
              <View style={styles.heroLeft}>
                <View style={styles.shieldPill}>
                  <Text style={styles.shieldPillText}>🛡️ 100% SECURE & CASHLESS</Text>
                </View>
                <Text style={styles.heroTitle}>Protect What Matters</Text>
                <Text style={styles.heroDesc}>
                  Instant motor, health, term life & high-yield investment policies with maximum tax savings.
                </Text>
              </View>
              <View style={styles.heroEmblem}>
                <Text style={styles.heroEmblemText}>🛡️</Text>
              </View>
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>
                Comprehensive Plans ({INSURANCE_SERVICES_LIST.length})
              </Text>
              <Text style={styles.partnerTag}>⚡ Zero Paperwork</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerSection}>
            {/* ProFin Partner Card */}
            <Pressable
              style={styles.profinBanner}
              onPress={() =>
                Linking.openURL('https://profin.gstsuvidhakendra.org.in')
              }
            >
              <View style={styles.profinLeft}>
                <Text style={styles.profinIcon}>🏢</Text>
                <View>
                  <Text style={styles.profinTitle}>Powered by ProFin Platform</Text>
                  <Text style={styles.profinSub}>
                    profin.gstsuvidhakendra.org.in • National Insurance Referral Desk
                  </Text>
                </View>
              </View>
              <Text style={styles.profinLink}>Visit →</Text>
            </Pressable>

            {/* Regulatory Disclaimer */}
            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerText}>
                Insurance policies are underwritten by IRDAI-registered insurance companies.
                Vyapar Care Consultancy operates as an official referral facilitator via ProFin.
              </Text>
            </View>
          </View>
        }
      />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFAB message="Hello Vyapar Care, I need an Insurance Quote (Vehicle / Health / Life)." />

      {/* Profile Drawer */}
      <ProfileDrawerModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab="Insurance" />
      </View>
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
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2B5E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#C5991A',
    shadowColor: '#1B2B5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 8,
  },
  shieldPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  shieldPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DFB53B',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  heroDesc: {
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  heroEmblem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmblemText: {
    fontSize: 24,
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
  partnerTag: {
    fontSize: 11,
    color: '#059669',
    fontWeight: 'bold',
  },
  insuranceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#C5991A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 22,
  },
  titleWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B2B5E',
  },
  popularBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  popularBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  priceHighlight: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C5991A',
    marginTop: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  highlightsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginRight: 6,
  },
  highlightText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '500',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  tagWrap: {
    flex: 1,
    paddingRight: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  getQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C5991A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#C5991A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  getQuoteBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  getQuoteText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0F172A',
    marginRight: 4,
  },
  getQuoteArrow: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  footerSection: {
    marginTop: 8,
    marginBottom: 10,
  },
  profinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 10,
  },
  profinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  profinIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  profinTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  profinSub: {
    fontSize: 10.5,
    color: '#0284C7',
    marginTop: 1,
  },
  profinLink: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  disclaimerCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
  },
  disclaimerText: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
    textAlign: 'center',
  },
});
