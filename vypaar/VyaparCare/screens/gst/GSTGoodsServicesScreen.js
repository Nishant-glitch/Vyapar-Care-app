import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import { validateGSTGoodsServices } from '../../utils/gstValidation';

const POPULAR_SUGGESTIONS = [
  { type: 'services', code: '9983', desc: 'Information technology and computer consulting services' },
  { type: 'services', code: '9963', desc: 'Restaurant, cafe and mobile food catering services' },
  { type: 'services', code: '9982', desc: 'Legal, accounting and auditing services' },
  { type: 'goods', code: '6203', desc: 'Readymade garments, men/women suits and apparel' },
  { type: 'goods', code: '8517', desc: 'Mobile phones, electronics and telecommunication apparatus' },
  { type: 'goods', code: '2106', desc: 'Food preparations, snacks, sweets and FMCG products' },
];

export default function GSTGoodsServicesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    addGoodsService,
    updateGoodsService,
    removeGoodsService,
  } = useGSTForm();
  const [errors, setErrors] = useState({});

  const items = formData.goodsServices || [];

  const handleFieldChange = (idx, field, val) => {
    updateGoodsService(idx, { [field]: val });
    if (errors.goodsServices) {
      setErrors((prev) => ({ ...prev, goodsServices: null }));
    }
  };

  const handleSelectSuggestion = (sug) => {
    // If first item is empty, populate it, else append
    if (items.length === 1 && !items[0].hsnSacCode && !items[0].description) {
      updateGoodsService(0, {
        type: sug.type,
        hsnSacCode: sug.code,
        description: sug.desc,
      });
    } else {
      addGoodsService();
      setTimeout(() => {
        updateGoodsService(items.length, {
          type: sug.type,
          hsnSacCode: sug.code,
          description: sug.desc,
        });
      }, 50);
    }
  };

  const handleNext = () => {
    const errs = validateGSTGoodsServices(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    navigation.navigate('GSTBankDetails');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="Goods & Services (HSN / SAC)" />
      <GSTStepper currentStep={5} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📦 Step 5: Goods & Services Classification</Text>
          <Text style={styles.bannerSubtitle}>
            Specify top 5 commodities or services supplied by your business. Our experts will verify exact HSN / SAC codes.
          </Text>
        </View>

        {errors.goodsServices && (
          <Text style={styles.errorText}>⚠️ {errors.goodsServices}</Text>
        )}

        {/* Quick Suggestion Chips */}
        <Text style={styles.sectionHeader}>Popular Categories (Tap to Add)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sugList}
        >
          {POPULAR_SUGGESTIONS.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.sugCard}
              onPress={() => handleSelectSuggestion(s)}
              activeOpacity={0.7}
            >
              <Text style={styles.sugCode}>
                {s.type === 'goods' ? 'HSN' : 'SAC'} {s.code}
              </Text>
              <Text style={styles.sugDesc} numberOfLines={2}>
                {s.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />
        <Text style={styles.sectionHeader}>Your Goods & Services List</Text>

        {items.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemBadge}>Item #{idx + 1}</Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    item.type === 'goods' && styles.typeBtnActive,
                  ]}
                  onPress={() => handleFieldChange(idx, 'type', 'goods')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      item.type === 'goods' && styles.typeBtnTextActive,
                    ]}
                  >
                    Goods (HSN)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    item.type === 'services' && styles.typeBtnActive,
                  ]}
                  onPress={() => handleFieldChange(idx, 'type', 'services')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      item.type === 'services' && styles.typeBtnTextActive,
                    ]}
                  >
                    Services (SAC)
                  </Text>
                </TouchableOpacity>
              </View>

              {items.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeGoodsService(idx)}
                  style={styles.btnDelete}
                >
                  <Text style={styles.btnDeleteText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <FormField
              label={`${item.type === 'goods' ? 'HSN' : 'SAC'} Code (4 to 8 Digits)`}
              placeholder="e.g. 9983 or 6203"
              value={item.hsnSacCode}
              onChangeText={(v) => handleFieldChange(idx, 'hsnSacCode', v)}
              keyboardType="number-pad"
              maxLength={8}
            />

            <FormField
              label="Description of Goods / Services *"
              placeholder="e.g. Software consulting and mobile application development"
              value={item.description}
              onChangeText={(v) => handleFieldChange(idx, 'description', v)}
              multiline
              numberOfLines={2}
            />
          </View>
        ))}

        {items.length < 5 && (
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={addGoodsService}
            activeOpacity={0.7}
          >
            <Text style={styles.btnAddText}>+ Add Another Commodity / Service</Text>
          </TouchableOpacity>
        )}
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
          <Text style={styles.btnNextText}>CONTINUE TO BANK DETAILS →</Text>
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
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#3730A3', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#4338CA', lineHeight: 18 },
  errorText: { fontSize: 12, color: '#DC2626', marginBottom: 8, fontWeight: '600' },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  sugList: { gap: 10, paddingBottom: 6 },
  sugCard: {
    width: 170,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sugCode: { fontSize: 12, fontWeight: '700', color: '#059669', marginBottom: 4 },
  sugDesc: { fontSize: 11, color: '#475569', lineHeight: 15 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  typeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  typeBtnActive: { backgroundColor: '#059669' },
  typeBtnText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  typeBtnTextActive: { color: COLORS.white, fontWeight: '700' },
  btnDelete: { padding: 4 },
  btnDeleteText: { fontSize: 16, color: '#EF4444', fontWeight: 'bold' },
  btnAdd: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnAddText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
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
