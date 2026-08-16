import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField, { DateField, SelectField, ToggleField } from '../../components/FormField';
import PLCStepper from '../../components/PLCStepper';
import ScreenHeader from '../../components/ScreenHeader';
import { INDIAN_STATES } from '../../constants/indianStates';
import { COLORS } from '../../constants/theme';
import { usePLCForm } from '../../contexts/PLCFormContext';
import {
  digitsOnly,
  formatDIN,
  formatPAN,
  hasErrors,
  maskAadhaar,
  validateDirectors,
  validateSubscribers,
} from '../../utils/plcValidation';

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'transgender', label: 'Transgender / Other' },
];

const NATIONALITY_OPTIONS = [
  { id: 'Indian', label: 'Indian Citizen' },
  { id: 'Foreign', label: 'Foreign National / NRI' },
];

export default function PLCDirectorsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateDirector,
    updateSubscriber,
    linkSubscriberToDirector,
    unlinkSubscriberFromDirector,
    errors,
    setErrors,
    goNext,
    goPrev,
  } = usePLCForm();

  const { directors, subscribers, company } = formData;

  const handleNext = () => {
    const dirErrors = validateDirectors(directors, company.directorCount);
    const subErrors = validateSubscribers(subscribers, company.subscriberCount);
    const combined = { ...dirErrors, ...subErrors };

    if (hasErrors(combined)) {
      setErrors(combined);
      return;
    }

    setErrors({});
    goNext();
    navigation.navigate('PLCOffice');
  };

  const handleBack = () => {
    goPrev();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Company Registration" onBack={handleBack} />

      {/* ---------- 7-Step Stepper ---------- */}
      <PLCStepper activeStep={2} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={styles.sectionTitle}>Step 3: Directors & Subscribers</Text>
            <Text style={styles.sectionSubtitle}>
              Enter KYC details, DIN status, and shareholding for all proposed directors and shareholders.
            </Text>
          </View>

          {/* ================================================================= */}
          {/* 1. DIRECTORS SECTION */}
          {/* ================================================================= */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.groupHeading}>
              Proposed Directors ({directors.length})
            </Text>
            <Text style={styles.groupSub}>
              DIN application for up to 2 directors is included in your package.
            </Text>
          </View>

          {directors.map((director, index) => {
            const prefix = `director_${index}`;
            const dirNumber = index + 1;

            return (
              <View key={director.id || index} style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <View style={styles.dirIconBadge}>
                    <Text style={styles.dirIconText}>👤</Text>
                  </View>
                  <View style={styles.cardTitleTextWrap}>
                    <Text style={styles.cardHeading}>Director {dirNumber}</Text>
                    <Text style={styles.cardSub}>
                      {director.fullName || 'Enter Director details below'}
                    </Text>
                  </View>
                  <View style={styles.indexBadge}>
                    <Text style={styles.indexBadgeText}>#{dirNumber}</Text>
                  </View>
                </View>

                {/* Personal KYC */}
                <FormField
                  label="Full Name (as per PAN / Passport)"
                  required
                  value={director.fullName}
                  onChangeText={(t) => updateDirector(index, 'fullName', t)}
                  placeholder="Full Legal Name"
                  autoCapitalize="words"
                  error={errors[`${prefix}_fullName`]}
                />

                <FormField
                  label="Father's / Mother's Name"
                  required
                  value={director.parentName}
                  onChangeText={(t) => updateDirector(index, 'parentName', t)}
                  placeholder="Father's / Mother's Name"
                  autoCapitalize="words"
                  error={errors[`${prefix}_parentName`]}
                />

                <DateField
                  label="Date of Birth"
                  required
                  value={director.dob}
                  onChange={(iso) => updateDirector(index, 'dob', iso)}
                  placeholder="DD/MM/YYYY"
                  error={errors[`${prefix}_dob`]}
                />

                <View style={styles.row}>
                  <View style={styles.halfCol}>
                    <SelectField
                      label="Gender"
                      required
                      value={director.gender}
                      options={GENDER_OPTIONS}
                      onSelect={(val) => updateDirector(index, 'gender', val)}
                      error={errors[`${prefix}_gender`]}
                    />
                  </View>
                  <View style={styles.halfCol}>
                    <SelectField
                      label="Nationality"
                      required
                      value={director.nationality}
                      options={NATIONALITY_OPTIONS}
                      onSelect={(val) => updateDirector(index, 'nationality', val)}
                      error={errors[`${prefix}_nationality`]}
                    />
                  </View>
                </View>

                <FormField
                  label="PAN Number"
                  required
                  value={director.pan}
                  onChangeText={(t) => updateDirector(index, 'pan', t)}
                  format={formatPAN}
                  placeholder="ABCDE1234F"
                  autoCapitalize="characters"
                  maxLength={10}
                  error={errors[`${prefix}_pan`]}
                />

                <FormField
                  label="Aadhaar / National ID / Passport No."
                  required
                  value={director.aadhaar}
                  onChangeText={(t) => updateDirector(index, 'aadhaar', t)}
                  displayValue={director.nationality === 'Indian' ? maskAadhaar(director.aadhaar) : director.aadhaar}
                  placeholder="ID / Aadhaar / Passport Number"
                  error={errors[`${prefix}_aadhaar`]}
                />

                {/* DIN SECTION */}
                <View style={styles.dinBox}>
                  <Text style={styles.dinBoxTitle}>Director Identification Number (DIN)</Text>
                  <ToggleField
                    label="Does this director already have an approved DIN?"
                    value={director.hasDIN}
                    onValueChange={(val) => updateDirector(index, 'hasDIN', val)}
                    yesLabel="Yes, Existing DIN"
                    noLabel="No, Apply for New DIN"
                  />

                  {director.hasDIN ? (
                    <FormField
                      label="Existing 8-digit DIN"
                      required
                      value={director.din}
                      onChangeText={(t) => updateDirector(index, 'din', t)}
                      format={formatDIN}
                      placeholder="e.g. 01234567"
                      keyboardType="number-pad"
                      maxLength={8}
                      error={errors[`${prefix}_din`]}
                      hint="Enter valid 8-digit DIN approved by Ministry of Corporate Affairs."
                    />
                  ) : (
                    <View style={styles.dinNotice}>
                      <Text style={styles.dinNoticeCheck}>✓</Text>
                      <View style={styles.dinNoticeContent}>
                        <Text style={styles.dinNoticeTitle}>DIN Application Included</Text>
                        <Text style={styles.dinNoticeText}>
                          {index < 2
                            ? 'DIN application for up to 2 directors is included in the package through SPICe+ filing.'
                            : 'Additional DIN application will be processed with required government fee (₹500).'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Address */}
                <FormField
                  label="Residential Address"
                  required
                  value={director.address}
                  onChangeText={(t) => updateDirector(index, 'address', t)}
                  placeholder="House/Flat No, Street, Locality"
                  multiline
                  numberOfLines={3}
                  error={errors[`${prefix}_address`]}
                />

                <SelectField
                  label="State / UT"
                  required
                  value={director.state}
                  options={INDIAN_STATES}
                  onSelect={(code) => updateDirector(index, 'state', code)}
                  searchable
                  error={errors[`${prefix}_state`]}
                />

                <View style={styles.row}>
                  <View style={styles.halfCol}>
                    <FormField
                      label="City"
                      required
                      value={director.city}
                      onChangeText={(t) => updateDirector(index, 'city', t)}
                      placeholder="City"
                      error={errors[`${prefix}_city`]}
                    />
                  </View>
                  <View style={styles.halfCol}>
                    <FormField
                      label="District"
                      required
                      value={director.district}
                      onChangeText={(t) => updateDirector(index, 'district', t)}
                      placeholder="District"
                      error={errors[`${prefix}_district`]}
                    />
                  </View>
                </View>

                <FormField
                  label="PIN Code"
                  required
                  value={director.pincode}
                  onChangeText={(t) => updateDirector(index, 'pincode', t)}
                  format={(t) => digitsOnly(t, 6)}
                  placeholder="6-digit PIN"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors[`${prefix}_pincode`]}
                />

                <FormField
                  label="Mobile Number"
                  required
                  value={director.mobile}
                  onChangeText={(t) => updateDirector(index, 'mobile', t)}
                  format={(t) => digitsOnly(t, 10)}
                  placeholder="10-digit mobile"
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={errors[`${prefix}_mobile`]}
                />

                <FormField
                  label="Email Address"
                  required
                  value={director.email}
                  onChangeText={(t) => updateDirector(index, 'email', t)}
                  placeholder="director@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors[`${prefix}_email`]}
                />
              </View>
            );
          })}

          {/* ================================================================= */}
          {/* 2. SUBSCRIBERS / SHAREHOLDERS SECTION */}
          {/* ================================================================= */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.groupHeading}>
              Subscribers / Shareholders ({subscribers.length})
            </Text>
            <Text style={styles.groupSub}>
              Shareholders subscribe to the initial share capital in the Memorandum of Association.
            </Text>
            {errors.totalShareholding ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {errors.totalShareholding}</Text>
              </View>
            ) : null}
          </View>

          {subscribers.map((subscriber, sIndex) => {
            const prefix = `subscriber_${sIndex}`;
            const subNumber = sIndex + 1;

            return (
              <View key={subscriber.id || sIndex} style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <View style={[styles.dirIconBadge, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={styles.dirIconText}>👥</Text>
                  </View>
                  <View style={styles.cardTitleTextWrap}>
                    <Text style={styles.cardHeading}>Subscriber {subNumber}</Text>
                    <Text style={styles.cardSub}>
                      {subscriber.fullName || 'Shareholder details & shareholding'}
                    </Text>
                  </View>
                  <View style={[styles.indexBadge, { backgroundColor: '#FFF8E1' }]}>
                    <Text style={[styles.indexBadgeText, { color: COLORS.gold }]}>#{subNumber}</Text>
                  </View>
                </View>

                {/* DEDUPLICATION QUICK OPTION */}
                <View style={styles.dedupBox}>
                  <Text style={styles.dedupTitle}>Is this Subscriber also a Director?</Text>
                  <Text style={styles.dedupSub}>
                    Select a director to auto-fill details and reuse KYC documents (no duplicate upload required).
                  </Text>

                  <View style={styles.dedupOptionsRow}>
                    <Pressable
                      style={[
                        styles.dedupBtn,
                        !subscriber.isDirector && styles.dedupBtnActive,
                      ]}
                      onPress={() => unlinkSubscriberFromDirector(sIndex)}
                    >
                      <Text
                        style={[
                          styles.dedupBtnText,
                          !subscriber.isDirector && styles.dedupBtnTextActive,
                        ]}
                      >
                        Separate Person
                      </Text>
                    </Pressable>

                    {directors.map((dir, dIdx) => {
                      const isSelected =
                        subscriber.isDirector && subscriber.linkedDirectorIndex === dIdx;
                      return (
                        <Pressable
                          key={`link_dir_${dIdx}`}
                          style={[styles.dedupBtn, isSelected && styles.dedupBtnActive]}
                          onPress={() => linkSubscriberToDirector(sIndex, dIdx)}
                        >
                          <Text
                            style={[
                              styles.dedupBtnText,
                              isSelected && styles.dedupBtnTextActive,
                            ]}
                            numberOfLines={1}
                          >
                            Director {dIdx + 1} ({dir.fullName ? dir.fullName.split(' ')[0] : `#${dIdx + 1}`})
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {subscriber.isDirector ? (
                    <View style={styles.reusedNotice}>
                      <Text style={styles.reusedCheck}>🔗</Text>
                      <Text style={styles.reusedText}>
                        Documents (PAN, ID, Address Proof, Photo) will be automatically reused from Director {subscriber.linkedDirectorIndex + 1}.
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Subscriber fields */}
                <FormField
                  label="Full Name"
                  required
                  value={subscriber.fullName}
                  onChangeText={(t) => updateSubscriber(sIndex, 'fullName', t)}
                  placeholder="Shareholder Full Name"
                  editable={!subscriber.isDirector}
                  error={errors[`${prefix}_fullName`]}
                />

                <FormField
                  label="PAN Number"
                  required
                  value={subscriber.pan}
                  onChangeText={(t) => updateSubscriber(sIndex, 'pan', t)}
                  format={formatPAN}
                  placeholder="ABCDE1234F"
                  autoCapitalize="characters"
                  maxLength={10}
                  editable={!subscriber.isDirector}
                  error={errors[`${prefix}_pan`]}
                />

                <FormField
                  label="Mobile Number"
                  required
                  value={subscriber.mobile}
                  onChangeText={(t) => updateSubscriber(sIndex, 'mobile', t)}
                  format={(t) => digitsOnly(t, 10)}
                  placeholder="10-digit mobile"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!subscriber.isDirector}
                  error={errors[`${prefix}_mobile`]}
                />

                <FormField
                  label="Email Address"
                  required
                  value={subscriber.email}
                  onChangeText={(t) => updateSubscriber(sIndex, 'email', t)}
                  placeholder="shareholder@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!subscriber.isDirector}
                  error={errors[`${prefix}_email`]}
                />

                <View style={styles.row}>
                  <View style={styles.halfCol}>
                    <FormField
                      label="Number of Equity Shares"
                      required
                      value={String(subscriber.sharesCount || '')}
                      onChangeText={(t) => updateSubscriber(sIndex, 'sharesCount', Number(digitsOnly(t)))}
                      placeholder="e.g. 5000"
                      keyboardType="number-pad"
                      error={errors[`${prefix}_sharesCount`]}
                    />
                  </View>
                  <View style={styles.halfCol}>
                    <FormField
                      label="Shareholding (%)"
                      required
                      value={String(subscriber.shareholdingPercent || '')}
                      onChangeText={(t) => updateSubscriber(sIndex, 'shareholdingPercent', Number(digitsOnly(t, 3)))}
                      placeholder="e.g. 50"
                      keyboardType="number-pad"
                      maxLength={3}
                      error={errors[`${prefix}_shareholdingPercent`]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- Sticky Bottom CTA ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.continueText}>CONTINUE TO REGISTERED OFFICE ›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  pressed: {
    opacity: 0.85,
  },
  headerBlock: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 3,
    lineHeight: 18,
  },
  sectionHeaderWrap: {
    marginTop: 10,
    marginBottom: 12,
  },
  groupHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  groupSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dirIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dirIconText: {
    fontSize: 18,
  },
  cardTitleTextWrap: {
    flex: 1,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 1,
  },
  indexBadge: {
    backgroundColor: '#EAECEE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  indexBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  dinBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dinBoxTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  dinNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F8F0',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D4EFDF',
  },
  dinNoticeCheck: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: 'bold',
    marginRight: 8,
  },
  dinNoticeContent: {
    flex: 1,
  },
  dinNoticeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E7E34',
  },
  dinNoticeText: {
    fontSize: 11,
    color: '#27AE60',
    marginTop: 2,
    lineHeight: 16,
  },
  dedupBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEBE4',
  },
  dedupTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  dedupSub: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
    marginBottom: 10,
    lineHeight: 16,
  },
  dedupOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dedupBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  dedupBtnActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.primaryDark,
  },
  dedupBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grayText,
  },
  dedupBtnTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  reusedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
  },
  reusedCheck: {
    fontSize: 14,
    marginRight: 6,
  },
  reusedText: {
    flex: 1,
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FADBD8',
  },
  errorBannerText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
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
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  continueButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
