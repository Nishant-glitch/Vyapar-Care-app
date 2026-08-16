import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

const STEPS = [
  { step: 1, label: 'Service' },
  { step: 2, label: 'Applicant' },
  { step: 3, label: 'Requirement' },
  { step: 4, label: 'Business' },
  { step: 5, label: 'Documents' },
  { step: 6, label: 'Additional' },
  { step: 7, label: 'Review' },
  { step: 8, label: 'Payment' },
  { step: 9, label: 'Submitted' },
];

export default function OtherServicesStepper({ currentStep = 1 }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STEPS.map((s, idx) => {
          const isDone = s.step < currentStep;
          const isActive = s.step === currentStep;

          return (
            <View key={s.step} style={styles.stepGroup}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.circle,
                    isDone && styles.circleDone,
                    isActive && styles.circleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      isDone && styles.circleTextDone,
                      isActive && styles.circleTextActive,
                    ]}
                  >
                    {isDone ? '✓' : s.step}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.label,
                    isDone && styles.labelDone,
                    isActive && styles.labelActive,
                  ]}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
              </View>

              {idx < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    s.step < currentStep && styles.connectorDone,
                  ]}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
    width: 68,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 4,
  },
  circleDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  circleActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  circleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  circleTextDone: {
    color: COLORS.white,
  },
  circleTextActive: {
    color: COLORS.white,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  labelDone: {
    color: '#10B981',
    fontWeight: '700',
  },
  labelActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  connector: {
    width: 18,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  connectorDone: {
    backgroundColor: '#10B981',
  },
});
