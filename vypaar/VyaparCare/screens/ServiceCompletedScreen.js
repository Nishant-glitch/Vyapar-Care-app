import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [COLORS.gold, COLORS.primaryDark, COLORS.whatsapp, '#E74C3C'];
const CONFETTI_COUNT = 18;
const CONFETTI_LIFETIME = 3000;

export default function ServiceCompletedScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const trophyScale = useRef(new Animated.Value(0.3)).current;
  const trophyOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonShift = useRef(new Animated.Value(30)).current;

  const [showConfetti, setShowConfetti] = useState(true);

  /* ---------- entry animations (staggered) ---------- */
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(trophyOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // spring apna bounce khud deta hai — isliye yahan easing nahi
        Animated.spring(trophyScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonShift, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => setShowConfetti(false), CONFETTI_LIFETIME);
    return () => clearTimeout(timer);
  }, [trophyOpacity, trophyScale, textOpacity, buttonOpacity, buttonShift]);

  /* ---------- back disabled (completion screen) ---------- */
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const handleViewCertificate = () => {
    console.log('Navigate to Documents/Certificate');
    // stack ko Home → MyDocuments bana do, taaki back Home pe jaaye
    navigation.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name: 'MyDocuments' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      {showConfetti && <Confetti />}

      <View style={styles.center}>
        <Animated.Text
          style={[
            styles.trophy,
            { opacity: trophyOpacity, transform: [{ scale: trophyScale }] },
          ]}
        >
          🏆
        </Animated.Text>

        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={styles.congrats}>Congratulations!</Text>
          <Text style={styles.subLine}>Your Service is</Text>
          <Text style={styles.completed}>100% Completed</Text>

          <Text style={styles.thanks}>Thank you for choosing</Text>
          <Text style={styles.brand}>Vyapar Care Consultancy.</Text>
        </Animated.View>
      </View>

      {/* ---------- fixed button ---------- */}
      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            opacity: buttonOpacity,
            transform: [{ translateY: buttonShift }],
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={handleViewCertificate}
        >
          <Text style={styles.buttonText}>View Certificate</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ---------------- confetti ---------------- */

function Confetti() {
  // particles ek hi baar banao — har render pe naye random values nahi chahiye
  const particles = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        key: `c${i}`,
        x: Math.random() * SCREEN_WIDTH,
        drift: (Math.random() - 0.5) * 120,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() > 0.5,
        delay: Math.random() * 600,
        duration: 2000 + Math.random() * 900,
        spin: Math.random() > 0.5 ? 1 : -1,
      })),
    []
  );

  return (
    <View style={styles.confettiLayer} pointerEvents="none">
      {particles.map(({ key, ...p }) => (
        // key ko spread se bahar rakho — React spread me key allow nahi karta
        <ConfettiPiece key={key} {...p} />
      ))}
    </View>
  );
}

function ConfettiPiece({ x, drift, size, color, round, delay, duration, spin }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_HEIGHT + 40],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, drift],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${spin * 720}deg`],
  });
  // end ke paas fade out
  const opacity = progress.interpolate({
    inputRange: [0, 0.1, 0.75, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: round ? size : size * 1.6,
        borderRadius: round ? size / 2 : 1,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  pressed: {
    opacity: 0.85,
  },

  trophy: {
    fontSize: 100,
    lineHeight: 118, // warna Android pe emoji upar se clip ho jaata hai
    textAlign: 'center',
  },
  congrats: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.gold,
    textAlign: 'center',
    marginTop: 20,
  },
  subLine: {
    fontSize: 16,
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 10,
  },
  completed: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: 4,
  },
  thanks: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 16,
  },
  brand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: 4,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
