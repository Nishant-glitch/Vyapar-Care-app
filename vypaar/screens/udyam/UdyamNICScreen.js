import React, { useMemo, useState } from 'react';
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
import UdyamStepper from '../../components/UdyamStepper';
import { searchNICCodes } from '../../config/udyamConfig';
import { COLORS } from '../../constants/theme';
import { useUdyamForm } from '../../contexts/UdyamFormContext';
import { validateUdyamNIC } from '../../utils/udyamValidation';

export default function UdyamNICScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, toggleNICCode } = useUdyamForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});

  const selectedNics = formData.selectedNICCodes || [];

  const searchResults = useMemo(() => {
    return searchNICCodes(searchQuery);
  }, [searchQuery]);

  const handleToggle = (item) => {
    toggleNICCode(item);
    if (errors.selectedNICCodes) {
      setErrors((prev) => ({ ...prev, selectedNICCodes: null }));
    }
  };

  const handleNext = () => {
    const errs = validateUdyamNIC(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('UdyamFinancials');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Business Activity (NIC Codes)" />
      <UdyamStepper currentStep={8} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🔍 Step 8: Search & Select NIC Codes</Text>
          <Text style={styles.bannerSubtitle}>
            National Industrial Classification (NIC 2008) classifies your business activities for government statistics and schemes.
          </Text>
        </View>

        {/* Selected NIC Codes List */}
        <Text style={styles.sectionHeader}>
          Selected Business Activities ({selectedNics.length}) *
        </Text>
        {errors.selectedNICCodes && (
          <Text style={styles.errorText}>⚠️ {errors.selectedNICCodes}</Text>
        )}

        {selectedNics.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No activity selected yet. Search and tap activities below.</Text>
          </View>
        ) : (
          <View style={styles.selectedGrid}>
            {selectedNics.map((nic, idx) => (
              <View key={nic.nic5} style={styles.selectedCard}>
                <View style={styles.selectedHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeText}>
                      {idx === 0 ? 'Primary' : 'Additional'} — NIC {nic.nic5}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleToggle(nic)}>
                    <Text style={styles.btnRemove}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.selectedTitle}>{nic.activity}</Text>
                <Text style={styles.selectedDesc}>{nic.description}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* Search Input Bar */}
        <Text style={styles.sectionHeader}>Search Your Business Activity</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.searchInput}
            placeholder='Type keyword: "Mobile repair", "Software", "Restaurant", "Garments"'
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.btnClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        <Text style={styles.resultsHeader}>
          {searchQuery ? `Matching NIC 2008 Activities (${searchResults.length})` : 'Popular Activities (Tap to Add)'}
        </Text>

        <View style={styles.resultsList}>
          {searchResults.map((item) => {
            const isSelected = selectedNics.some((n) => n.nic5 === item.nic5);
            return (
              <TouchableOpacity
                key={item.nic5}
                style={[styles.resultItem, isSelected && styles.resultItemSelected]}
                onPress={() => handleToggle(item)}
                activeOpacity={0.7}
              >
                <View style={styles.resultTop}>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{item.category}</Text>
                  </View>
                  <Text style={styles.nicDigits}>NIC {item.nic5}</Text>
                </View>

                <Text style={[styles.resultTitle, isSelected && styles.resultTitleSelected]}>
                  {item.activity}
                </Text>
                <Text style={styles.resultDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.actionRow}>
                  <Text style={[styles.actionText, isSelected && styles.actionTextSelected]}>
                    {isSelected ? '✓ Added to Registration' : '+ Tap to Add Activity'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
          <Text style={styles.btnNextText}>CONTINUE TO FINANCIALS →</Text>
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#0284C7', lineHeight: 18 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: '600' },
  emptyCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: { fontSize: 12, color: '#64748B' },
  selectedGrid: { gap: 8 },
  selectedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBadgeText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  btnRemove: { fontSize: 11, color: '#EF4444', fontWeight: '700' },
  selectedTitle: { fontSize: 13, fontWeight: '700', color: '#065F46', marginBottom: 2 },
  selectedDesc: { fontSize: 11, color: '#047857', lineHeight: 15 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    marginBottom: 14,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 13, color: COLORS.text },
  btnClear: { fontSize: 14, color: '#94A3B8', padding: 4 },
  resultsHeader: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  resultsList: { gap: 8 },
  resultItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultItemSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: { fontSize: 10, fontWeight: '600', color: '#475569' },
  nicDigits: { fontSize: 11, fontWeight: '700', color: '#0284C7' },
  resultTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  resultTitleSelected: { color: '#065F46' },
  resultDesc: { fontSize: 11, color: '#64748B', lineHeight: 15 },
  actionRow: { marginTop: 6, alignItems: 'flex-end' },
  actionText: { fontSize: 11, fontWeight: '700', color: '#0284C7' },
  actionTextSelected: { color: '#059669' },
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
