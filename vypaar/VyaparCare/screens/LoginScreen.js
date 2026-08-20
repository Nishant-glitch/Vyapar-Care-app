import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
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
import { BrandWordmark, LogoBadge } from '../components/BrandLogo';
import { COLORS } from '../constants/theme';
import { isSupabaseConfigured, supabase, toE164 } from '../lib/supabase';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const PHONE_LENGTH = 10;

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);

  const isValid = phone.length === PHONE_LENGTH;

  const handlePhoneChange = (text) => {
    // strip anything that isn't a digit, then cap at 10
    setPhone(text.replace(/[^0-9]/g, '').slice(0, PHONE_LENGTH));
  };

  const handleSendOtp = async () => {
    if (!isValid || sending) {
      if (!isValid) {
        Alert.alert('Invalid Number', 'Please enter a valid 10 digit mobile number.');
      }
      return;
    }

    // Supabase configure nahi hai to purana demo behaviour
    if (!isSupabaseConfigured) {
      Alert.alert('OTP Sent', `OTP sent to +91 ${phone}`);
      console.log('Navigate to OTP Screen');
      navigation.navigate('OTP', { phone });
      return;
    }

    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
    setSending(false);

    if (error) {
      Alert.alert('Could not send OTP', error.message);
      return;
    }

    Alert.alert('OTP Sent', `OTP sent to +91 ${phone}`);
    console.log('Navigate to OTP Screen');
    navigation.navigate('OTP', { phone });
  };

  const handleWhatsAppLogin = () => {
    console.log('WhatsApp Login pressed');
  };

  const handleRegister = () => {
    // Register screen abhi bana nahi hai
    console.log('Navigate to Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Top: branding ---------- */}
        <View style={styles.topSection}>
          <Text style={styles.welcome}>Welcome to</Text>
          <LogoBadge size={80} />
          <View style={styles.wordmarkWrap}>
            <BrandWordmark
              scale={0.62}
              lineWidth={SCREEN_WIDTH * 0.42}
              nameColor={COLORS.primaryDark}
            />
          </View>
        </View>

        {/* ---------- Middle: login form ---------- */}
        <View style={styles.formSection}>
          <Text style={styles.heading}>Login / Register</Text>

          <View style={[styles.phoneRow, focused && styles.phoneRowFocused]}>
            <Pressable
              style={styles.countryBox}
              onPress={() => console.log('Country code picker pressed')}
            >
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
              <Text style={styles.caret}>▾</Text>
            </Pressable>

            <View style={styles.countryDivider} />

            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#AAAAAA"
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
              value={phone}
              onChangeText={handlePhoneChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={PHONE_LENGTH}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
              textContentType="telephoneNumber"
              autoComplete="tel"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.otpButton,
              sending && styles.buttonDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleSendOtp}
            disabled={sending}
          >
            <Text style={styles.otpButtonText}>
              {sending ? 'SENDING...' : 'SEND OTP'}
            </Text>
          </Pressable>

          {/* ---------- Divider ---------- */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ---------- WhatsApp ---------- */}
          <Pressable
            style={({ pressed }) => [styles.whatsappButton, pressed && styles.pressed]}
            onPress={handleWhatsAppLogin}
          >
            <Text style={styles.whatsappIcon}>💬</Text>
            <Text style={styles.whatsappText}>Login with WhatsApp</Text>
          </Pressable>
        </View>

        {/* ---------- Bottom ---------- */}
        <View style={styles.bottomSection}>
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>New Customer? </Text>
            <Pressable onPress={handleRegister} hitSlop={8}>
              <Text style={styles.registerLink}>Register Now</Text>
            </Pressable>
          </View>

          <View style={styles.secureRow}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.secureText}>Secure Login</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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

  /* top */
  topSection: {
    minHeight: SCREEN_HEIGHT * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  welcome: {
    fontSize: 16,
    color: COLORS.grayText,
    textAlign: 'center',
    marginBottom: 14,
  },
  wordmarkWrap: {
    marginTop: 10,
    width: '100%',
  },

  /* form */
  formSection: {
    width: '100%',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 22,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  phoneRowFocused: {
    borderColor: COLORS.primaryDark,
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  caret: {
    fontSize: 11,
    color: COLORS.grayText,
    marginLeft: 4,
  },
  countryDivider: {
    width: 1,
    height: 26,
    backgroundColor: COLORS.border,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111111',
    letterSpacing: 0.5,
  },

  otpButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  otpButtonText: {
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

  /* divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: COLORS.grayText,
    letterSpacing: 1,
  },

  /* whatsapp */
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.whatsapp,
    backgroundColor: COLORS.white,
  },
  whatsappIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  whatsappText: {
    color: COLORS.whatsapp,
    fontSize: 16,
    fontWeight: '600',
  },

  /* bottom */
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 32,
    alignItems: 'center',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
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
