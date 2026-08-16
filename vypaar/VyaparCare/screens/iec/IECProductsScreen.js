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
import IECStepper from '../../components/IECStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { IEC_COMMON_COUNTRIES } from '../../config/iecConfig';
import { COLORS } from '../../constants/theme';
import { useIECForm } from '../../contexts/IECFormContext';

export default function IECProductsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateFormData,
    addProduct,
    removeProduct,
  } = useIECForm();

  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newHsn, setNewHsn] = useState('');
  const [newCategory, setNewCategory] = useState('General Goods');
  const [showAddForm, setShowAddForm] = useState(false);

  const products = formData.products || [];
  const selectedCountries = formData.countries || [];

  const handleAddNew = () => {
    if (!newProdName.trim()) return;
    addProduct({
      name: newProdName.trim(),
      description: newProdDesc.trim() || 'General merchandise',
      hsnCode: newHsn.trim() || '0000',
      category: newCategory,
      tradeType: 'Both',
      countries: selectedCountries.slice(0, 2),
    });
    setNewProdName('');
    setNewProdDesc('');
    setNewHsn('');
    setShowAddForm(false);
  };

  const toggleCountry = (country) => {
    const list = [...selectedCountries];
    const idx = list.indexOf(country);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(country);
    }
    updateFormData({ countries: list });
  };

  const handleNext = () => {
    navigation.navigate('IECDocuments');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScreenHeader title="Products & Trade Markets" />
      <IECStepper currentStep={7} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>📦 Step 7: Products, HSN Codes & Target Countries</Text>
          <Text style={styles.bannerSubtitle}>
            Declare the goods or services you intend to trade internationally and your primary destination markets.
          </Text>
        </View>

        {/* Products Section */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionHeader}>Products / Commodities ({products.length})</Text>
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Text style={styles.btnAddText}>
              {showAddForm ? 'Cancel' : '+ Add Product'}
            </Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.addCard}>
            <Text style={styles.addCardTitle}>Add New Product / Commodity</Text>
            <FormField
              label="Product / Commodity Name *"
              placeholder="e.g. Organic Basmati Rice / Auto Parts"
              value={newProdName}
              onChangeText={setNewProdName}
            />
            <FormField
              label="HSN Code (2, 4, 6 or 8 digits)"
              placeholder="e.g. 1006 / 8708"
              value={newHsn}
              onChangeText={setNewHsn}
              keyboardType="number-pad"
            />
            <FormField
              label="Product Description"
              placeholder="Brief specification or commercial trade description"
              value={newProdDesc}
              onChangeText={setNewProdDesc}
            />
            <TouchableOpacity style={styles.btnSaveProd} onPress={handleAddNew}>
              <Text style={styles.btnSaveProdText}>Save Product to List</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.prodList}>
          {products.map((prod, idx) => (
            <View key={prod.id || idx} style={styles.prodCard}>
              <View style={styles.prodHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prodName}>{prod.name}</Text>
                  <Text style={styles.prodHsn}>HSN: {prod.hsnCode || 'N/A'}</Text>
                </View>
                {products.length > 1 && (
                  <TouchableOpacity onPress={() => removeProduct(idx)}>
                    <Text style={styles.btnDelete}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              {prod.description ? (
                <Text style={styles.prodDesc}>{prod.description}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Target Countries Section */}
        <Text style={styles.sectionHeader}>Target Trade Countries / Export Markets</Text>
        <Text style={styles.sectionHint}>
          Select key countries where you plan to export or from where you will import:
        </Text>

        <View style={styles.countryGrid}>
          {IEC_COMMON_COUNTRIES.map((c) => {
            const isSel = selectedCountries.includes(c);
            return (
              <TouchableOpacity
                key={c}
                style={[styles.countryChip, isSel && styles.countryChipSelected]}
                onPress={() => toggleCountry(c)}
              >
                <Text
                  style={[
                    styles.countryChipText,
                    isSel && styles.countryChipTextSelected,
                  ]}
                >
                  {isSel ? '✓ ' : '+ '}
                  {c}
                </Text>
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
          <Text style={styles.btnNextText}>PROCEED TO DOCUMENT CHECKLIST →</Text>
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark },
  sectionHint: { fontSize: 11, color: '#64748B', marginBottom: 10 },
  btnAdd: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnAddText: { fontSize: 11, fontWeight: '700', color: '#0369A1' },
  addCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    marginBottom: 14,
  },
  addCardTitle: { fontSize: 13, fontWeight: '700', color: '#0369A1', marginBottom: 10 },
  btnSaveProd: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnSaveProdText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  prodList: { gap: 8 },
  prodCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  prodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prodName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  prodHsn: { fontSize: 11, fontWeight: '700', color: '#0284C7', marginTop: 2 },
  prodDesc: { fontSize: 11, color: '#64748B', marginTop: 4 },
  btnDelete: { fontSize: 11, color: '#EF4444', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  countryChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  countryChipSelected: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  countryChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  countryChipTextSelected: { color: COLORS.white, fontWeight: '700' },
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
