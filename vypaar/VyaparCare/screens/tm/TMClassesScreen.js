import React, { useState, useMemo } from 'react';
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
import TMStepper from '../../components/TMStepper';
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import { NICE_CLASSES } from '../../config/trademarkConfig';
import { validateTMClasses } from '../../utils/tmValidation';

export default function TMClassesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formState,
    toggleClass,
    updateClassDescription,
    errors,
    setErrors,
  } = useTMForm();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { selectedClasses = [], classDescriptions = {} } = formState;

  const filteredClasses = useMemo(() => {
    let list = NICE_CLASSES;
    if (activeTab === 'goods') {
      list = list.filter((c) => c.type === 'goods');
    } else if (activeTab === 'services') {
      list = list.filter((c) => c.type === 'services');
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (c) =>
        String(c.classNumber).includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        (c.keywords && c.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  }, [activeTab, searchQuery]);

  const handleToggle = (classNum) => {
    toggleClass(classNum);
    if (errors.selectedClasses) {
      setErrors((prev) => ({ ...prev, selectedClasses: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateTMClasses(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('TMUsage');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={4}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Goods / Services & Class Selection</Text>
          <Text style={styles.screenSubheading}>
            Select the Nice Classification class(es) under which your trademark will be protected. Classes 1–34 cover physical goods and Classes 35–45 cover services.
          </Text>
        </View>

        {/* Selected Classes Banner */}
        <View style={styles.selectedBanner}>
          <View style={styles.selectedBannerHeader}>
            <Text style={styles.selectedCountText}>
              Selected Classes ({selectedClasses.length})
            </Text>
            <Text style={styles.concessionNote}>
              {selectedClasses.length === 1
                ? 'Standard 1 Class Filing'
                : `Multi-Class Filing (${selectedClasses.length} Classes)`}
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {selectedClasses.map((cls) => {
              const info = NICE_CLASSES.find((n) => n.classNumber === cls);
              return (
                <View key={`chip-${cls}`} style={styles.classChip}>
                  <Text style={styles.classChipText}>
                    Class {cls}: {info?.title || 'Class'}
                  </Text>
                  <TouchableOpacity
                    style={styles.chipRemoveBtn}
                    onPress={() => handleToggle(cls)}
                  >
                    <Text style={styles.chipRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {errors.selectedClasses ? (
            <Text style={styles.errorText}>{errors.selectedClasses}</Text>
          ) : null}
        </View>

        {/* Search & Filter Tabs */}
        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by product, service, or class number..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'all' && styles.tabBtnTextActive,
                ]}
              >
                All (1–45)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'goods' && styles.tabBtnActive]}
              onPress={() => setActiveTab('goods')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'goods' && styles.tabBtnTextActive,
                ]}
              >
                📦 Goods (1–34)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'services' && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab('services')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'services' && styles.tabBtnTextActive,
                ]}
              >
                🛠️ Services (35–45)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Classes List */}
        <View style={styles.classesList}>
          {filteredClasses.map((item) => {
            const isSelected = selectedClasses.includes(item.classNumber);
            return (
              <TouchableOpacity
                key={`class-${item.classNumber}`}
                style={[
                  styles.classCard,
                  isSelected && styles.classCardSelected,
                ]}
                onPress={() => handleToggle(item.classNumber)}
                activeOpacity={0.7}
              >
                <View style={styles.classCardHeader}>
                  <View
                    style={[
                      styles.classNumBadge,
                      isSelected && styles.classNumBadgeSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.classNumText,
                        isSelected && styles.classNumTextSelected,
                      ]}
                    >
                      Class {item.classNumber}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.typeBadge,
                      item.type === 'goods'
                        ? styles.goodsBadge
                        : styles.servicesBadge,
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {item.type === 'goods' ? 'Goods' : 'Services'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected ? <Text style={styles.checkIcon}>✓</Text> : null}
                  </View>
                </View>

                <Text style={styles.classTitle}>{item.title}</Text>
                <Text style={styles.classDesc}>{item.shortDescription}</Text>
              </TouchableOpacity>
            );
          })}

          {filteredClasses.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No classes match "{searchQuery}". Try searching for another keyword.
              </Text>
            </View>
          )}
        </View>

        {/* Custom Specification & Description for Selected Classes */}
        {selectedClasses.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              📝 Goods / Services Description for Form TM-A
            </Text>
            <Text style={styles.helperText}>
              Enter or refine the precise description of items you sell or services you provide under each selected class.
            </Text>

            {selectedClasses.map((cls) => {
              const clsInfo = NICE_CLASSES.find((n) => n.classNumber === cls);
              const err = errors[`class_desc_${cls}`];
              return (
                <View key={`desc-box-${cls}`} style={styles.descInputBox}>
                  <Text style={styles.descClassHeading}>
                    Class {cls}: {clsInfo?.title}
                  </Text>
                  <TextInput
                    style={[styles.descTextInput, err && styles.descTextInputError]}
                    placeholder={`Describe products/services for Class ${cls}...`}
                    placeholderTextColor="#AAAAAA"
                    value={classDescriptions[cls] || ''}
                    onChangeText={(text) => updateClassDescription(cls, text)}
                    multiline
                    numberOfLines={3}
                  />
                  {err ? <Text style={styles.errorTextSmall}>{err}</Text> : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation Buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerBtnRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← BACK</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>USAGE DETAILS →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.85,
  },
  headerBlock: {
    marginBottom: 16,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  screenSubheading: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 4,
    lineHeight: 19,
  },
  selectedBanner: {
    backgroundColor: '#FAF5E8',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0E2BE',
    marginBottom: 16,
  },
  selectedBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  concessionNote: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  classChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginRight: 6,
  },
  chipRemoveBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRemoveText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#222222',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#EEF2F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: COLORS.white,
  },
  classesList: {
    gap: 10,
    marginBottom: 16,
  },
  classCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E5E8EC',
  },
  classCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF7',
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  classNumBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  classNumBadgeSelected: {
    backgroundColor: COLORS.gold,
  },
  classNumText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  classNumTextSelected: {
    color: COLORS.white,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 'auto',
  },
  goodsBadge: {
    backgroundColor: '#EFF6FF',
  },
  servicesBadge: {
    backgroundColor: '#F0FDF4',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.whatsapp,
    borderColor: COLORS.whatsapp,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  classTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  classDesc: {
    fontSize: 11.5,
    color: COLORS.grayText,
    lineHeight: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.grayText,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E8EC',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 17,
    marginBottom: 14,
  },
  descInputBox: {
    marginBottom: 14,
  },
  descClassHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  descTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 13,
    color: '#222222',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  descTextInputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 6,
  },
  errorTextSmall: {
    color: '#E74C3C',
    fontSize: 11.5,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  footerBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueBtn: {
    flex: 2,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
