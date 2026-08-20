import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { BUSINESS_TYPES, getRequiredDocuments } from '../../config/gstDocumentConfig';
import { COLORS } from '../../constants/theme';
import { useGSTForm } from '../../contexts/GSTFormContext';

/**
 * GST flow ki pehli screen — constitution chunni hoti hai.
 * Yahan stepper nahi dikhta; stepper step 0 (Applicant) se shuru hota hai.
 */
export default function GSTBusinessTypeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { formData, setTopLevel, goToStep } = useGSTForm();

  const selected = formData.businessType;

  const handleSelect = (typeId) => {
    console.log(`Business type selected: ${typeId}`);
    setTopLevel('businessType', typeId);
  };

  const handleContinue = () => {
    if (!selected) return;
    console.log('Navigate to GST Applicant Details');
    goToStep(0);
    navigation.navigate('GSTApplicant');
  };

  // selection ke baad user ko dikha dete hain kitne documents lagenge
  const documentCount = selected ? getRequiredDocuments(selected).filter((d) => d.required).length : 0;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="GST Registration" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Select Business Constitution</Text>
        <Text style={styles.subheading}>
          Aapke business ke type se hi tay hota hai ki kaunse documents lagenge.
        </Text>

        <View style={styles.grid}>
          {BUSINESS_TYPES.map((type) => {
            const active = type.id === selected;
            return (
              <Pressable
                key={type.id}
                style={({ pressed }) => [
                  styles.card,
                  active && styles.cardActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleSelect(type.id)}
              >
                <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
                  <Text style={styles.icon}>{type.icon}</Text>
                </View>

                <Text
                  style={[styles.cardLabel, active && styles.cardLabelActive]}
                  numberOfLines={2}
                >
                  {type.label}
                </Text>

                {active ? <Text style={styles.cardCheck}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>

        {selected ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>📋</Text>
            <Text style={styles.infoText}>
              Is constitution ke liye <Text style={styles.infoBold}>{documentCount} documents</Text>{' '}
              chahiye honge. Poori list Documents step me milegi.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* ---------- fixed footer ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !selected && styles.buttonDisabled,
            pressed && !!selected && styles.pressed,
          ]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={styles.buttonText}>CONTINUE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  pressed: {
    opacity: 0.85,
  },

  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.grayText,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 18,
  },

  /* grid — 2 columns */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
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
  cardActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.lightBlue,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconCircleActive: {
    backgroundColor: COLORS.white,
  },
  icon: {
    fontSize: 22,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  cardLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  cardCheck: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.whatsapp,
  },

  /* info */
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primaryDark,
    lineHeight: 19,
  },
  infoBold: {
    fontWeight: 'bold',
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
