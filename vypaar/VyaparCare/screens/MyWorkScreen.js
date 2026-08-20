import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { CATEGORIES, DIRECT_SERVICES, REQUIRED_FORMATS } from '../config/servicesHub';
import { COLORS } from '../constants/theme';
import { formatINR } from '../utils/currency';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MyWorkScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [expandedCategories, setExpandedCategories] = useState({
    'gst-services': false,
    'accounting-taxation': false,
    'company-compliances': false,
    'fssai-services': false,
    'other-registration': false,
    'required-formats': false,
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Toggle accordion card
  const toggleCategory = (categoryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle Sub-Item Tap
  const handleSubItemPress = (subItem, category) => {
    console.log(`Selected Sub-Item: ${subItem.name} in ${category.title}`);

    // If sub-item has a dedicated direct form screen
    if (
      subItem.targetScreen &&
      subItem.targetScreen !== 'ServiceDetail' &&
      subItem.targetScreen !== 'OtherSelectService'
    ) {
      navigation.navigate(subItem.targetScreen, {
        serviceId: subItem.id,
        serviceName: subItem.name,
      });
      return;
    }

    // Default: Navigate to ServiceDetailScreen with full data
    navigation.navigate('ServiceDetail', {
      service: {
        id: subItem.id,
        title: subItem.name,
        name: subItem.name,
        icon: category.icon || '📋',
        iconBg: '#E8F0FE',
        subtitle: subItem.description,
        description: subItem.description,
        fee: subItem.fee,
        advancePercent: 100,
        processingTime: subItem.processingDays || '3-5 Working Days',
        included: subItem.whatsIncluded || [
          'Expert Preparation & Filing',
          'Document Verification',
          'Official Government Receipt / Certificate',
        ],
      },
    });
  };

  // Handle Direct Service Tap (Opens Pricing Screen)
  const handleDirectServicePress = (directService) => {
    console.log(`Opening Pricing Screen for ${directService.title}`);
    navigation.navigate('Pricing', {
      service: directService,
      serviceName: directService.title,
      plans: directService.plans,
      icon: directService.icon,
      subtitle: directService.subtitle,
      targetForm: directService.targetForm,
    });
  };

  // Handle Format Download
  const handleDownloadFormat = (formatItem) => {
    console.log(`Download: [${formatItem.name}]`);
    Alert.alert(
      '📥 Download Format',
      `Downloading "${formatItem.name}" (${formatItem.category}). Official draft template will be saved to your device.`,
      [{ text: 'OK' }]
    );
  };

  // Filtered Services based on search query
  const query = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!query) return CATEGORIES;
    return CATEGORIES.map((cat) => {
      const matchCat = cat.title.toLowerCase().includes(query);
      const filteredSubs = cat.subItems.filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.description.toLowerCase().includes(query)
      );
      if (matchCat || filteredSubs.length > 0) {
        return {
          ...cat,
          subItems: filteredSubs.length > 0 ? filteredSubs : cat.subItems,
        };
      }
      return null;
    }).filter(Boolean);
  }, [query]);

  const filteredDirectServices = useMemo(() => {
    if (!query) return DIRECT_SERVICES;
    return DIRECT_SERVICES.filter(
      (ds) =>
        ds.title.toLowerCase().includes(query) ||
        ds.subtitle.toLowerCase().includes(query) ||
        ds.plans.some((p) => p.name.toLowerCase().includes(query))
    );
  }, [query]);

  const filteredFormats = useMemo(() => {
    if (!query) return REQUIRED_FORMATS;
    return REQUIRED_FORMATS.filter(
      (fmt) =>
        fmt.name.toLowerCase().includes(query) ||
        fmt.description.toLowerCase().includes(query) ||
        fmt.category.toLowerCase().includes(query)
    );
  }, [query]);

  // Is searching active? If searching, automatically expand all matching categories
  const isSearching = query.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Top Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.mainTitle}>Tax / Accounting / Company</Text>
            <Text style={styles.subTitle}>All Business & Compliance Services</Text>
          </View>
          <View style={styles.portalEmblem}>
            <Text style={styles.portalEmblemIcon}>⚖️</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, filings, plans or formats..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 75 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* SECTION 1: EXPANDABLE CATEGORIES (1 - 5)                                   */}
        {/* ========================================================================= */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeading}>Categorized Business Services</Text>
          <Text style={styles.sectionSub}>Tap any category to explore sub-services</Text>
        </View>

        {filteredCategories.map((category) => {
          const isExpanded = isSearching || Boolean(expandedCategories[category.id]);
          const subCount = category.subItems.length;

          return (
            <View key={category.id} style={styles.categoryCard}>
              {/* Category Card Header (Tap to toggle) */}
              <Pressable
                style={({ pressed }) => [
                  styles.categoryCardHeader,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <View style={styles.categoryLeft}>
                  <View style={styles.categoryIconCircle}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <View style={styles.categoryTitleWrap}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDesc} numberOfLines={1}>
                      {category.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.categoryRight}>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{category.badge || `${subCount} services`}</Text>
                  </View>
                  <Text style={[styles.chevron, isExpanded && styles.chevronRotated]}>
                    {isExpanded ? '▼' : '›'}
                  </Text>
                </View>
              </Pressable>

              {/* Sub-Items List (Accordion Content) */}
              {isExpanded && (
                <View style={styles.subItemsContainer}>
                  {category.subItems.map((subItem, index) => (
                    <Pressable
                      key={subItem.id || index}
                      style={({ pressed }) => [
                        styles.subItemRow,
                        pressed && styles.subItemPressed,
                        index === category.subItems.length - 1 && styles.subItemRowLast,
                      ]}
                      onPress={() => handleSubItemPress(subItem, category)}
                    >
                      <View style={styles.subItemIndexBadge}>
                        <Text style={styles.subItemIndexText}>{index + 1}</Text>
                      </View>

                      <View style={styles.subItemTextWrap}>
                        <View style={styles.subItemTitleRow}>
                          <Text style={styles.subItemName}>{subItem.name}</Text>
                          {subItem.fee ? (
                            <Text style={styles.subItemFee}>{formatINR(subItem.fee)}</Text>
                          ) : null}
                        </View>
                        <Text style={styles.subItemDesc} numberOfLines={2}>
                          {subItem.description}
                        </Text>
                      </View>

                      <Text style={styles.subItemArrow}>›</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* ========================================================================= */}
        {/* SECTION 2: DIRECT SERVICE PLANS (6 - 11)                                  */}
        {/* ========================================================================= */}
        <View style={[styles.sectionHeaderWrap, { marginTop: 24 }]}>
          <Text style={styles.sectionHeading}>Direct Pricing & Plan Services</Text>
          <Text style={styles.sectionSub}>Instant plan selection and fast-track filing</Text>
        </View>

        <View style={styles.directGrid}>
          {filteredDirectServices.map((directService) => (
            <Pressable
              key={directService.id}
              style={({ pressed }) => [
                styles.directCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleDirectServicePress(directService)}
            >
              <View style={styles.directTopRow}>
                <View style={styles.directIconCircle}>
                  <Text style={styles.directIcon}>{directService.icon}</Text>
                </View>
                <View style={styles.directBadgePill}>
                  <Text style={styles.directBadgeText}>{directService.badge}</Text>
                </View>
              </View>

              <Text style={styles.directTitle}>{directService.title}</Text>
              <Text style={styles.directSubtitle} numberOfLines={2}>
                {directService.subtitle}
              </Text>

              <View style={styles.directBottomRow}>
                <Text style={styles.viewPlansText}>View Plans</Text>
                <Text style={styles.viewPlansArrow}>→</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ========================================================================= */}
        {/* SECTION 3: CATEGORY 12 - ALL REQUIRED FORMATS                             */}
        {/* ========================================================================= */}
        <View style={[styles.sectionHeaderWrap, { marginTop: 24 }]}>
          <Text style={styles.sectionHeading}>Legal & Regulatory Formats</Text>
          <Text style={styles.sectionSub}>Download specimen drafts, affidavits & resolutions</Text>
        </View>

        <View style={[styles.categoryCard, styles.formatsCard]}>
          <Pressable
            style={({ pressed }) => [
              styles.categoryCardHeader,
              pressed && styles.cardPressed,
            ]}
            onPress={() => toggleCategory('required-formats')}
          >
            <View style={styles.categoryLeft}>
              <View style={[styles.categoryIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Text style={styles.categoryIcon}>📑</Text>
              </View>
              <View style={styles.categoryTitleWrap}>
                <Text style={styles.categoryTitle}>All Required Formats</Text>
                <Text style={styles.categoryDesc}>
                  NOCs, Board Resolutions, Declarations & Deeds
                </Text>
              </View>
            </View>

            <View style={styles.categoryRight}>
              <View style={[styles.badgePill, { backgroundColor: '#0284C7' }]}>
                <Text style={styles.badgeText}>{filteredFormats.length} formats</Text>
              </View>
              <Text style={[styles.chevron, (isSearching || expandedCategories['required-formats']) && styles.chevronRotated]}>
                {isSearching || expandedCategories['required-formats'] ? '▼' : '›'}
              </Text>
            </View>
          </Pressable>

          {/* Formats Sub-List */}
          {(isSearching || expandedCategories['required-formats']) && (
            <View style={styles.formatsListContainer}>
              {filteredFormats.map((formatItem, index) => (
                <View key={formatItem.id || index} style={styles.formatRow}>
                  <View style={styles.formatLeft}>
                    <Text style={styles.formatDocIcon}>📄</Text>
                    <View style={styles.formatTextWrap}>
                      <Text style={styles.formatName}>{formatItem.name}</Text>
                      <View style={styles.formatMetaRow}>
                        <Text style={styles.formatCategoryBadge}>{formatItem.category}</Text>
                        <Text style={styles.formatFileType}>{formatItem.fileType || 'PDF'}</Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.downloadBtn,
                      pressed && styles.downloadBtnPressed,
                    ]}
                    onPress={() => handleDownloadFormat(formatItem)}
                  >
                    <Text style={styles.downloadBtnIcon}>📥</Text>
                    <Text style={styles.downloadBtnText}>Download</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Support Callout Banner */}
        <View style={styles.supportBanner}>
          <Text style={styles.supportIcon}>🛡️</Text>
          <View style={styles.supportTextWrap}>
            <Text style={styles.supportTitle}>Vyapar Care Regulatory Desk</Text>
            <Text style={styles.supportSubtitle}>
              Need custom documentation, tender support or departmental appeal assistance?
            </Text>
          </View>
          <Pressable
            style={styles.supportActionBtn}
            onPress={() => navigation.navigate('OtherSelectService')}
          >
            <Text style={styles.supportActionText}>Contact Legal</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="My Work" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B2B5E',
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  portalEmblem: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1B2B5E10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalEmblemIcon: {
    fontSize: 22,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeaderWrap: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B2B5E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardPressed: {
    backgroundColor: '#F8FAFC',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B2B5E0D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryTitleWrap: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B2B5E',
    marginBottom: 2,
  },
  categoryDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    backgroundColor: '#C5991A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chevron: {
    fontSize: 18,
    color: '#C5991A',
    fontWeight: '900',
    marginLeft: 2,
  },
  chevronRotated: {
    fontSize: 13,
    color: '#1B2B5E',
  },
  subItemsContainer: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 4,
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subItemRowLast: {
    borderBottomWidth: 0,
  },
  subItemPressed: {
    backgroundColor: '#EEF2F6',
  },
  subItemIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subItemIndexText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  subItemTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  subItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  subItemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    paddingRight: 6,
  },
  subItemFee: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C5991A',
  },
  subItemDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
  },
  subItemArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  directGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  directCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
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
  directTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  directIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directIcon: {
    fontSize: 18,
  },
  directBadgePill: {
    backgroundColor: '#1B2B5E10',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  directBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1B2B5E',
  },
  directTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B2B5E',
    marginBottom: 3,
  },
  directSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 10,
    minHeight: 28,
  },
  directBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  viewPlansText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#C5991A',
  },
  viewPlansArrow: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C5991A',
  },
  formatsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
  },
  formatsListContainer: {
    backgroundColor: '#F0F9FF',
    borderTopWidth: 1,
    borderTopColor: '#E0F2FE',
    padding: 10,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  formatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  formatDocIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  formatTextWrap: {
    flex: 1,
  },
  formatName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 3,
  },
  formatMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formatCategoryBadge: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '600',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  formatFileType: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadBtnPressed: {
    opacity: 0.8,
  },
  downloadBtnIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  downloadBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2B5E',
    borderRadius: 14,
    padding: 16,
    marginTop: 18,
    shadowColor: '#1B2B5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  supportIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  supportTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  supportTitle: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  supportActionBtn: {
    backgroundColor: '#C5991A',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  supportActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
