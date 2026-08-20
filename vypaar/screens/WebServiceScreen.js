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
import { WEB_SERVICES_LIST } from '../config/servicesHub';
import { COLORS } from '../constants/theme';

export default function WebServiceScreen() {
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

  const handleGetStarted = (service) => {
    console.log(`Get Started for: ${service.title}`);
    const whatsappMsg = `Hello Vyapar Care, I want to get started with ${service.title} (${service.priceRange || 'Web Services'}).`;
    const url = `https://wa.me/919999999999?text=${encodeURIComponent(whatsappMsg)}`;

    Linking.openURL(url).catch(() => {
      navigation.navigate('OtherSelectService', {
        selectedService: service.title,
        serviceDetails: service,
      });
    });
  };

  const renderWebCard = ({ item }) => (
    <View style={styles.card}>
      {/* Top Header: Icon + Title & Price */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.priceHighlight}>{item.priceRange}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Deliverables / Highlights */}
      {Array.isArray(item.deliverables) && item.deliverables.length > 0 && (
        <View style={styles.deliverablesWrap}>
          {item.deliverables.map((del, idx) => (
            <View key={idx} style={styles.deliverableRow}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.deliverableText}>{del}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.tagWrap}>
          <Text style={styles.tagText}>⚡ Enterprise Grade Stack</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.getStartedBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={() => handleGetStarted(item)}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.getStartedArrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B2B5E' }} edges={['left', 'right', 'top']}>
      <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        {/* Persistent App Top Bar */}
      <AppTopBar
        title="Web & Digital Services"
        onOpenProfile={() => setProfileModalVisible(true)}
      />

      <FlatList
        data={WEB_SERVICES_LIST}
        keyExtractor={(item) => item.id}
        renderItem={renderWebCard}
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
                Technology & Digital Solutions ({WEB_SERVICES_LIST.length})
              </Text>
              <Text style={styles.cloudTag}>⚡ 99.9% Uptime SLA</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerSection}>
            <View style={styles.techStackBanner}>
              <Text style={styles.techStackIcon}>🛠️</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.techStackTitle}>Modern Cloud Tech Stack</Text>
                <Text style={styles.techStackSubtitle}>
                  Next.js • React Native • Node.js • AWS Cloud • Razorpay Ready
                </Text>
              </View>
            </View>
          </View>
        }
      />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFAB message="Hello Vyapar Care, I want to discuss Website / App / Digital Development." />

      {/* Profile Drawer */}
      <ProfileDrawerModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab="Web Service" />
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
  cloudTag: {
    fontSize: 11,
    color: '#059669',
    fontWeight: 'bold',
  },
  card: {
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B2B5E',
  },
  priceHighlight: {
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
  deliverablesWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  deliverableRow: {
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
  deliverableText: {
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
  getStartedBtn: {
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
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  getStartedText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0F172A',
    marginRight: 4,
  },
  getStartedArrow: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  footerSection: {
    marginTop: 8,
    marginBottom: 10,
  },
  techStackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  techStackIcon: {
    fontSize: 22,
  },
  techStackTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#334155',
  },
  techStackSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});
