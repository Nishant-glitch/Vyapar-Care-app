import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import FSSAIStepper from '../../components/FSSAIStepper';
import { FormField, SelectField, ToggleField } from '../../components/FormField';
import { COLORS } from '../../constants/theme';
import { useFSSAIForm } from '../../contexts/FSSAIFormContext';
import { formatIEC, validateFSSAISpecific } from '../../utils/fssaiValidation';

export default function FSSAISpecificScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formState,
    updateSpecificDetails,
    addEquipment,
    removeEquipment,
    updateEquipment,
    addVehicle,
    removeVehicle,
    updateVehicle,
    errors,
    setErrors,
  } = useFSSAIForm();

  const { kob, specificDetails = {} } = formState;

  const handleFieldChange = (field, value) => {
    updateSpecificDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateFSSAISpecific(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('FSSAIDocumentsChecklist');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="FSSAI Food License"
        subtitle="Step 6 — Business-Specific Details"
        onBack={() => navigation.goBack()}
      />

      <FSSAIStepper
        currentStep={6}
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
          <Text style={styles.sectionTitle}>Kind of Business (KoB) Specifications</Text>
          <Text style={styles.sectionSubtitle}>
            Specific operational technical details according to your selected food business activity.
          </Text>
        </View>

        {/* 1. Manufacturer / Processor / Bakery */}
        {['manufacturer', 'processor', 'oil_processing', 'bakery'].includes(kob) && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>⚙️ Manufacturing Unit & Equipment</Text>

            <View style={styles.rowTwo}>
              <View style={styles.colTwo}>
                <FormField
                  label="Daily Production Capacity"
                  required
                  placeholder="e.g. 1000"
                  keyboardType="number-pad"
                  value={specificDetails.productionCapacity}
                  onChangeText={(val) => handleFieldChange('productionCapacity', val)}
                  error={errors.productionCapacity}
                />
              </View>
              <View style={styles.colTwo}>
                <SelectField
                  label="Capacity Unit"
                  options={[
                    { id: 'Kg/Day', label: 'Kg / Day' },
                    { id: 'MT/Day', label: 'Metric Tonnes / Day' },
                    { id: 'Litres/Day', label: 'Litres / Day' },
                    { id: 'Units/Day', label: 'Units / Day' },
                  ]}
                  value={specificDetails.capacityUnit}
                  onValueChange={(val) => handleFieldChange('capacityUnit', val)}
                />
              </View>
            </View>

            <View style={styles.rowTwo}>
              <View style={styles.colTwo}>
                <FormField
                  label="Daily Working Hours"
                  placeholder="e.g. 8 or 16"
                  keyboardType="number-pad"
                  value={specificDetails.workingHours}
                  onChangeText={(val) => handleFieldChange('workingHours', val)}
                />
              </View>
              <View style={styles.colTwo}>
                <FormField
                  label="Production Employees"
                  placeholder="e.g. 15"
                  keyboardType="number-pad"
                  value={specificDetails.employees}
                  onChangeText={(val) => handleFieldChange('employees', val)}
                />
              </View>
            </View>

            <FormField
              label="Manufacturing Process Summary"
              placeholder="e.g. Raw material cleaning, blending, baking at 180C, cooling and automated nitrogen flush packing"
              multiline
              numberOfLines={3}
              value={specificDetails.processDescription}
              onChangeText={(val) => handleFieldChange('processDescription', val)}
            />

            {/* Dynamic Equipment List */}
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>Installed Machinery & Equipment</Text>
              <TouchableOpacity style={styles.addBtnSmall} onPress={addEquipment}>
                <Text style={styles.addBtnSmallText}>+ Add Equipment</Text>
              </TouchableOpacity>
            </View>

            {(specificDetails.equipment || []).map((eq, idx) => (
              <View key={`eq-${idx}`} style={styles.itemBlock}>
                <View style={styles.blockTitleRow}>
                  <Text style={styles.blockTitle}>Machine #{idx + 1}</Text>
                  {(specificDetails.equipment || []).length > 1 && (
                    <TouchableOpacity onPress={() => removeEquipment(idx)}>
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label="Equipment / Machine Name"
                  placeholder="e.g. Rotary Baking Oven / Grinder / Mixer"
                  value={eq.name}
                  onChangeText={(val) => updateEquipment(idx, { name: val })}
                />

                <View style={styles.rowTwo}>
                  <View style={styles.colTwo}>
                    <FormField
                      label="Quantity"
                      placeholder="e.g. 1"
                      keyboardType="number-pad"
                      value={eq.quantity}
                      onChangeText={(val) => updateEquipment(idx, { quantity: val })}
                    />
                  </View>
                  <View style={styles.colTwo}>
                    <FormField
                      label="Installed Horse Power (HP)"
                      placeholder="e.g. 5 HP"
                      value={eq.hp}
                      onChangeText={(val) => updateEquipment(idx, { hp: val })}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 2. Restaurant / Cafe / Food Service / Cloud Kitchen */}
        {['restaurant', 'cafe', 'cloud_kitchen', 'caterer', 'dhaba', 'sweet_shop'].includes(kob) && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>🍽️ Food Service & Kitchen Scope</Text>

            {kob !== 'cloud_kitchen' && (
              <FormField
                label="Seating Capacity (Number of Chairs)"
                placeholder="e.g. 40"
                keyboardType="number-pad"
                value={specificDetails.seatingCapacity}
                onChangeText={(val) => handleFieldChange('seatingCapacity', val)}
              />
            )}

            <FormField
              label="Kitchen Hygiene & Layout Details"
              placeholder="e.g. Stainless steel work tables, grease trap, insect killer, exhaust canopy"
              value={specificDetails.kitchenDetails}
              onChangeText={(val) => handleFieldChange('kitchenDetails', val)}
            />

            <ToggleField
              label="Delivery & Takeaway Services Available?"
              value={specificDetails.isDeliveryTakeaway}
              onValueChange={(val) => handleFieldChange('isDeliveryTakeaway', val)}
            />
          </View>
        )}

        {/* 3. Hotel */}
        {kob === 'hotel' && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>🏨 Hotel Classification & Rooms</Text>

            <SelectField
              label="Star Rating / Category"
              options={[
                { id: '3', label: '3-Star / Heritage' },
                { id: '4', label: '4-Star (HRACC Certificate required for Central)' },
                { id: '5', label: '5-Star & 5-Star Deluxe (Central License)' },
                { id: 'unrated', label: 'Unrated Hotel / Guest House' },
              ]}
              value={specificDetails.hotelRating}
              onValueChange={(val) => handleFieldChange('hotelRating', val)}
            />

            <View style={styles.rowTwo}>
              <View style={styles.colTwo}>
                <FormField
                  label="Number of Guest Rooms"
                  placeholder="e.g. 50"
                  keyboardType="number-pad"
                  value={specificDetails.roomCount}
                  onChangeText={(val) => handleFieldChange('roomCount', val)}
                />
              </View>
              <View style={styles.colTwo}>
                <FormField
                  label="Kitchens / Dining Outlets"
                  placeholder="e.g. 2"
                  keyboardType="number-pad"
                  value={specificDetails.kitchenCount}
                  onChangeText={(val) => handleFieldChange('kitchenCount', val)}
                />
              </View>
            </View>

            <FormField
              label="Ministry of Tourism / HRACC Certificate No."
              placeholder="e.g. HRACC/2026/DL/123"
              value={specificDetails.hraccCertificateNumber}
              onChangeText={(val) => handleFieldChange('hraccCertificateNumber', val)}
              hint="Mandatory for 4-star and 5-star properties"
            />
          </View>
        )}

        {/* 4. Dairy / Milk Business */}
        {kob === 'dairy' && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>🥛 Dairy Handling & Milk Procurement</Text>

            <FormField
              label="Milk Handling / Processing Capacity (Litres / Day)"
              required
              placeholder="e.g. 5000"
              keyboardType="number-pad"
              value={specificDetails.dairyLPD}
              onChangeText={(val) => handleFieldChange('dairyLPD', val)}
              error={errors.dairyLPD}
              hint="> 50,000 LPD requires Central License; ≤ 50,000 LPD under State License"
            />

            <FormField
              label="Number of Milk Collection Centres"
              placeholder="e.g. 4"
              keyboardType="number-pad"
              value={specificDetails.collectionCentres}
              onChangeText={(val) => handleFieldChange('collectionCentres', val)}
            />

            <FormField
              label="Source of Milk / Procurement Plan"
              placeholder="e.g. Direct dairy farmers cooperative network with bulk milk chilling units"
              value={specificDetails.milkSource}
              onChangeText={(val) => handleFieldChange('milkSource', val)}
            />
          </View>
        )}

        {/* 5. Meat / Slaughterhouse */}
        {kob === 'meat' && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>🥩 Meat Sourcing & Capacity</Text>

            <FormField
              label="Type of Meat Handled"
              placeholder="e.g. Chicken, Mutton, Seafood"
              value={specificDetails.meatType}
              onChangeText={(val) => handleFieldChange('meatType', val)}
            />

            <FormField
              label="Daily Meat Processing Capacity"
              placeholder="e.g. 200 Kg / Day"
              value={specificDetails.meatDailyCapacity}
              onChangeText={(val) => handleFieldChange('meatDailyCapacity', val)}
            />

            <FormField
              label="Source of Raw Material / Slaughterhouse NOC"
              required
              placeholder="e.g. Municipal Slaughterhouse Ghazipur / Registered Abattoir"
              value={specificDetails.meatSource}
              onChangeText={(val) => handleFieldChange('meatSource', val)}
              error={errors.meatSource}
            />
          </View>
        )}

        {/* 6. Packaged Drinking Water */}
        {kob === 'water' && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>💧 Packaged Water Plant Specifications</Text>

            <FormField
              label="Raw Water Source"
              required
              placeholder="e.g. Deep Borewell with Continuous Yield (150 ft)"
              value={specificDetails.waterSource}
              onChangeText={(val) => handleFieldChange('waterSource', val)}
              error={errors.waterSource}
            />

            <FormField
              label="BIS / ISI Certification Number (or Application No.)"
              placeholder="e.g. CM/L-1234567"
              value={specificDetails.bisNumber}
              onChangeText={(val) => handleFieldChange('bisNumber', val)}
              hint="BIS certification is mandatory for packaged drinking water under FSSA Act"
            />

            <FormField
              label="Packaging Type & Volume"
              placeholder="e.g. 250ml Cups, 500ml & 1000ml PET Bottles, 20L Jars"
              value={specificDetails.packagingType}
              onChangeText={(val) => handleFieldChange('packagingType', val)}
            />
          </View>
        )}

        {/* 7. Repacker / Relabeller */}
        {['repacker', 'relabeller'].includes(kob) && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>📦 Original Manufacturer Details</Text>

            <FormField
              label="Original Manufacturer Legal Name"
              required
              placeholder="e.g. Prime Foods Manufacturing Pvt Ltd"
              value={specificDetails.manufacturerName}
              onChangeText={(val) => handleFieldChange('manufacturerName', val)}
              error={errors.manufacturerName}
            />

            <FormField
              label="Original Manufacturer 14-Digit FSSAI License"
              placeholder="e.g. 10022011000123"
              keyboardType="number-pad"
              maxLength={14}
              value={specificDetails.manufacturerFSSAI}
              onChangeText={(val) => handleFieldChange('manufacturerFSSAI', val)}
              error={errors.manufacturerFSSAI}
              hint="Must be a valid 14-digit FSSAI license"
            />
          </View>
        )}

        {/* 8. Transporter */}
        {kob === 'transporter' && (
          <View style={styles.formCard}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.cardHeaderTitle}>🚛 Food Transport Vehicles</Text>
              <TouchableOpacity style={styles.addBtnSmall} onPress={addVehicle}>
                <Text style={styles.addBtnSmallText}>+ Add Vehicle</Text>
              </TouchableOpacity>
            </View>

            {errors.vehicles && <Text style={styles.errorInline}>{errors.vehicles}</Text>}

            {(specificDetails.vehicles || []).map((v, idx) => (
              <View key={`v-${idx}`} style={styles.itemBlock}>
                <View style={styles.blockTitleRow}>
                  <Text style={styles.blockTitle}>Vehicle #{idx + 1}</Text>
                  {(specificDetails.vehicles || []).length > 1 && (
                    <TouchableOpacity onPress={() => removeVehicle(idx)}>
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <FormField
                  label="Vehicle Registration Number"
                  required
                  placeholder="e.g. DL01AB1234"
                  autoCapitalize="characters"
                  value={v.vehicleNumber}
                  onChangeText={(val) => updateVehicle(idx, { vehicleNumber: val.toUpperCase() })}
                  error={errors[`vehicle_${idx}_no`]}
                />

                <View style={styles.rowTwo}>
                  <View style={styles.colTwo}>
                    <SelectField
                      label="Vehicle Type"
                      options={[
                        { id: 'Insulated Van', label: 'Insulated Van' },
                        { id: 'Refrigerated Truck', label: 'Refrigerated / Reefer Truck' },
                        { id: 'Closed Container', label: 'Closed Container Truck' },
                        { id: 'Milk Tanker', label: 'Stainless Steel Milk Tanker' },
                        { id: 'Two-Wheeler Box', label: 'Two-Wheeler Delivery Box' },
                      ]}
                      value={v.vehicleType}
                      onValueChange={(val) => updateVehicle(idx, { vehicleType: val })}
                    />
                  </View>
                  <View style={styles.colTwo}>
                    <FormField
                      label="Capacity"
                      placeholder="e.g. 3 Ton"
                      value={v.capacity}
                      onChangeText={(val) => updateVehicle(idx, { capacity: val })}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 9. Importer / Exporter */}
        {['importer', 'exporter'].includes(kob) && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>🚢 Foreign Trade & DGFT Details</Text>

            <FormField
              label="DGFT Import Export Code (IEC)"
              required
              placeholder="e.g. 0512345678"
              autoCapitalize="characters"
              maxLength={10}
              value={specificDetails.iecCode}
              onChangeText={(val) => handleFieldChange('iecCode', formatIEC(val))}
              error={errors.iecCode}
              hint="10-digit alphanumeric code issued by Directorate General of Foreign Trade"
            />

            {kob === 'importer' ? (
              <FormField
                label="Country of Origin / Sourcing Nations"
                placeholder="e.g. Italy, USA, Spain, Vietnam"
                value={specificDetails.importCountries}
                onChangeText={(val) => handleFieldChange('importCountries', val)}
              />
            ) : (
              <FormField
                label="Target Export Countries"
                placeholder="e.g. UAE, Saudi Arabia, UK, Canada"
                value={specificDetails.exportCountries}
                onChangeText={(val) => handleFieldChange('exportCountries', val)}
              />
            )}
          </View>
        )}

        {/* 10. E-commerce */}
        {kob === 'ecommerce' && (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>🌐 E-commerce Portal & Storage</Text>

            <FormField
              label="Website / App URL"
              placeholder="https://myonlinegrocery.com"
              keyboardType="url"
              autoCapitalize="none"
              value={specificDetails.websitePlatform}
              onChangeText={(val) => handleFieldChange('websitePlatform', val)}
            />

            <FormField
              label="Marketplaces Listed On"
              placeholder="e.g. Amazon, Flipkart, Blinkit, Swiggy Instamart"
              value={specificDetails.marketplaceName}
              onChangeText={(val) => handleFieldChange('marketplaceName', val)}
            />

            <FormField
              label="Central Warehouse / Fulfillment Address"
              placeholder="Warehouse address if different from main premises"
              value={specificDetails.warehouseAddress}
              onChangeText={(val) => handleFieldChange('warehouseAddress', val)}
            />
          </View>
        )}

        {/* 11. Quality, FSMS & Municipal Clearances */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>🛡️ Safety & Quality Declarations</Text>

          <ToggleField
            label="Is Potable Water Test Report available for this unit?"
            value={specificDetails.isWaterTestRequired}
            onValueChange={(val) => handleFieldChange('isWaterTestRequired', val)}
            hint="Mandatory for manufacturing, water and dairy processing units"
          />

          <ToggleField
            label="Do you have an FSMS (HACCP / ISO 22000) certificate/plan?"
            value={specificDetails.hasFSMS}
            onValueChange={(val) => handleFieldChange('hasFSMS', val)}
          />

          <ToggleField
            label="Is a local Municipal Health / Trade NOC applicable?"
            value={specificDetails.hasMunicipalNOC}
            onValueChange={(val) => handleFieldChange('hasMunicipalNOC', val)}
          />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  addBtnSmall: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  addBtnSmallText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  colTwo: {
    flex: 1,
  },
  itemBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  errorInline: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: 8,
    fontWeight: '600',
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
