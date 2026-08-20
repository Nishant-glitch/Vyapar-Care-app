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
import { FormField, ToggleField } from '../../components/FormField';
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import { validateTMAgent } from '../../utils/tmValidation';

export default function TMAgentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, updateAgentDetails, errors, setErrors } = useTMForm();

  const { agentDetails = {} } = formState;
  const isAgent = agentDetails.isFiledThroughAgent ?? true;

  const handleFieldChange = (field, value) => {
    updateAgentDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleContinue = () => {
    const errs = validateTMAgent(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('TMReview');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={7}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Agent / Attorney Authorization</Text>
          <Text style={styles.screenSubheading}>
            Trade Marks Rules require a valid Power of Attorney (Form TM-48) when an application is prosecuted through a registered Trademark Attorney or Agent.
          </Text>
        </View>

        {/* Toggle Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚖️ Legal Representation (Form TM-48)</Text>

          <ToggleField
            label="Will the application be filed through a Trademark Agent / Attorney?"
            value={isAgent}
            onValueChange={(val) => handleFieldChange('isFiledThroughAgent', val)}
          />

          {isAgent ? (
            <View style={styles.agentInfoBanner}>
              <Text style={styles.agentInfoTitle}>
                ✓ VyaparCare Legal Representation Included
              </Text>
              <Text style={styles.agentInfoText}>
                Our qualified IP India registered Trademark Attorneys will represent your application, prepare Form TM-48, track examination notices, and handle preliminary objections.
              </Text>
            </View>
          ) : (
            <View style={styles.directFilingBanner}>
              <Text style={styles.directFilingTitle}>
                Direct Self-Filing by Applicant
              </Text>
              <Text style={styles.directFilingText}>
                The applicant will receive all official notices and examination reports directly on their registered correspondence address and email.
              </Text>
            </View>
          )}
        </View>

        {/* Agent Details (Editable if Agent is chosen) */}
        {isAgent && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>👨‍⚖️ Registered Attorney / Agent Details</Text>

            <FormField
              label="Agent / Attorney Legal Name"
              placeholder="e.g. VyaparCare Legal Operations"
              value={agentDetails.agentName}
              onChangeText={(v) => handleFieldChange('agentName', v)}
              error={errors.agentName}
              required
            />

            <FormField
              label="Agent Registration Number (IP India)"
              placeholder="e.g. IN/PA/2026/001"
              value={agentDetails.agentRegNumber}
              onChangeText={(v) => handleFieldChange('agentRegNumber', v)}
            />

            <FormField
              label="Agent Official Address"
              placeholder="e.g. Legal Operations Hub, Barakhamba Road, New Delhi"
              value={agentDetails.agentAddress}
              onChangeText={(v) => handleFieldChange('agentAddress', v)}
            />

            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <FormField
                  label="Agent Mobile"
                  placeholder="9876543210"
                  value={agentDetails.agentMobile}
                  onChangeText={(v) => handleFieldChange('agentMobile', v)}
                  error={errors.agentMobile}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.col}>
                <FormField
                  label="Agent Email"
                  placeholder="ipr@vyaparcare.com"
                  value={agentDetails.agentEmail}
                  onChangeText={(v) => handleFieldChange('agentEmail', v)}
                  error={errors.agentEmail}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.tm48NoteBox}>
              <Text style={styles.tm48NoteText}>
                📜 <Text style={{ fontWeight: 'bold' }}>Form TM-48:</Text> The Power of Attorney document uploaded in Step 6 authorizes the attorney named above to act on your behalf before the Trade Marks Registry.
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
            <Text style={styles.continueBtnText}>REVIEW APPLICATION →</Text>
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
    marginBottom: 12,
  },
  agentInfoBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  agentInfoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  agentInfoText: {
    fontSize: 12,
    color: '#14532D',
    lineHeight: 17,
  },
  directFilingBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  directFilingTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  directFilingText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  tm48NoteBox: {
    backgroundColor: '#FAF5E8',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  tm48NoteText: {
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
