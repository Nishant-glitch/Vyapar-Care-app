import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export const IEC_STEPS = [
  { id: 1, title: 'Applicant / Entity Type', short: 'Entity' },
  { id: 2, title: 'PAN & Entity Details', short: 'PAN' },
  { id: 3, title: 'Business & Trade Activity', short: 'Business' },
  { id: 4, title: 'Registered Address', short: 'Address' },
  { id: 5, title: 'Bank Account & Proof', short: 'Bank' },
  { id: 6, title: 'Authorized Signatory', short: 'Signatory' },
  { id: 7, title: 'Products & Countries', short: 'Products' },
  { id: 8, title: 'DGFT Document Checklist', short: 'Docs' },
  { id: 9, title: 'Review & Declarations', short: 'Review' },
  { id: 10, title: 'DGFT & Service Payment', short: 'Payment' },
  { id: 11, title: 'Application Submitted', short: 'Submitted' },
  { id: 12, title: 'Official IEC Certificate', short: 'Certificate' },
];

export default function IECStepper({ currentStep = 1 }) {
  const percent = Math.min(100, Math.round((currentStep / IEC_STEPS.length) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.stepCounter}>
          Step {currentStep} of {IEC_STEPS.length}
        </Text>
        <Text style={styles.stepTitle}>
          {IEC_STEPS[currentStep - 1]?.title || 'IEC Registration'}
        </Text>
        <Text style={styles.progressPercent}>{percent}%</Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {IEC_STEPS.map((s) => {
          const isActive = s.id === currentStep;
          const isDone = s.id < currentStep;

          return (
            <View key={s.id} style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  isActive && styles.circleActive,
                  isDone && styles.circleDone,
                ]}
              >
                <Text
                  style={[
                    styles.circleText,
                    isActive && styles.circleTextActive,
                    isDone && styles.circleTextDone,
                  ]}
                >
                  {isDone ? '✓' : s.id}
                </Text>
              </View>
              <Text
                style={[
                  styles.shortLabel,
                  isActive && styles.shortLabelActive,
                  isDone && styles.shortLabelDone,
                ]}
                numberOfLines={1}
              >
                {s.short}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
  },
  scrollList: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 10,
  },
  stepItem: {
    alignItems: 'center',
    width: 62,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 3,
  },
  circleActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  circleDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  circleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  circleTextActive: {
    color: COLORS.white,
  },
  circleTextDone: {
    color: COLORS.white,
  },
  shortLabel: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },
  shortLabelActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  shortLabelDone: {
    color: '#10B981',
    fontWeight: '600',
  },
});
