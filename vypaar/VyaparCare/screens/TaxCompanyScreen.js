import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTopBar from '../components/AppTopBar';
import BottomNav from '../components/BottomNav';
import ProfileDrawerModal from '../components/ProfileDrawerModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import {
  DIRECT_SERVICES,
  REQUIRED_FORMATS,
  TAX_COMPANY_SERVICES,
} from '../config/servicesHub';
import { COLORS } from '../constants/theme';
import { formatINR } from '../utils/currency';

const FILTER_CHIPS = [
  'All',
  'Popular',
  'GST',
  'Company',
  'Registration',
  'Filing',
  'Accounting',
];

export default function TaxCompanyScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [formatsExpanded, setFormatsExpanded] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // Filter and Search logic
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TAX_COMPANY_SERVICES.filter((svc) => {
      // Filter Tag Match
      const matchesFilter =
        selectedFilter === 'All' ||
        svc.category === selectedFilter ||
        svc.tags?.includes(selectedFilter);

      // Search Query Match
      const matchesSearch =
        !q ||
        svc.name.toLowerCase().includes(q) ||
        svc.description.toLowerCase().includes(q) ||
        svc.category.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [searchQuery, selectedFilter]);

  const handleServicePress = (service) => {
    console.log(`Service Selected: ${service.name}`);

    // If pricingServiceId is defined (DSC, ISO, Challan)
    if (service.pricingServiceId) {
      const match = DIRECT_SERVICES.find((d) => d.id === service.pricingServiceId);
      if (match) {
        navigation.navigate('Pricing', {
          service: match,
          serviceName: match.title,
          plans: match.plans,
          icon: match.icon,
          subtitle: match.subtitle,
          targetForm: match.targetForm,
        });
        return;
      }
    }

    // Direct multi-step form screens
    if (
      service.targetScreen &&
      service.targetScreen !== 'ServiceDetail' &&
      service.targetScreen !== 'Pricing'
    ) {
      navigation.navigate(service.targetScreen, {
        serviceId: service.id,
        serviceName: service.name,
      });
      return;
    }

    // Default to ServiceDetailScreen
    navigation.navigate('ServiceDetail', {
      service: {
        id: service.id,
        title: service.name,
        name: service.name,
        icon: service.icon || '📋',
        iconBg: '#E8F0FE',
        subtitle: service.description,
        description: service.description,
        fee: service.fee,
        advancePercent: 100,
        processingTime: service.processingDays || '3-5 Working Days',
        included: service.whatsIncluded || [
          'Expert Preparation & Filing',
          'Document Verification',
          'Official Government Receipt / Certificate',
        ],
      },
    });
  };

  const handleDownloadFormat = (fmt) => {
    console.log(`Download Format: [${fmt.name}]`);
    Alert.alert(
      '📥 Download Template',
      `Downloading "${fmt.name}" (${fmt.category}). Official draft template will be saved to your device.`,
      [{ text: 'OK' }]
    );
  };

  const renderServiceCard = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.serviceCard,
        pressed && styles.serviceCardPressed,
      ]}
      onPress={() => handleServicePress(item)}
    >
      <View style={styles.cardTop}>
        <View style={styles.iconCircle}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <Text style={styles.serviceName} numberOfLines={2}>
        {item.name}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.feeText}>{formatINR(item.fee)}</Text>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{item.category}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1B2B5E" />

      {/* Persistent App Top Bar */}
      <AppTopBar
        title="Tax & Company Services"
        onOpenProfile={() => setProfileModalVisible(true)}
      />

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderServiceCard}
        columnWrapperStyle={styles.columnWrapper}
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
            {/* Hero Card / Banner */}
            <View style={styles.heroBanner}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroSubtitle}>GOVERNMENT & CA COMPLIANCE</Text>
                <Text style={styles.heroTitle}>Business & Tax Services</Text>
                <Text style={styles.heroDesc}>
                  GST, ROC, Income Tax, Trademark & Company filings handled by experts.
                </Text>
              </View>
              <View style={styles.heroEmblem}>
                <Text style={styles.heroEmblemText}>💼</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search across 34 services & filings..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* Filter Chips Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsRow}
            >
              {FILTER_CHIPS.map((chip) => {
                const isActive = selectedFilter === chip;
                return (
                  <Pressable
                    key={chip}
                    style={[
                      styles.chipButton,
                      isActive && styles.chipButtonActive,
                    ]}
                    onPress={() => setSelectedFilter(chip)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {chip}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Services Grid Header */}
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridHeading}>
                {selectedFilter} Services ({filteredServices.length})
              </Text>
              <Text style={styles.instantAssistanceTag}>⚡ CA Verified</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerSection}>
            {/* Formats Download Accordion Card */}
            <View style={styles.formatsCard}>
              <Pressable
                style={styles.formatsHeader}
                onPress={() => setFormatsExpanded(!formatsExpanded)}
              >
                <View style={styles.formatsLeft}>
                  <Text style={styles.formatsIcon}>📑</Text>
                  <View>
                    <Text style={styles.formatsTitle}>Download Required Formats</Text>
                    <Text style={styles.formatsSub}>
                      NOCs, Board Resolutions & Legal Deeds (13 templates)
                    </Text>
                  </View>
                </View>
                <Text style={styles.formatsChevron}>
                  {formatsExpanded ? '▲' : '▼'}
                </Text>
              </Pressable>

              {formatsExpanded && (
                <View style={styles.formatsList}>
                  {REQUIRED_FORMATS.map((fmt) => (
                    <View key={fmt.id} style={styles.formatItemRow}>
                      <View style={styles.formatItemTextWrap}>
                        <Text style={styles.formatItemName}>{fmt.name}</Text>
                        <Text style={styles.formatItemCat}>{fmt.category}</Text>
                      </View>
                      <Pressable
                        style={styles.downloadBtn}
                        onPress={() => handleDownloadFormat(fmt)}
                      >
                        <Text style={styles.downloadBtnText}>📥 Download</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No matching services found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching with another keyword or reset filters.
            </Text>
          </View>
        }
      />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFAB />

      {/* Profile & Settings Drawer Modal */}
      <ProfileDrawerModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onOpenFormats={() => setFormatsExpanded(true)}
      />

      {/* Persistent Bottom Navigation */}
      <BottomNav activeTab="Tax/Acc/Company" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingHorizontal: 14,
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
  heroSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DFB53B',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  filterChipsRow: {
    paddingVertical: 2,
    gap: 8,
    marginBottom: 14,
  },
  chipButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
  },
  chipButtonActive: {
    backgroundColor: '#1B2B5E',
    borderColor: '#1B2B5E',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  gridHeading: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#1B2B5E',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  instantAssistanceTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serviceCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#C5991A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 112,
  },
  serviceCardPressed: {
    opacity: 0.85,
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.99 }],
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1B2B5E0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 17,
  },
  chevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B2B5E',
    lineHeight: 16,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  feeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C5991A',
  },
  catBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  footerSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  formatsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
    overflow: 'hidden',
  },
  formatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  formatsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  formatsIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  formatsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  formatsSub: {
    fontSize: 11,
    color: '#64748B',
  },
  formatsChevron: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: 'bold',
  },
  formatsList: {
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0F2FE',
  },
  formatItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  formatItemTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  formatItemName: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formatItemCat: {
    fontSize: 10,
    color: '#0284C7',
    marginTop: 1,
  },
  downloadBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  downloadBtnText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B2B5E',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
