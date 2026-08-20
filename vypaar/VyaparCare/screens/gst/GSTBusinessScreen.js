import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField, {
  CheckboxField,
  DateField,
  MultiSelectField,
  SelectField,
  ToggleField,
} from '../../components/FormField';
import GSTStepper from '../../components/GSTStepper';
import ScreenHeader from '../../components/ScreenHeader';
import {
  BUSINESS_ACTIVITIES,
  TURNOVER_OPTIONS,
  getActivity,
  getAdditionalFields,
  getBusinessType,
} from '../../config/gstDocumentConfig';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';
import {
  digitsOnly,
  formatGSTIN,
  formatPAN,
  hasErrors,
  validateAadhaar,
  validateBusiness,
  validateGSTIN,
  validatePAN,
} from '../../utils/gstValidation';
import { pickPhoto } from '../../utils/pickFile';

/**
 * Step 1 — business details.
 *
 * Outer container FlatList hai (ScrollView nahi) kyunki partner/director cards
 * isi list ke items hain — nested VirtualizedList warning se bachne ke liye
 * baaki poora form `ListHeaderComponent` me jaata hai.
 */
export default function GSTBusinessScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateField,
    updateAdditionalField,
    partnerConfig,
    addMember,
    removeMember,
    updateMember,
    setMemberCount,
    errors,
    setErrors,
    goNext,
  } = useGSTForm();

  const business = formData.business;
  const businessType = getBusinessType(formData.businessType);
  const [submitted, setSubmitted] = useState(false);

  const additionalFieldDefs = getAdditionalFields(business.mainActivity);
  const members = business.members;

  const set = (key) => (value) => updateField('business', key, value);
  const errorFor = (key) => (submitted ? errors[key] : undefined);

  const toggleNature = (activityId) => {
    const current = business.natureOfBusiness;
    const next = current.includes(activityId)
      ? current.filter((id) => id !== activityId)
      : [...current, activityId];
    updateField('business', 'natureOfBusiness', next);
  };

  const handlePickPhoto = async (index) => {
    try {
      const photo = await pickPhoto(`${partnerConfig?.singular || 'member'}-${index + 1}`);
      if (!photo) return; // cancel
      updateMember(index, 'photo', photo);
      console.log(`Photo picked for member ${index + 1}: ${photo.name}`);
    } catch (err) {
      console.log('Photo pick failed:', err.message);
      Alert.alert('Could not pick photo', err.message);
    }
  };

  const handleNext = () => {
    const found = validateBusiness(
      { ...business, __additionalFieldDefs: additionalFieldDefs },
      partnerConfig
    );
    setErrors(found);
    setSubmitted(true);

    if (hasErrors(found)) {
      console.log('Business validation failed:', Object.keys(found).join(', '));
      return;
    }

    const next = goNext();
    if (!next.implemented) {
      // Address / Bank / Documents / Review screens Part 2 me aayenge
      console.log(`Next step "${next.key}" abhi banaya nahi gaya`);
      Alert.alert('Coming soon', `${next.label} step abhi taiyaar nahi hai.`);
      return;
    }
    navigation.navigate(next.route);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="GST Registration" />
      <GSTStepper activeStep={1} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          data={partnerConfig ? members : []}
          keyExtractor={(_, index) => `member-${index}`}
          renderItem={({ item, index }) => (
            <MemberCard
              member={item}
              index={index}
              config={partnerConfig}
              errors={submitted ? errors : {}}
              onChange={updateMember}
              onPickPhoto={handlePickPhoto}
              onRemove={removeMember}
              canRemove={members.length > partnerConfig.min}
            />
          )}
          ListHeaderComponent={
            <BusinessFormHeader
              business={business}
              businessType={businessType}
              additionalFieldDefs={additionalFieldDefs}
              partnerConfig={partnerConfig}
              memberCount={members.length}
              errorFor={errorFor}
              set={set}
              onToggleNature={toggleNature}
              onAdditionalChange={updateAdditionalField}
              onMemberCountChange={setMemberCount}
            />
          }
          ListFooterComponent={
            <BusinessFormFooter
              partnerConfig={partnerConfig}
              memberCount={members.length}
              onAdd={addMember}
              errors={errors}
              submitted={submitted}
            />
          }
        />
      </KeyboardAvoidingView>

      {/* ---------- fixed footer ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>NEXT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ======================= form (list header) ======================= */

/**
 * Module level pe define kiya hua hai — inline arrow function dete to har
 * keystroke pe header remount hota aur TextInput ka focus chhoot jaata.
 */
function BusinessFormHeader({
  business,
  businessType,
  additionalFieldDefs,
  partnerConfig,
  memberCount,
  errorFor,
  set,
  onToggleNature,
  onAdditionalChange,
  onMemberCountChange,
}) {
  const activity = getActivity(business.mainActivity);

  return (
    <View>
      <Text style={styles.sectionTitle}>Business Details</Text>
      <Text style={styles.sectionHint}>
        Ye details GST certificate pe chhapti hain — dhyan se bhariye.
      </Text>

      <FormField
        label="Business / Trade Name"
        required
        value={business.tradeName}
        onChangeText={set('tradeName')}
        error={errorFor('tradeName')}
        valid={business.tradeName.trim().length > 2}
        placeholder="Jis naam se business chalta hai"
        autoCapitalize="words"
      />

      <FormField
        label="Legal Name"
        required
        value={business.legalName}
        onChangeText={set('legalName')}
        error={errorFor('legalName')}
        valid={business.legalName.trim().length > 2}
        placeholder="PAN card jaisa legal naam"
        autoCapitalize="words"
      />

      <FormField
        label="Business Type"
        value={businessType?.label || ''}
        onChangeText={() => {}}
        editable={false}
        hint="Pichli screen pe chuna gaya — badalne ke liye peeche jaaiye"
      />

      <DateField
        label="Date of Business Commencement"
        required
        value={business.commencementDate}
        onChange={set('commencementDate')}
        error={errorFor('commencementDate')}
        minYear={1950}
      />

      <MultiSelectField
        label="Nature of Business"
        required
        options={BUSINESS_ACTIVITIES}
        values={business.natureOfBusiness}
        onToggle={onToggleNature}
        error={errorFor('natureOfBusiness')}
        hint="Ek se zyada chun sakte hain"
      />

      <SelectField
        label="Main Business Activity"
        required
        value={business.mainActivity}
        options={BUSINESS_ACTIVITIES}
        onSelect={set('mainActivity')}
        error={errorFor('mainActivity')}
        placeholder="Main activity chuniye"
      />

      <FormField
        label="Product / Service Description"
        value={business.description}
        onChangeText={set('description')}
        placeholder="Aap kya bechte / provide karte hain"
        multiline
      />

      <FormField
        label="HSN / SAC Code"
        value={business.hsnSac}
        onChangeText={set('hsnSac')}
        placeholder="e.g. 8471 ya 998314"
        keyboardType="numbers-and-punctuation"
      />

      <SelectField
        label="Expected Annual Turnover"
        required
        value={business.turnover}
        options={TURNOVER_OPTIONS}
        onSelect={set('turnover')}
        error={errorFor('turnover')}
        placeholder="Turnover range chuniye"
      />

      <ToggleField
        label="Existing GSTIN?"
        value={business.hasGSTIN}
        onValueChange={set('hasGSTIN')}
        hint="Agar pehle se koi GST number hai to Yes chuniye"
      />

      {business.hasGSTIN ? (
        <FormField
          label="Existing GSTIN"
          required
          value={business.gstin}
          onChangeText={set('gstin')}
          error={errorFor('gstin')}
          valid={validateGSTIN(business.gstin)}
          placeholder="22ABCDE1234F1Z5"
          autoCapitalize="characters"
          maxLength={15}
          format={formatGSTIN}
          hint="15 character ka GST number"
        />
      ) : null}

      {/* ---------- activity ke hisaab se dynamic fields ---------- */}
      {additionalFieldDefs.length > 0 ? (
        <View style={styles.dynamicBlock}>
          <Text style={styles.blockTitle}>
            {activity?.icon} {activity?.label} — Extra Details
          </Text>

          {additionalFieldDefs.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={business.additionalFields[field.key]}
              onChange={onAdditionalChange}
              error={errorFor(`additional.${field.key}`)}
            />
          ))}
        </View>
      ) : null}

      {/* ---------- partners / directors / trustees ---------- */}
      {partnerConfig ? (
        <View style={styles.memberIntro}>
          <Text style={styles.blockTitle}>{partnerConfig.label}</Text>

          <FormField
            label={partnerConfig.countLabel}
            required
            value={String(memberCount || '')}
            onChangeText={(text) => {
              const n = parseInt(digitsOnly(text, 2), 10);
              onMemberCountChange(Number.isNaN(n) ? 0 : Math.min(n, partnerConfig.max));
            }}
            keyboardType="number-pad"
            maxLength={2}
            placeholder={`${partnerConfig.min} se ${partnerConfig.max} ke beech`}
            hint={`Kam se kam ${partnerConfig.min}, zyada se zyada ${partnerConfig.max}`}
          />
        </View>
      ) : null}
    </View>
  );
}

/* ======================= dynamic activity field ======================= */

function DynamicField({ field, value, onChange, error }) {
  const handle = (next) => onChange(field.key, next);

  if (field.type === 'select') {
    return (
      <SelectField
        label={field.label}
        required={field.required}
        value={value || ''}
        options={field.options || []}
        onSelect={handle}
        error={error}
        placeholder={field.placeholder || 'Select'}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <ToggleField
        label={field.label}
        required={field.required}
        value={value}
        onValueChange={handle}
        error={error}
      />
    );
  }

  return (
    <FormField
      label={field.label}
      required={field.required}
      value={value || ''}
      onChangeText={handle}
      error={error}
      placeholder={field.placeholder}
      keyboardType={field.keyboardType || 'default'}
      multiline={field.type === 'textarea'}
      autoCapitalize={field.keyboardType === 'url' ? 'none' : 'sentences'}
    />
  );
}

/* ============================ member card ============================ */

function MemberCard({
  member,
  index,
  config,
  errors,
  onChange,
  onPickPhoto,
  onRemove,
  canRemove,
}) {
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <Text style={styles.memberTitle}>
          {config.singular} {index + 1}
        </Text>

        {canRemove ? (
          <Pressable onPress={() => onRemove(index)} hitSlop={10}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>

      <FormField
        label="Name"
        required
        value={member.name}
        onChangeText={(text) => onChange(index, 'name', text)}
        error={errors[`member.${index}.name`]}
        valid={member.name.trim().length > 2}
        placeholder="Poora naam"
        autoCapitalize="words"
      />

      <FormField
        label="PAN Number"
        required
        value={member.pan}
        onChangeText={(text) => onChange(index, 'pan', text)}
        error={errors[`member.${index}.pan`]}
        valid={validatePAN(member.pan)}
        placeholder="ABCDE1234F"
        autoCapitalize="characters"
        maxLength={10}
        format={formatPAN}
      />

      <FormField
        label="Aadhaar Number"
        required
        value={member.aadhaar}
        onChangeText={(text) => onChange(index, 'aadhaar', text)}
        error={errors[`member.${index}.aadhaar`]}
        valid={validateAadhaar(member.aadhaar)}
        placeholder="12 digit Aadhaar"
        keyboardType="number-pad"
        maxLength={12}
        format={(text) => digitsOnly(text, 12)}
      />

      {/* photo upload */}
      <Pressable
        style={({ pressed }) => [styles.photoRow, pressed && styles.pressed]}
        onPress={() => onPickPhoto(index)}
      >
        <View style={[styles.photoIcon, member.photo && styles.photoIconDone]}>
          <Text style={styles.photoIconText}>{member.photo ? '✓' : '📷'}</Text>
        </View>

        <View style={styles.photoTextWrap}>
          <Text style={styles.photoLabel}>Photograph</Text>
          <Text
            style={[styles.photoStatus, member.photo && styles.photoStatusDone]}
            numberOfLines={1}
          >
            {member.photo ? member.photo.name : 'Tap to upload'}
          </Text>
        </View>
      </Pressable>

      {config.hasAuthorizedSignatory ? (
        <CheckboxField
          label="Authorised Signatory"
          value={member.isAuthorizedSignatory}
          onValueChange={(next) => onChange(index, 'isAuthorizedSignatory', next)}
        />
      ) : null}
    </View>
  );
}

/* ============================ list footer ============================ */

function BusinessFormFooter({ partnerConfig, memberCount, onAdd, errors, submitted }) {
  const errorKeys = Object.keys(errors || {});

  return (
    <View>
      {partnerConfig && memberCount < partnerConfig.max ? (
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={onAdd}
        >
          <Text style={styles.addButtonText}>+ Add {partnerConfig.singular}</Text>
        </Pressable>
      ) : null}

      {submitted && errorKeys.length > 0 ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            {errorKeys.length} field theek karne hain.
          </Text>
          {errors.members ? (
            <Text style={styles.errorBannerSub}>{errors.members}</Text>
          ) : null}
          {errors.authorizedSignatory ? (
            <Text style={styles.errorBannerSub}>{errors.authorizedSignatory}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  pressed: {
    opacity: 0.85,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 18,
  },

  blockTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  dynamicBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  memberIntro: {
    marginTop: 4,
  },

  /* member cards */
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
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
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },

  /* photo */
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  photoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  photoIconDone: {
    backgroundColor: '#E8F5E9',
  },
  photoIconText: {
    fontSize: 16,
  },
  photoTextWrap: {
    flex: 1,
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  photoStatus: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  photoStatusDone: {
    color: COLORS.whatsapp,
  },

  /* add */
  addButton: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },

  errorBanner: {
    backgroundColor: '#FDECEA',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  errorBannerText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '600',
  },
  errorBannerSub: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },

  /* footer */
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
