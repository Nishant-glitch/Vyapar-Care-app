import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { isSupabaseConfigured, supabase, toE164 } from '../lib/supabase';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const formatTime = (totalSeconds) => {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

// "9876543210" -> "+91 98765 43210"
const formatPhone = (digits) =>
  digits && digits.length === 10
    ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    : '+91 98765 43210';

export default function OtpScreen({ navigation, route }) {
  const rawPhone = route.params?.phone;
  const phoneNumber = formatPhone(rawPhone);

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);

  const inputs = useRef([]);
  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH;
  const canResend = seconds === 0;

  /* ---------- countdown ---------- */
  useEffect(() => {
    if (seconds === 0) return undefined;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  /* ---------- otp box handling ---------- */
  const handleChange = (text, index) => {
    let cleaned = text.replace(/[^0-9]/g, '');

    // box cleared
    if (cleaned.length === 0) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // typing over a filled box: RN hands us "old+new", keep only the new digit
    if (cleaned.length === 2 && cleaned[0] === digits[index]) {
      cleaned = cleaned[1];
    }

    // one digit, or a pasted/autofilled code — spread across the boxes
    const next = [...digits];
    let cursor = index;
    for (const ch of cleaned) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = ch;
      cursor += 1;
    }
    setDigits(next);

    const target = Math.min(cursor, OTP_LENGTH - 1);
    inputs.current[target]?.focus();
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    // backspace on an empty box walks back and clears the previous one
    if (nativeEvent.key === 'Backspace' && digits[index] === '' && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputs.current[index - 1]?.focus();
    }
  };

  /* ---------- actions ---------- */
  const handleBack = () => {
    console.log('Go Back');
    navigation.goBack();
  };

  const handleResend = async () => {
    if (!canResend) return;
    console.log('OTP Resent');
    setDigits(Array(OTP_LENGTH).fill(''));
    setSeconds(RESEND_SECONDS);
    inputs.current[0]?.focus();

    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(rawPhone) });
    if (error) Alert.alert('Could not resend OTP', error.message);
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    if (!isComplete) {
      Alert.alert('Incomplete OTP', 'Please enter complete OTP');
      return;
    }
    if (verifying) return;

    // Supabase configure nahi hai to purana demo behaviour
    if (!isSupabaseConfigured) {
      console.log('OTP Verified, Navigate to Home');
      navigation.replace('Home');
      return;
    }

    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: toE164(rawPhone),
      token: otp,
      type: 'sms',
    });
    setVerifying(false);

    if (error) {
      Alert.alert('Invalid OTP', error.message);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
      return;
    }

    console.log('OTP Verified, Navigate to Home');
    // replace — login/OTP pe back se wapas nahi jaana chahiye
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <Pressable style={styles.backButton} onPress={handleBack} hitSlop={12}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- header ---------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>We have sent OTP to</Text>
          <Text style={styles.phone}>{phoneNumber}</Text>
        </View>

        {/* ---------- otp boxes ---------- */}
        <View style={styles.otpRow}>
          {digits.map((digit, index) => {
            const active = focusedIndex === index || digit !== '';
            return (
              <TextInput
                key={index}
                ref={(el) => {
                  inputs.current[index] = el;
                }}
                style={[styles.otpBox, active && styles.otpBoxActive]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                // full length (not 1) so a pasted or SMS-autofilled code arrives intact;
                // the input is controlled, so only one digit is ever displayed
                maxLength={OTP_LENGTH}
                autoFocus={index === 0}
                selectTextOnFocus
                textContentType="oneTimeCode"
                autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                returnKeyType="done"
              />
            );
          })}
        </View>

        {/* ---------- resend ---------- */}
        <View style={styles.resendRow}>
          {canResend ? (
            <Pressable onPress={handleResend} hitSlop={8}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </Pressable>
          ) : (
            <Text style={styles.resendText}>
              Resend OTP in <Text style={styles.timer}>{formatTime(seconds)}</Text>
            </Text>
          )}
        </View>

        {/* ---------- verify ---------- */}
        <Pressable
          style={({ pressed }) => [
            styles.verifyButton,
            verifying && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={handleVerify}
          disabled={verifying}
        >
          <Text style={styles.verifyText}>
            {verifying ? 'VERIFYING...' : 'VERIFY & LOGIN'}
          </Text>
        </Pressable>

        {/* ---------- bottom ---------- */}
        <View style={styles.secureRow}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.secureText}>Secure Login</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 6 boxes chhoti screens pe bhi fit ho jayein
const BOX_WIDTH = 45;
const BOX_HEIGHT = 55;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  backButton: {
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 56,
    marginLeft: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 34,
    lineHeight: 38,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },

  /* header */
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 12,
  },
  phone: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: 6,
  },

  /* otp boxes */
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  otpBox: {
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    padding: 0,
  },
  otpBoxActive: {
    borderColor: COLORS.primaryDark,
  },

  /* resend */
  resendRow: {
    alignItems: 'center',
    marginTop: 28,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  timer: {
    fontWeight: '600',
    color: COLORS.grayText,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },

  /* verify */
  verifyButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  verifyText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  /* bottom */
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
  lockIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  secureText: {
    fontSize: 12,
    color: COLORS.whatsapp,
    fontWeight: '600',
  },
});
