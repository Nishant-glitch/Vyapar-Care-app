import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export const ITR_STEPS = [
  { id: 1, title: 'Taxpayer Profile', short: 'Profile' },
  { id: 2, title: 'Income Sources & ITR', short: 'Sources' },
  { id: 3, title: 'Salary / Form 16', short: 'Salary' },
  { id: 4, title: 'House Property', short: 'Property' },
  { id: 5, title: 'Business / Profession', short: 'Business' },
  { id: 6, title: 'Capital Gains & Other', short: 'Capital' },
  { id: 7, title: 'Deductions & Regime', short: 'Deductions' },
  { id: 8, title: 'TDS & Bank Refund', short: 'TDS/Bank' },
  { id: 9, title: 'Document Center', short: 'Docs' },
  { id: 10, title: 'Tax Computation Review', short: 'Review' },
  { id: 11, title: 'Service Payment', short: 'Payment' },
  { id: 12, title: 'Filed & ITR-V', short: 'Done' },
];

export default function ITRStepper({ currentStep = 1 }) {
  const percent = Math.min(100, Math.round((currentStep / ITR_STEPS.length) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.stepCounter}>
          Step {currentStep} of {ITR_STEPS.length}
        </Text>
        <Text style={styles.stepTitle}>
          {ITR_STEPS[currentStep - 1]?.title || 'ITR Filing'}
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
        {ITR_STEPS.map((s) => {
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
    width: 60,
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
