import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BrandWordmark, LogoBadge } from '../components/BrandLogo';
import { COLORS, SERIF } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const SPLASH_DURATION = 3000;

export default function SplashScreen({ navigation }) {
  const { session, loading: authLoading } = useAuth();
  const [minTimeDone, setMinTimeDone] = useState(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textShift = useRef(new Animated.Value(18)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(220, [
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textShift, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => setMinTimeDone(true), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [logoOpacity, logoScale, textOpacity, textShift, taglineOpacity]);

  // 3 second bhi poore ho gaye aur auth state bhi pata chal gaya — tab route karo
  useEffect(() => {
    if (!minTimeDone || authLoading) return;

    if (session) {
      console.log('Session found, Navigate to Home');
      navigation.replace('Home');
    } else {
      console.log('Navigate to Login');
      navigation.replace('Login');
    }
  }, [minTimeDone, authLoading, session, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar hidden barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      <View style={styles.centerBlock}>
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <LogoBadge size={150} />
        </Animated.View>

        <Animated.View
          style={{ opacity: textOpacity, transform: [{ translateY: textShift }], width: '100%' }}
        >
          <BrandWordmark />
        </Animated.View>
      </View>

      <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
        <Text style={styles.tagline}>Your Business, Our Care</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoWrap: {
    marginBottom: 42,
  },
  taglineWrap: {
    position: 'absolute',
    bottom: 70,
    alignItems: 'center',
    width: '100%',
  },
  tagline: {
    fontFamily: SERIF,
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.white,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
});
