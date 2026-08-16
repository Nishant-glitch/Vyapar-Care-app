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
import OtherServicesStepper from '../../components/OtherServicesStepper';
import ScreenHeader from '../../components/ScreenHeader';
import {
  OTHER_CATEGORIES,
  OTHER_SERVICE_BASE_INFO,
  searchOtherServices,
} from '../../config/otherServicesConfig';
import { COLORS } from '../../constants/theme';
import { useOtherForm } from '../../contexts/OtherFormContext';
import { validateOtherSelectService } from '../../utils/otherServicesValidation';

export default function OtherSelectServiceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, updateFormData } = useOtherForm();

  const [query, setQuery] = useState(formData.searchQuery || '');
  const [expandedCat, setExpandedCat] = useState('gst');
  const [error, setError] = useState(null);

  const selectedService = formData.selectedService;
  const isUncertain = formData.isUncertainService;

  const searchResults = searchOtherServices(query);

  const handleSelectService = (service, cat) => {
    updateFormData({
      selectedService: {
        ...service,
        categoryId: cat.id,
        categoryName: cat.name,
      },
      isUncertainService: false,
    });
    if (error) setError(null);
  };

  const handleSelectUncertain = () => {
    updateFormData({
      selectedService: {
        id: 'uncertain',
        name: 'General Legal / Tax Consultation',
        categoryId: 'other_misc',
        categoryName: 'General Consultation',
      },
      isUncertainService: true,
    });
    if (error) setError(null);
  };

  const handleNext = () => {
    const errs = validateOtherSelectService(formData);
    if (Object.keys(errs).length > 0) {
      setError(errs.selectedService);
      return;
    }
    navigation.navigate('OtherApplicant');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Other Services Consultation" />
      <OtherServicesStepper currentStep={1} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Notice */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>💡 Step 1: Select or Search Your Service</Text>
          <Text style={styles.bannerSubtitle}>
            {isUncertain
              ? OTHER_SERVICE_BASE_INFO.uncertainNotice
              : OTHER_SERVICE_BASE_INFO.bannerNotice}
          </Text>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search requirement (e.g. GST cancel, Notice, FSSAI renew)..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              updateFormData({ searchQuery: v });
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results if any */}
        {query.trim().length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionHeader}>
              Search Results ({searchResults.length} matches):
            </Text>
            {searchResults.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No direct match found for "{query}".</Text>
                <TouchableOpacity
                  style={styles.btnSelectUncertain}
                  onPress={handleSelectUncertain}
                >
                  <Text style={styles.btnSelectUncertainText}>
                    ✨ Continue with "I Don't Know Which Service I Need"
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              searchResults.map((item) => {
                const isSelected = selectedService?.id === item.id && !isUncertain;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.resultItem, isSelected && styles.resultItemSelected]}
                    onPress={() =>
                      handleSelectService(item, {
                        id: item.categoryId,
                        name: item.categoryName,
                      })
                    }
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.resultName, isSelected && styles.resultNameSelected]}>
                        {item.name}
                      </Text>
                      <Text style={styles.resultCat}>
                        {item.categoryIcon} {item.categoryName}
                      </Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : (
          /* Normal Categories View */
          <View>
            {/* "I don't know which service I need" card */}
            <TouchableOpacity
              style={[
                styles.uncertainCard,
                isUncertain && styles.uncertainCardSelected,
              ]}
              onPress={handleSelectUncertain}
              activeOpacity={0.8}
            >
              <View style={styles.uncertainTop}>
                <Text style={styles.uncertainIcon}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.uncertainTitle,
                      isUncertain && styles.uncertainTitleSelected,
                    ]}
                  >
                    I don't know which service I need
                  </Text>
                  <Text style={styles.uncertainDesc}>
                    Tell us your requirement in plain words. Our CA & legal experts will review your case and guide you.
                  </Text>
                </View>
                <View style={[styles.radio, isUncertain && styles.radioSelected]}>
                  {isUncertain && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>

            <Text style={styles.orDivider}>— OR SELECT FROM CATEGORIES —</Text>

            {/* 9 Categories Accordion */}
            {OTHER_CATEGORIES.map((cat) => {
              const isExpanded = expandedCat === cat.id;

              return (
                <View key={cat.id} style={styles.catCard}>
                  <TouchableOpacity
                    style={styles.catHeader}
                    onPress={() => setExpandedCat(isExpanded ? null : cat.id)}
                  >
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catName}>{cat.name}</Text>
                      <Text style={styles.catDesc}>{cat.desc}</Text>
                    </View>
                    <Text style={styles.arrowIcon}>{isExpanded ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.servicesGrid}>
                      {cat.services.map((s) => {
                        const isSelected =
                          selectedService?.id === s.id && !isUncertain;
                        return (
                          <TouchableOpacity
                            key={s.id}
                            style={[
                              styles.serviceChip,
                              isSelected && styles.serviceChipSelected,
                            ]}
                            onPress={() => handleSelectService(s, cat)}
                          >
                            <Text
                              style={[
                                styles.serviceChipText,
                                isSelected && styles.serviceChipTextSelected,
                              ]}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {s.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
      </ScrollView>

      {/* ---------- Footer ---------- */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 14) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.btnNext, pressed && styles.btnPressed]}
          onPress={handleNext}
        >
          <Text style={styles.btnNextText}>SAVE & CONTINUE →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  banner: {
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 12, color: '#0284C7', lineHeight: 17 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 14,
    height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.text },
  clearIcon: { fontSize: 14, color: '#94A3B8', padding: 4 },
  resultsContainer: { marginBottom: 16 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 10 },
  emptyBox: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: { fontSize: 13, color: '#64748B', marginBottom: 10 },
  btnSelectUncertain: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSelectUncertainText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  resultItemSelected: { borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
  resultName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  resultNameSelected: { color: '#0369A1' },
  resultCat: { fontSize: 11, color: '#64748B', marginTop: 2 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioSelected: { borderColor: '#0284C7' },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#0284C7' },
  uncertainCard: {
    backgroundColor: '#FFFDF5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 14,
  },
  uncertainCardSelected: { backgroundColor: '#FEF3C7', borderColor: '#D97706' },
  uncertainTop: { flexDirection: 'row', alignItems: 'center' },
  uncertainIcon: { fontSize: 24, marginRight: 10 },
  uncertainTitle: { fontSize: 14, fontWeight: '800', color: '#B45309' },
  uncertainTitleSelected: { color: '#92400E' },
  uncertainDesc: { fontSize: 11, color: '#92400E', lineHeight: 15, marginTop: 2 },
  orDivider: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 10,
    letterSpacing: 0.5,
  },
  catCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
  },
  catIcon: { fontSize: 22, marginRight: 10 },
  catName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  catDesc: { fontSize: 11, color: '#64748B', marginTop: 1 },
  arrowIcon: { fontSize: 12, color: '#94A3B8', marginLeft: 8 },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  serviceChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  serviceChipSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  serviceChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  serviceChipTextSelected: { color: COLORS.white, fontWeight: '700' },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 8, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btnNext: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.85 },
  btnNextText: { fontSize: 15, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
});
