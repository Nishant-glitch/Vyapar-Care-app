import React from 'react';
import {
  Image,
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
import {
  FormField,
  ToggleField,
} from '../../components/FormField';
import { COLORS } from '../../constants/theme';
import { useTMForm } from '../../contexts/TMFormContext';
import { TM_MARK_TYPES } from '../../config/trademarkConfig';
import { validateTMMarkDetails } from '../../utils/tmValidation';
import { pickDocument, pickImage } from '../../utils/pickFile';

export default function TMMarkDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formState, updateMarkDetails, errors, setErrors } = useTMForm();

  const { markDetails = {} } = formState;
  const currentMarkType = markDetails.markType || 'word';

  const handleFieldChange = (field, value) => {
    updateMarkDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePickLogo = async () => {
    try {
      const file = await pickImage();
      if (file) {
        handleFieldChange('logoFile', file);
      }
    } catch (err) {
      console.warn('Pick logo cancelled/error:', err);
    }
  };

  const handlePickAudio = async () => {
    try {
      const file = await pickDocument();
      if (file) {
        handleFieldChange('soundFile', file);
      }
    } catch (err) {
      console.warn('Pick audio cancelled/error:', err);
    }
  };

  const handleContinue = () => {
    const errs = validateTMMarkDetails(formState);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    navigation.navigate('TMClasses');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader
        title="Trademark Registration"
        onBack={() => navigation.goBack()}
      />

      <TMStepper
        currentStep={3}
        onStepPress={(step, route) => navigation.navigate(route)}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenHeading}>Trademark Details & Representation</Text>
          <Text style={styles.screenSubheading}>
            Specify the type of mark you wish to protect and provide representation details required for IP India examination.
          </Text>
        </View>

        {/* 1. Mark Type Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎯 What do you want to register?</Text>

          <View style={styles.markTypeGrid}>
            {TM_MARK_TYPES.map((type) => {
              const isSelected = currentMarkType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.markTypeCard,
                    isSelected && styles.markTypeCardSelected,
                  ]}
                  onPress={() => handleFieldChange('markType', type.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.markTypeIconCircle}>
                    <Text style={styles.markTypeIcon}>{type.icon}</Text>
                  </View>
                  <View style={styles.markTypeTextWrap}>
                    <Text
                      style={[
                        styles.markTypeLabel,
                        isSelected && styles.markTypeLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text style={styles.markTypeDesc}>{type.description}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Word Mark Specific Fields */}
        {['word', 'word_logo', 'other'].includes(currentMarkType) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🔤 Brand / Trademark Name</Text>

            <FormField
              label="Exact Trademark Name / Brand Name"
              placeholder="e.g. VYAPARCARE"
              value={markDetails.trademarkName}
              onChangeText={(v) => handleFieldChange('trademarkName', v)}
              error={errors.trademarkName}
              required
              autoCapitalize="words"
            />

            <FormField
              label="Exact Spelling / Pronunciation (if phonetic or coined word)"
              placeholder="e.g. V-Y-A-P-A-R-C-A-R-E"
              value={markDetails.exactSpelling}
              onChangeText={(v) => handleFieldChange('exactSpelling', v)}
              helpText="Helps examiner verify distinctive phonetics during search"
            />
          </View>
        )}

        {/* 3. Logo / Artwork Upload Section */}
        {['logo', 'word_logo', 'colour', 'shape_3d'].includes(currentMarkType) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🎨 Trademark Logo / Device Artwork</Text>
            <Text style={styles.helperText}>
              Upload a clear, high-resolution representation of your logo or visual mark.
            </Text>

            {markDetails.logoFile ? (
              <View style={styles.uploadedFileBox}>
                {markDetails.logoFile.uri ? (
                  <Image
                    source={{ uri: markDetails.logoFile.uri }}
                    style={styles.logoPreviewImage}
                    resizeMode="contain"
                  />
                ) : null}
                <View style={styles.fileDetailsRow}>
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {markDetails.logoFile.name || 'Trademark_Logo.png'}
                  </Text>
                  <View style={styles.fileActionButtons}>
                    <TouchableOpacity
                      style={styles.replaceBtn}
                      onPress={handlePickLogo}
                    >
                      <Text style={styles.replaceBtnText}>Replace</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleFieldChange('logoFile', null)}
                    >
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadDottedBox}
                onPress={handlePickLogo}
                activeOpacity={0.7}
              >
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadTitle}>Tap to Upload Logo Image</Text>
                <Text style={styles.uploadSub}>PNG, JPG, JPEG (Max 5MB)</Text>
              </TouchableOpacity>
            )}

            {/* Colour Claim Toggle */}
            <View style={styles.divider} />
            <ToggleField
              label="Is colour being claimed as a distinctive feature?"
              value={markDetails.isColourClaimed}
              onValueChange={(val) => handleFieldChange('isColourClaimed', val)}
            />

            {markDetails.isColourClaimed && (
              <FormField
                label="Colour Combination Description"
                placeholder="e.g. Navy Blue background with Metallic Gold lettering and Leaf icon"
                value={markDetails.colourDescription}
                onChangeText={(v) => handleFieldChange('colourDescription', v)}
                error={errors.colourDescription}
                required
              />
            )}
          </View>
        )}

        {/* 4. Sound Mark Section */}
        {currentMarkType === 'sound' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🎵 Sound Mark Representation</Text>
            <Text style={styles.helperText}>
              Trade Marks Rules require an audio recording (MP3/WAV) and musical stave notation description.
            </Text>

            {markDetails.soundFile ? (
              <View style={styles.uploadedFileBox}>
                <Text style={styles.fileNameText} numberOfLines={1}>
                  🎵 {markDetails.soundFile.name || 'Sound_Mark_Audio.mp3'}
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleFieldChange('soundFile', null)}
                >
                  <Text style={styles.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadDottedBox}
                onPress={handlePickAudio}
                activeOpacity={0.7}
              >
                <Text style={styles.uploadIcon}>🎙️</Text>
                <Text style={styles.uploadTitle}>Upload Audio File (.MP3 / .WAV)</Text>
                <Text style={styles.uploadSub}>Max 30 seconds duration</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 5. Non-English / Non-Hindi Language Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🌐 Language & Translation</Text>

          <ToggleField
            label="Is the trademark in a language other than Hindi or English?"
            value={markDetails.isOtherLanguage}
            onValueChange={(val) => handleFieldChange('isOtherLanguage', val)}
          />

          {markDetails.isOtherLanguage && (
            <>
              <FormField
                label="Language / Script Name"
                placeholder="e.g. Sanskrit, Tamil, French, German"
                value={markDetails.languageName}
                onChangeText={(v) => handleFieldChange('languageName', v)}
                error={errors.languageName}
                required
              />

              <FormField
                label="Transliteration in Roman Script"
                placeholder="e.g. SATYAMEVA JAYATE"
                value={markDetails.transliteration}
                onChangeText={(v) => handleFieldChange('transliteration', v)}
                error={errors.transliteration}
                required
                helpText="Exact Roman character rendering of the foreign script words"
              />

              <FormField
                label="English Translation / Meaning"
                placeholder="e.g. Truth alone triumphs"
                value={markDetails.translation}
                onChangeText={(v) => handleFieldChange('translation', v)}
                error={errors.translation}
                required
              />
            </>
          )}
        </View>

        {/* 6. Mark Description & Disclaimers */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📝 Trademark Description & Meaning</Text>

          <FormField
            label="Description of the Trademark"
            placeholder="e.g. The mark consists of the word 'VYAPARCARE' stylized with an abstract geometric emblem representing growth."
            value={markDetails.description}
            onChangeText={(v) => handleFieldChange('description', v)}
            multiline
            numberOfLines={3}
          />

          <FormField
            label="Meaning / Significance (if coined word or acronym)"
            placeholder="e.g. Coined word derived from Vyapar (Trade) + Care"
            value={markDetails.meaning}
            onChangeText={(v) => handleFieldChange('meaning', v)}
          />

          <FormField
            label="Disclaimer / Limitations (if any)"
            placeholder="e.g. No exclusive right claimed over the generic term 'CARE' separately"
            value={markDetails.disclaimer}
            onChangeText={(v) => handleFieldChange('disclaimer', v)}
            helpText="Optional: Disclaimers help avoid trademark objection during IP India examination"
          />
        </View>
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
            <Text style={styles.continueBtnText}>GOODS & CLASSES →</Text>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.grayText,
    lineHeight: 17,
    marginBottom: 12,
  },
  markTypeGrid: {
    gap: 10,
  },
  markTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFBFD',
  },
  markTypeCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFDF6',
  },
  markTypeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  markTypeIcon: {
    fontSize: 18,
  },
  markTypeTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  markTypeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  markTypeLabelSelected: {
    color: '#8A6805',
  },
  markTypeDesc: {
    fontSize: 11.5,
    color: COLORS.grayText,
    marginTop: 2,
    lineHeight: 15,
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
  uploadDottedBox: {
    borderWidth: 2,
    borderColor: '#D0D7DE',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  uploadSub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 4,
  },
  uploadedFileBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#B9E6FE',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoPreviewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  fileDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1,
  },
  fileActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  replaceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
  },
  replaceBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
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
