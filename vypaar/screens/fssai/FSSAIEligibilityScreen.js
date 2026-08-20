import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import FSSAIStepper from '../../components/FSSAIStepper';
import { FSSAI_KOB_TYPES } from '../../config/fssaiConfig';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { validateFSSAIEligibility } from '../../utils/fssaiValidation';

export default function FSSAIEligibilityScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, updateFormState, updateBusinessDetails, updateSpecificDetails, eligibility, errors, setErrors } =
    useFSSAIForm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const filteredTypes = FSSAI_KOB_TYPES.filter((t) => {
    const matchesSearch =
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      selectedTab === 'all' ||
      (selectedTab === 'food_service' && t.category === 'food_service') ||
      (selectedTab === 'manufacturing' && t.category === 'manufacturing') ||
      (selectedTab === 'trade' && ['trade', 'storage', 'repacking', 'transport'].includes(t.category)) ||
      (selectedTab === 'special' && ['dairy', 'meat', 'fish', 'water', 'foreign_trade', 'ecommerce'].includes(t.category));
    return matchesSearch && matchesTab;
  });

  const handleSelectKob = (kobItem) => {
    updateFormState({
      kob: kobItem.id,
      licenseType: kobItem.defaultLicense || 'state',
    });
    if (errors.kob) {
      setErrors((prev) => ({ ...prev, kob: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateFSSAIEligibility(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('FSSAIApplicant');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 1 — Business Type & Eligibility"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={1}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>What type of food business do you operate?</Text>
          <Text style={styles.subtitleText}>
            Select your primary Kind of Business (KoB). FoSCoS rules and required documents will dynamically adjust based on your selection.
          </Text>
        </View>

        {/* Live Recommendation Badge Card */}
        <View style={styles.eligibilityBanner}>
          <View style={styles.eligibilityHeaderRow}>
            <Text style={styles.eligibilityTag}>FoSCoS ELIGIBILITY ASSESSMENT</Text>
            <View style={[styles.licenseBadge, { backgroundColor: eligibility.badgeColor }]}>
              <Text style={styles.licenseBadgeText}>{eligibility.label}</Text>
            </View>
          </View>
          <Text style={styles.eligibilityReasonText}>
            💡 {eligibility.reason}
          </Text>
        </View>

        {/* Annual Turnover & Scale Quick Modifiers */}
        <View style={styles.turnoverSection}>
          <Text style={styles.sectionLabel}>Annual Turnover Bracket (Approximate):</Text>
          <View style={styles.turnoverGrid}>
            {[
              { id: 'up_to_12_lakh', label: 'Up to ₹12 Lakh (Petty)', hint: 'Basic Registration' },
              { id: '12_to_20_cr', label: '₹12 Lakh – ₹20 Cr', hint: 'State License' },
              { id: 'above_20_cr', label: 'Above ₹20 Crore', hint: 'Central License' },
            ].map((t) => {
              const active = formState.businessDetails.annualTurnover === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.turnoverChip, active && styles.turnoverChipActive]}
                  onPress={() => updateBusinessDetails({ annualTurnover: t.id })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.turnoverChipText, active && styles.turnoverChipTextActive]}>
                    {t.label}
                  </Text>
                  <Text style={[styles.turnoverHint, active && styles.turnoverHintActive]}>
                    {t.hint}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Restaurant, Bakery, Dairy, Water, Trader..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {[
            { id: 'all', label: 'All (27 Types)' },
            { id: 'food_service', label: '🍽️ Food Service' },
            { id: 'manufacturing', label: '⚙️ Manufacturing' },
            { id: 'trade', label: '🛒 Trade & Logistics' },
            { id: 'special', label: '🌟 Special & Central' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTab, selectedTab === tab.id && styles.filterTabActive]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text style={[styles.filterTabText, selectedTab === tab.id && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {errors.kob ? <Text style={styles.errorBanner}>{errors.kob}</Text> : null}

        {/* 27 KoB Cards */}
        <View style={styles.cardsContainer}>
          {filteredTypes.map((item) => {
            const isSelected = formState.kob === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.kobCard, isSelected && styles.kobCardActive]}
                onPress={() => handleSelectKob(item)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.cardTitleBox}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>SAVE & CONTINUE →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 14,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
  },
  eligibilityBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  eligibilityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eligibilityTag: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  licenseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  licenseBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  eligibilityReasonText: {
    fontSize: 12.5,
    color: '#1E3A8A',
    lineHeight: 18,
    fontWeight: '500',
  },
  turnoverSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  turnoverGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  turnoverChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  turnoverChipActive: {
    backgroundColor: '#FFFDF6',
    borderColor: COLORS.gold,
  },
  turnoverChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  turnoverChipTextActive: {
    color: COLORS.primaryDark,
  },
  turnoverHint: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  turnoverHintActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.primaryDark,
  },
  clearSearch: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryDark,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    color: COLORS.danger,
    padding: 10,
    borderRadius: 8,
    fontSize: 12.5,
    marginBottom: 12,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 10,
  },
  kobCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  kobCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  cardTitleActive: {
    color: '#996B00',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: COLORS.gold,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  continueBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
