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
import { MARKETING_SERVICES_LIST } from '../config/servicesHub';
import { COLORS } from '../constants/theme';

export default function MarketingScreen() {
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

  const handleEnquire = (service) => {
    console.log(`Enquiring for: ${service.title}`);
    const whatsappMsg = `Hello Vyapar Care, I want to enquire about ${service.title} (${service.price || 'Consultation'}).`;
    const url = `https://wa.me/919999999999?text=${encodeURIComponent(whatsappMsg)}`;

    Linking.openURL(url).catch(() => {
      navigation.navigate('OtherSelectService', {
        selectedService: service.title,
        serviceDetails: service,
      });
    });
  };

  const renderMarketingCard = ({ item }) => (
    <View style={styles.card}>
      {/* Card Header: Icon + Title & Price */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.price ? (
            <Text style={styles.priceText}>{item.price}</Text>
          ) : null}
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Features Checklist */}
      {Array.isArray(item.features) && item.features.length > 0 && (
        <View style={styles.featuresWrap}>
          {item.features.map((feat, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.featureText}>{feat}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.tagWrap}>
          <Text style={styles.tagText}>⚡ Growth Guaranteed</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.enquireBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={() => handleEnquire(item)}
        >
          <Text style={styles.enquireBtnText}>Enquire Now</Text>
          <Text style={styles.enquireArrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B2B5E' }} edges={['left', 'right', 'top']}>
      <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        {/* Persistent App Top Bar */}
      <AppTopBar
        title="Marketing Services"
        onOpenProfile={() => setProfileModalVisible(true)}
      />

      <FlatList
        data={MARKETING_SERVICES_LIST}
        keyExtractor={(item) => item.id}
        renderItem={renderMarketingCard}
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
            {/* Section Header Row */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>
                Growth & Branding Solutions ({MARKETING_SERVICES_LIST.length})
              </Text>
              <Text style={styles.performancePill}>📈 ROI Focused</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerSection}>
            <View style={styles.customQuoteCard}>
              <Text style={styles.customQuoteIcon}>💡</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.customQuoteTitle}>Need a 360° Customized Campaign?</Text>
                <Text style={styles.customQuoteSubtitle}>
                  Get a dedicated marketing manager and tailored strategy for your business.
                </Text>
              </View>
              <Pressable
                style={styles.customQuoteBtn}
                onPress={() =>
                  handleEnquire({ title: 'Custom 360 Marketing Strategy' })
                }
              >
                <Text style={styles.customQuoteBtnText}>Talk to Expert</Text>
              </Pressable>
            </View>
          </View>
        }
      />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFAB message="Hello Vyapar Care, I am interested in Marketing & Branding Services." />

      {/* Profile Drawer */}
      <ProfileDrawerModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab="Marketing" />
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
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  badgePillText: {
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
  performancePill: {
    fontSize: 11,
    color: '#059669',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  titleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: 'bold',
    color: '#1B2B5E',
  },
  priceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C5991A',
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  featuresWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureRow: {
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
  featureText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  tagWrap: {
    flex: 1,
  },
  tagText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  enquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#C5991A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnPressed: {
    opacity: 0.85,
    backgroundColor: '#FEF9C3',
  },
  enquireBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A16207',
    marginRight: 4,
  },
  enquireArrow: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#A16207',
  },
  footerSection: {
    marginTop: 8,
    marginBottom: 10,
  },
  customQuoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  customQuoteIcon: {
    fontSize: 24,
  },
  customQuoteTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  customQuoteSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  customQuoteBtn: {
    backgroundColor: '#1B2B5E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  customQuoteBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
