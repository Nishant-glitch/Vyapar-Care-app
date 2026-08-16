import React from 'react';
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { COLORS } from '../constants/theme';
import { formatINR } from '../utils/currency';

const GST_SERVICE = {
  title: 'GST Registration',
  icon: '📋',
  fee: 10000,
  advancePercent: 50,
};

export default function PaymentSummaryScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const params = route.params || {};
  const picked = params.service || {};
  const service = {
    ...GST_SERVICE,
    ...picked,
    title: picked.title || picked.detail_title || picked.name || GST_SERVICE.title,
    fee: params.fee ?? picked.fee ?? GST_SERVICE.fee,
    advancePercent:
      params.advancePercent ??
      picked.advancePercent ??
      picked.advance_percent ??
      GST_SERVICE.advancePercent,
  };

  const advance = Math.round((service.fee * service.advancePercent) / 100);
  const remaining = service.fee - advance;

  const handlePay = () => {
    console.log('Navigate to Payment Gateway');
    navigation.navigate('PaymentGateway', { amount: advance, payFlow: 'advance', service });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Payment Summary" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- service + breakdown ---------- */}
        <View style={styles.card}>
          <View style={styles.serviceRow}>
            <Text style={styles.serviceIcon}>{service.icon}</Text>
            <Text style={styles.serviceTitle}>{service.title}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Service Fee</Text>
            <Text style={styles.valuePrimary}>{formatINR(service.fee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>
              Advance Required ({service.advancePercent}%)
            </Text>
            <Text style={styles.valueBold}>{formatINR(advance)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Remaining Amount</Text>
            <Text style={styles.valueGray}>{formatINR(remaining)}</Text>
          </View>
        </View>

        {/* ---------- note ---------- */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            Work will start after advance payment confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* ---------- fixed bottom ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.payButton, pressed && styles.pressed]}
          onPress={handlePay}
        >
          <Text style={styles.payText}>Pay {formatINR(advance)} Now</Text>
        </Pressable>

        <View style={styles.secureRow}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.secureText}>100% Secure Payment</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.85,
  },

  /* card */
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    padding: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  serviceTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },

  /* breakdown rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: COLORS.grayText,
    paddingRight: 12,
  },
  valuePrimary: {
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  valueBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  valueGray: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  /* note */
  note: {
    marginTop: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
  },
  noteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.grayText,
    lineHeight: 19,
  },

  /* footer */
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  payButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  lockIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  secureText: {
    fontSize: 12,
    color: '#888888',
  },
});
