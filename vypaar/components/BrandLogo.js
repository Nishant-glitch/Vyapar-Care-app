import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { COLORS, SERIF } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BASE_CIRCLE = 150; // reference size the proportions were designed at

/**
 * Circular golden "VC" badge with the decorative arcs around it.
 * `size` is the diameter of the inner circle; everything else scales from it.
 */
export function LogoBadge({ size = BASE_CIRCLE, showFlourishes = true }) {
  const s = size / BASE_CIRCLE;
  const outer = size + 40 * s;
  const inner = size + 62 * s;

  const arcStyle = (dim, width, opacity, rotate) => ({
    position: 'absolute',
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    borderWidth: width,
    borderColor: 'transparent',
    borderTopColor: COLORS.gold,
    opacity,
    transform: [{ rotate }],
  });

  return (
    <View style={{ width: inner + 8 * s, height: inner + 8 * s, alignItems: 'center', justifyContent: 'center' }}>
      {showFlourishes && (
        <>
          {/* a ring with three transparent borders reads as an arc */}
          <View style={arcStyle(outer, 1.5 * s, 0.55, '-35deg')} />
          <View style={arcStyle(outer, 1.5 * s, 0.55, '145deg')} />
          <View style={arcStyle(inner, 1 * s, 0.3, '55deg')} />
          <View style={arcStyle(inner, 1 * s, 0.3, '235deg')} />

          <View style={[styles.dot, { width: 6 * s, height: 6 * s, borderRadius: 3 * s, top: 2 }]} />
          <View style={[styles.dot, { width: 6 * s, height: 6 * s, borderRadius: 3 * s, bottom: 2 }]} />
        </>
      )}

      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: Math.max(1.5, 2.5 * s),
          },
        ]}
      >
        <View style={styles.monogramRow}>
          <Text style={[styles.letterV, { fontSize: 76 * s, lineHeight: 84 * s }]}>V</Text>
          <Text
            style={[
              styles.letterC,
              {
                fontSize: 56 * s,
                lineHeight: 62 * s,
                marginLeft: -20 * s, // overlap onto the V
                marginBottom: 6 * s,
              },
            ]}
          >
            C
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * "VYAPAR CARE" + golden rule + "CONSULTANCY".
 * `scale` shrinks the whole lockup; `lineWidth` overrides the rule width.
 */
export function BrandWordmark({ scale = 1, lineWidth, nameColor = COLORS.white }) {
  return (
    <View style={styles.wordmark}>
      <Text
        style={[
          styles.brandName,
          { fontSize: 29 * scale, letterSpacing: 4.5 * scale, color: nameColor },
        ]}
      >
        VYAPAR CARE
      </Text>

      <View
        style={[
          styles.divider,
          {
            width: lineWidth != null ? lineWidth : SCREEN_WIDTH * 0.6,
            marginTop: 16 * scale,
            marginBottom: 14 * scale,
          },
        ]}
      />

      <Text
        style={[
          styles.subBrand,
          {
            fontSize: 13 * scale,
            letterSpacing: 8 * scale,
            // trailing letter-spacing pushes the word left of centre; nudge it back
            marginLeft: 8 * scale,
          },
        ]}
      >
        CONSULTANCY
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  monogramRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  letterV: {
    fontFamily: SERIF,
    color: COLORS.gold,
    fontWeight: '700',
  },
  letterC: {
    fontFamily: SERIF,
    color: COLORS.gold,
    fontWeight: '600',
    opacity: 0.92,
  },
  dot: {
    position: 'absolute',
    backgroundColor: COLORS.gold,
    opacity: 0.8,
  },
  wordmark: {
    alignItems: 'center',
    width: '100%',
  },
  brandName: {
    fontFamily: SERIF,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.gold,
  },
  subBrand: {
    fontFamily: SERIF,
    color: COLORS.gold,
    textAlign: 'center',
  },
});
