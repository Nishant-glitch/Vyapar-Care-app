import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { usePLCForm } from '../contexts/PLCFormContext';

/**
 * 7-Step Progress Stepper for Private Limited Company Registration
 * 1 Applicant → 2 Company → 3 Directors → 4 Office → 5 Business → 6 Documents → 7 Review
 */
export default function PLCStepper({ activeStep, percent }) {
  const { currentStep, steps, completionPercentage } = usePLCForm();

  const step = activeStep ?? currentStep;
  const progress = percent ?? completionPercentage;

  const scrollRef = useRef(null);
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress, barWidth]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: Math.max(0, (step - 1) * STEP_WIDTH), animated: true });
  }, [step]);

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stepsRow}
      >
        {steps.map((s, index) => {
          const done = index < step;
          const active = index === step;

          return (
            <View key={s.key} style={styles.stepItem}>
              <View style={styles.circleRow}>
                {/* Left connector */}
                <View
                  style={[
                    styles.connector,
                    index === 0 && styles.connectorHidden,
                    done && styles.connectorDone,
                  ]}
                />

                <View
                  style={[
                    styles.circle,
                    done && styles.circleDone,
                    active && styles.circleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      (done || active) && styles.circleTextOn,
                    ]}
                  >
                    {done ? '✓' : index + 1}
                  </Text>
                </View>

                {/* Right connector */}
                <View
                  style={[
                    styles.connector,
                    index === steps.length - 1 && styles.connectorHidden,
                    index < step - 1 && styles.connectorDone,
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.stepLabel,
                  done && styles.stepLabelDone,
                  active && styles.stepLabelActive,
                ]}
                numberOfLines={1}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* ---------- Progress Bar ---------- */}
      <View style={styles.progressBlock}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Application Progress</Text>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: barWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const STEP_WIDTH = 84;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.white,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  stepsRow: {
    paddingHorizontal: 10,
  },
  stepItem: {
    width: STEP_WIDTH,
    alignItems: 'center',
  },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.primaryDark,
  },
  circleDone: {
    borderColor: COLORS.whatsapp,
    backgroundColor: COLORS.whatsapp,
  },
  circleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.grayText,
  },
  circleTextOn: {
    color: COLORS.white,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
  },
  connectorDone: {
    backgroundColor: COLORS.whatsapp,
  },
  connectorHidden: {
    backgroundColor: 'transparent',
  },
  stepLabel: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 5,
  },
  stepLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  stepLabelDone: {
    color: COLORS.whatsapp,
    fontWeight: '600',
  },

  /* progress */
  progressBlock: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.grayText,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.whatsapp,
  },
});
