import React, { useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../constants/theme';

export const TM_STEPS = [
  { step: 1, key: 'applicant_type', label: 'Applicant Type', shortLabel: 'Type', route: 'TMApplicantType' },
  { step: 2, key: 'applicant_details', label: 'Applicant Details', shortLabel: 'Applicant', route: 'TMApplicantDetails' },
  { step: 3, key: 'mark_details', label: 'Trademark Details', shortLabel: 'Mark', route: 'TMMarkDetails' },
  { step: 4, key: 'classes', label: 'Goods & Classes', shortLabel: 'Classes', route: 'TMClasses' },
  { step: 5, key: 'usage', label: 'Usage Details', shortLabel: 'Usage', route: 'TMUsage' },
  { step: 6, key: 'documents', label: 'Supporting Docs', shortLabel: 'Docs', route: 'TMDocuments' },
  { step: 7, key: 'agent', label: 'Agent & Authorization', shortLabel: 'Agent', route: 'TMAgent' },
  { step: 8, key: 'review', label: 'Review & Verify', shortLabel: 'Review', route: 'TMReview' },
  { step: 9, key: 'payment', label: 'Fee & Payment', shortLabel: 'Payment', route: 'TMPayment' },
  { step: 10, key: 'confirmation', label: 'Submitted', shortLabel: 'Done', route: 'TMConfirmation' },
];

export default function TMStepper({ currentStep = 1, onStepPress }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && currentStep > 2) {
      const offset = (currentStep - 2) * 80;
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [currentStep]);

  const progressPercent = Math.min(100, Math.round(((currentStep - 1) / (TM_STEPS.length - 1)) * 100));

  return (
    <View style={styles.wrapper}>
      <View style={styles.topInfoRow}>
        <Text style={styles.stepCounterText}>
          Step {currentStep} of {TM_STEPS.length}:{' '}
          <Text style={styles.stepTitleHighlight}>
            {TM_STEPS[currentStep - 1]?.label || ''}
          </Text>
        </Text>
        <Text style={styles.progressPercentText}>{progressPercent}%</Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TM_STEPS.map((item, index) => {
          const isCompleted = item.step < currentStep;
          const isCurrent = item.step === currentStep;
          const isAccessible = item.step <= currentStep;

          return (
            <React.Fragment key={item.key}>
              <TouchableOpacity
                style={styles.stepItem}
                disabled={!isAccessible || !onStepPress}
                onPress={() => onStepPress && onStepPress(item.step, item.route)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Text style={styles.checkmarkText}>✓</Text>
                  ) : (
                    <Text
                      style={[
                        styles.circleNumberText,
                        isCurrent && styles.circleNumberTextCurrent,
                      ]}
                    >
                      {item.step}
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                  numberOfLines={1}
                >
                  {item.shortLabel}
                </Text>
              </TouchableOpacity>

              {index < TM_STEPS.length - 1 && (
                <View
                  style={[
                    styles.lineConnector,
                    item.step < currentStep && styles.lineConnectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  stepCounterText: {
    fontSize: 12,
    color: COLORS.grayText,
  },
  stepTitleHighlight: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleCompleted: {
    backgroundColor: COLORS.whatsapp,
    borderColor: COLORS.whatsapp,
  },
  circleCurrent: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  circleNumberText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
  },
  circleNumberTextCurrent: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: '#444444',
    fontWeight: '500',
  },
  stepLabelCurrent: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  lineConnector: {
    width: 18,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginTop: -16,
  },
  lineConnectorCompleted: {
    backgroundColor: COLORS.whatsapp,
  },
});
