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
import { FormField, SelectField } from '../../components/FormField';
import { FSSAI_FOOD_CATEGORIES } from '../../config/fssaiConfig';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { validateFSSAIProducts } from '../../utils/fssaiValidation';

export default function FSSAIProductsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, addProduct, removeProduct, updateProduct, errors, setErrors } = useFSSAIForm();
  const { products } = formState;

  const [categoryFilter, setCategoryFilter] = useState('');

  const categoryOptions = FSSAI_FOOD_CATEGORIES.map((cat) => ({
    id: cat.code,
    label: `Category ${cat.code}: ${cat.name}`,
  }));

  const handleContinue = () => {
    const errs = validateFSSAIProducts(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('FSSAISpecific');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 5 — Food Categories & Products"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={5}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.sectionTitle}>Food Products & Categories</Text>
              <Text style={styles.sectionSubtitle}>
                Add food articles, menu items, or packaged goods handled on premises.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() =>
                addProduct({
                  productName: '',
                  categoryCode: '16',
                  categoryName: 'Prepared foods',
                  description: '',
                  capacity: '',
                  unit: '',
                })
              }
            >
              <Text style={styles.addBtnText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>
        </View>

        {errors.products && <Text style={styles.errorBanner}>{errors.products}</Text>}

        {/* Product Cards List */}
        {products.map((prod, idx) => {
          return (
            <View key={`prod-${idx}`} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>ITEM #{idx + 1}</Text>
                </View>
                {products.length > 1 && (
                  <TouchableOpacity onPress={() => removeProduct(idx)}>
                    <Text style={styles.deleteBtnText}>Remove ✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <FormField
                label={`Product / Food Item Name`}
                required
                placeholder="e.g. Pure Desi Ghee / Butter Chicken / Mineral Water"
                value={prod.productName}
                onChangeText={(val) => updateProduct(idx, { productName: val })}
                error={errors[`product_${idx}_name`]}
              />

              <SelectField
                label="FSSAI Food Category (FoSCoS Schedule)"
                required
                options={categoryOptions}
                value={prod.categoryCode}
                onValueChange={(val) => {
                  const found = FSSAI_FOOD_CATEGORIES.find((c) => c.code === val);
                  updateProduct(idx, {
                    categoryCode: val,
                    categoryName: found ? found.name : '',
                  });
                }}
                error={errors[`product_${idx}_category`]}
              />

              <FormField
                label="Product Description / Ingredients"
                placeholder="e.g. Fresh dairy milk, sugar, cardamom, food grade packaging"
                value={prod.description}
                onChangeText={(val) => updateProduct(idx, { description: val })}
              />

              <View style={styles.rowTwo}>
                <View style={styles.colTwo}>
                  <FormField
                    label="Handling Capacity / Daily Quantity"
                    placeholder="e.g. 500 Kg / 200 Meals"
                    value={prod.capacity}
                    onChangeText={(val) => updateProduct(idx, { capacity: val })}
                  />
                </View>
                <View style={styles.colTwo}>
                  <FormField
                    label="Packaging / Serving Unit"
                    placeholder="e.g. 1 Litre Bottle / Box"
                    value={prod.unit}
                    onChangeText={(val) => updateProduct(idx, { unit: val })}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* 16 Standard Categories Reference Box */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>📚 Official 16 FSSAI Food Categories Guide</Text>
          <Text style={styles.guideText}>
            Under the Food Safety and Standards Act, food products are classified across 16 statutory schedules (01 Dairy, 02 Fats & Oils, 04 Fruits/Veg, 07 Bakery, 14 Beverages, 16 Prepared Restaurant Foods, etc.).
          </Text>
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
  sectionHeader: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    maxWidth: 240,
  },
  addBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    color: COLORS.danger,
    padding: 10,
    borderRadius: 8,
    fontSize: 12.5,
    marginBottom: 14,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  productBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  deleteBtnText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  colTwo: {
    flex: 1,
  },
  guideCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  guideText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
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
