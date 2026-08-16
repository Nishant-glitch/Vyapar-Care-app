import React, { useRef, useEffect } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../constants/theme';

export const FSSAI_STEPS = [
  { step: 1, title: 'Eligibility', route: 'FSSAIEligibility', shortTitle: '1. KoB' },
  { step: 2, title: 'Applicant', route: 'FSSAIApplicant', shortTitle: '2. Applicant' },
  { step: 3, title: 'Business', route: 'FSSAIBusiness', shortTitle: '3. Business' },
  { step: 4, title: 'Premises', route: 'FSSAIPremises', shortTitle: '4. Premises' },
  { step: 5, title: 'Products', route: 'FSSAIProducts', shortTitle: '5. Products' },
  { step: 6, title: 'Specifics', route: 'FSSAISpecific', shortTitle: '6. Specifics' },
  { step: 7, title: 'Checklist', route: 'FSSAIDocumentsChecklist', shortTitle: '7. Checklist' },
  { step: 8, title: 'Documents', route: 'FSSAIDocumentsUpload', shortTitle: '8. Uploads' },
  { step: 9, title: 'Review', route: 'FSSAIReview', shortTitle: '9. Review' },
  { step: 10, title: 'Payment', route: 'FSSAIPayment', shortTitle: '10. Payment' },
  { step: 11, title: 'Status', route: 'FSSAIConfirmation', shortTitle: '11. Status' },
];

export default function FSSAIStepper({
  currentStep = 1,
  onStepPress,
}) {
  const scrollRef = useRef(null);
  const totalSteps = FSSAI_STEPS.length;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    if (scrollRef.current && currentStep > 2) {
      const offset = (currentStep - 2) * 75;
      scrollRef.current.scrollTo({ x: offset, y: 0, animated: true });
    }
  }, [currentStep]);

  return (
    <View style={styles.container}>
      {/* Header with Progress Counter & Percentage */}
      <View style={styles.topRow}>
        <Text style={styles.stepCounterText}>
          STEP {currentStep} OF {totalSteps}
        </Text>
        <Text style={styles.progressPercentText}>{progressPercent}% COMPLETED</Text>
      </View>

      {/* Thin Gold Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Horizontal Scrollable Step Dots */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stepsScrollContent}
      >
        {FSSAI_STEPS.map((item) => {
          const isDone = item.step < currentStep;
          const isCurrent = item.step === currentStep;
          const isClickable = item.step <= currentStep;

          return (
            <TouchableOpacity
              key={`fssai-step-${item.step}`}
              style={[
                styles.stepItem,
                isCurrent && styles.stepItemCurrent,
                !isClickable && styles.stepItemDisabled,
              ]}
              disabled={!isClickable || !onStepPress}
              onPress={() => onStepPress && onStepPress(item.step, item.route)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dotCircle,
                  isDone && styles.dotDone,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                {isDone ? (
                  <Text style={styles.checkText}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.dotNumber,
                      isCurrent && styles.dotNumberCurrent,
                    ]}
                  >
                    {item.step}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.stepTitle,
                  isCurrent && styles.stepTitleCurrent,
                  isDone && styles.stepTitleDone,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  stepCounterText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  stepsScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  stepItemCurrent: {
    backgroundColor: '#FFFDF6',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  stepItemDisabled: {
    opacity: 0.5,
  },
  dotCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  dotDone: {
    backgroundColor: COLORS.whatsapp,
  },
  dotCurrent: {
    backgroundColor: COLORS.gold,
  },
  checkText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  dotNumber: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  dotNumberCurrent: {
    color: COLORS.white,
  },
  stepTitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  stepTitleCurrent: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  stepTitleDone: {
    color: '#334155',
    fontWeight: '600',
  },
});
