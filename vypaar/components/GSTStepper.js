import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export const GST_STEPS = [
  { id: 1, title: 'Constitution', short: 'Constitution' },
  { id: 2, title: 'Business Info', short: 'Business' },
  { id: 3, title: 'Promoters', short: 'Promoters' },
  { id: 4, title: 'Principal Place', short: 'Premises' },
  { id: 5, title: 'Goods & Services', short: 'Goods/HSN' },
  { id: 6, title: 'Bank Details', short: 'Bank' },
  { id: 7, title: 'Documents', short: 'Docs' },
  { id: 8, title: 'Review', short: 'Review' },
  { id: 9, title: 'Payment', short: 'Payment' },
  { id: 10, title: 'Done', short: 'Done' },
];

export default function GSTStepper({ currentStep = 1 }) {
  const percent = Math.min(100, Math.round((currentStep / GST_STEPS.length) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.stepCounter}>
          Step {currentStep} of {GST_STEPS.length}
        </Text>
        <Text style={styles.stepTitle}>
          {GST_STEPS[currentStep - 1]?.title || 'GST Registration'}
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
        {GST_STEPS.map((s) => {
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
    color: '#059669',
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
    backgroundColor: '#059669',
  },
  scrollList: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 12,
  },
  stepItem: {
    alignItems: 'center',
    width: 62,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 3,
  },
  circleActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  circleDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  circleText: {
    fontSize: 11,
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
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  shortLabelActive: {
    color: '#059669',
    fontWeight: '700',
  },
  shortLabelDone: {
    color: '#10B981',
    fontWeight: '600',
  },
});
