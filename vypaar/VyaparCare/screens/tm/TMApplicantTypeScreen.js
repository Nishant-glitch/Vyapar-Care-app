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
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import { TM_APPLICANT_TYPES } from '../../config/trademarkConfig';
import { validateTMApplicantType } from '../../utils/tmValidation';

export default function TMApplicantTypeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, updateApplicantType, errors, setErrors } = useTMForm();

  const selectedType = formState.applicantType;
  const isStartupClaimed = formState.isStartupClaimed;
  const isMSMEClaimed = formState.isMSMEClaimed;

  const handleSelectType = (typeId) => {
    const isStartup = typeId === 'startup';
    const isMSME = typeId === 'small_enterprise';
    updateApplicantType(typeId, isStartup, isMSME);
    if (errors.applicantType) {
      setErrors((prev) => ({ ...prev, applicantType: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateTMApplicantType(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('TMApplicantDetails');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={1}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Who is applying for the trademark?</Text>
          <Text style={styles.screenSubheading}>
            Select the applicant category under Form TM-A. Official government filing fees and required identity documents dynamically adjust based on this selection.
          </Text>
        </View>

        {errors.applicantType ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.applicantType}</Text>
          </View>
        ) : null}

        {/* 15 Applicant Types Grid */}
        <View style={styles.typesGrid}>
          {TM_APPLICANT_TYPES.map((item) => {
            const isSelected = selectedType === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                onPress={() => handleSelectType(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected && styles.iconCircleSelected,
                    ]}
                  >
                    <Text style={styles.typeIcon}>{item.icon}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </View>

                <Text
                  style={[
                    styles.typeLabel,
                    isSelected && styles.typeLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>

                <Text style={styles.typeDesc}>{item.description}</Text>

                <View style={styles.feeBadge}>
                  <Text style={styles.feeBadgeText}>
                    Govt Fee: ₹{item.baseFee.toLocaleString('en-IN')}/class
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Startup / Small Enterprise Concession Section (if not already selected as primary type) */}
        {!['startup', 'small_enterprise', 'individual', 'proprietorship', 'huf'].includes(selectedType) ? (
          <View style={styles.concessionSection}>
            <Text style={styles.concessionTitle}>
              Claim Startup / Small Enterprise 50% Govt Fee Concession?
            </Text>
            <Text style={styles.concessionSub}>
              If your entity holds a valid DPIIT Certificate or Udyam Registration, you are eligible for the concession rate (₹4,500 instead of ₹9,000 per class).
            </Text>

            <View style={styles.concessionOptionsRow}>
              <Pressable
                style={[
                  styles.concessionCheckbox,
                  isStartupClaimed && styles.concessionCheckboxActive,
                ]}
                onPress={() =>
                  updateApplicantType(selectedType, !isStartupClaimed, isMSMEClaimed)
                }
              >
                <Text style={styles.concessionCheckIcon}>
                  {isStartupClaimed ? '☑' : '☐'}
                </Text>
                <Text style={styles.concessionCheckLabel}>
                  DPIIT Recognized Startup (₹4,500/class)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.concessionCheckbox,
                  isMSMEClaimed && styles.concessionCheckboxActive,
                ]}
                onPress={() =>
                  updateApplicantType(selectedType, isStartupClaimed, !isMSMEClaimed)
                }
              >
                <Text style={styles.concessionCheckIcon}>
                  {isMSMEClaimed ? '☑' : '☐'}
                </Text>
                <Text style={styles.concessionCheckLabel}>
                  MSME / Udyam Registered Enterprise (₹4,500/class)
                </Text>
              </Pressable>
            </View>

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                ⚠️ <Text style={{ fontWeight: 'bold' }}>Note:</Text> Eligibility for Startup/Small Enterprise fee category is subject to applicable Trade Marks Rules and supporting certification must be submitted in Step 6.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Fixed Footer CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>CONTINUE TO APPLICANT DETAILS →</Text>
        </Pressable>
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
  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderColor: '#E74C3C',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#C0392B',
    fontSize: 13,
    fontWeight: '500',
  },
  typesGrid: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E8EC',
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
  typeCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: '#FFF0D4',
  },
  typeIcon: {
    fontSize: 18,
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
  typeLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  typeLabelSelected: {
    color: '#8A6805',
  },
  typeDesc: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 17,
    marginBottom: 10,
  },
  feeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F5FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  feeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  concessionSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  concessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  concessionSub: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 17,
    marginBottom: 12,
  },
  concessionOptionsRow: {
    gap: 10,
  },
  concessionCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFBFD',
  },
  concessionCheckboxActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  concessionCheckIcon: {
    fontSize: 18,
    marginRight: 10,
    color: COLORS.gold,
  },
  concessionCheckLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1,
  },
  disclaimerBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  disclaimerText: {
    fontSize: 11.5,
    color: '#665100',
    lineHeight: 16,
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
  continueBtn: {
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
    letterSpacing: 0.5,
  },
});
