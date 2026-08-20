import React from 'react';
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
import ScreenHeader from '../../components/ScreenHeader';
import TMStepper from '../../components/TMStepper';
import { FormField } from '../../components/FormField';
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import { validateTMUsage } from '../../utils/tmValidation';

export default function TMUsageScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, updateUsageDetails, errors, setErrors } = useTMForm();

  const { usageDetails = {} } = formState;
  const currentStatus = usageDetails.usageStatus || 'proposed';

  const handleStatusChange = (status) => {
    updateUsageDetails({ usageStatus: status });
    if (errors.usageStatus) {
      setErrors((prev) => ({ ...prev, usageStatus: null }));
    }
  };

  const handleFieldChange = (field, value) => {
    updateUsageDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateTMUsage(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('TMDocuments');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={5}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Usage Status & Prior Use Claim</Text>
          <Text style={styles.screenSubheading}>
            Specify whether the brand is already being used in commerce or is proposed to be used in the future.
          </Text>
        </View>

        {/* Usage Options Cards */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              currentStatus === 'proposed' && styles.optionCardSelected,
            ]}
            onPress={() => handleStatusChange('proposed')}
            activeOpacity={0.7}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionIcon}>🚀</Text>
              <View
                style={[
                  styles.radioCircle,
                  currentStatus === 'proposed' && styles.radioCircleSelected,
                ]}
              >
                {currentStatus === 'proposed' ? (
                  <View style={styles.radioDot} />
                ) : null}
              </View>
            </View>
            <Text
              style={[
                styles.optionTitle,
                currentStatus === 'proposed' && styles.optionTitleSelected,
              ]}
            >
              Proposed to be Used
            </Text>
            <Text style={styles.optionDesc}>
              New brand or upcoming product/service. No prior sales bills or affidavit required.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              currentStatus === 'used' && styles.optionCardSelected,
            ]}
            onPress={() => handleStatusChange('used')}
            activeOpacity={0.7}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionIcon}>📅</Text>
              <View
                style={[
                  styles.radioCircle,
                  currentStatus === 'used' && styles.radioCircleSelected,
                ]}
              >
                {currentStatus === 'used' ? (
                  <View style={styles.radioDot} />
                ) : null}
              </View>
            </View>
            <Text
              style={[
                styles.optionTitle,
                currentStatus === 'used' && styles.optionTitleSelected,
              ]}
            >
              Already in Use (Prior Use)
            </Text>
            <Text style={styles.optionDesc}>
              You have been commercially using the mark prior to today. Requires User Affidavit & earliest invoices.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Banner when Proposed to be used */}
        {currentStatus === 'proposed' && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>ℹ️</Text>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Proposed to be Used Basis</Text>
              <Text style={styles.infoBannerText}>
                Your application will be filed on a 'Proposed to be Used' basis under Section 18(1) of the Trade Marks Act, 1999. No user affidavit or historical invoices are needed.
              </Text>
            </View>
          </View>
        )}

        {/* Prior Use Claim Details when Already in Use */}
        {currentStatus === 'used' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📅 First Commercial Use Details</Text>
            <Text style={styles.helperText}>
              Official IP India rules require clear declaration of the continuous usage date along with supporting commercial evidence.
            </Text>

            <FormField
              label="Date of First Use (DD/MM/YYYY)"
              placeholder="01/01/2023"
              value={usageDetails.firstUseDate}
              onChangeText={(v) => handleFieldChange('firstUseDate', v)}
              error={errors.firstUseDate}
              required
              helpText="Must match or precede the date on your earliest sales invoice / bill"
            />

            <FormField
              label="Place / Territory of First Use"
              placeholder="e.g. New Delhi / All India"
              value={usageDetails.firstUsePlace}
              onChangeText={(v) => handleFieldChange('firstUsePlace', v)}
              error={errors.firstUsePlace}
              required
            />

            <FormField
              label="Goods / Services Used with Trademark"
              placeholder="e.g. Readymade garments, retail sales and digital branding"
              value={usageDetails.goodsServicesUsed}
              onChangeText={(v) => handleFieldChange('goodsServicesUsed', v)}
              error={errors.goodsServicesUsed}
              required
            />

            <FormField
              label="Nature of Continuous Use"
              placeholder="e.g. Continuous commercial sales across online marketplaces and physical stores"
              value={usageDetails.natureOfUse}
              onChangeText={(v) => handleFieldChange('natureOfUse', v)}
            />

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ <Text style={{ fontWeight: 'bold' }}>Prior Use Evidence Requirement:</Text> In Step 6 (Supporting Documents), you will need to upload a notarized User Affidavit and earliest invoice copies demonstrating use of the trademark since {usageDetails.firstUseDate || 'the claimed date'}.
              </Text>
            </View>
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
            <Text style={styles.continueBtnText}>SUPPORTING DOCS →</Text>
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
  optionsRow: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E8EC',
  },
  optionCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 24,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.gold,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#8A6805',
  },
  optionDesc: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 17,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  infoBannerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 17,
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
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 17,
    marginBottom: 14,
  },
  warningBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  warningText: {
    fontSize: 12,
    color: '#785D00',
    lineHeight: 17,
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
