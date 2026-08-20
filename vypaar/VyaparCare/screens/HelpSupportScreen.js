import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import ScreenHeader from '../components/ScreenHeader';
import { COLORS } from '../constants/theme';

// TODO: apna asli support number daalein (E.164, bina +)
const SUPPORT_PHONE = '919999999999';

/** link kholo; device support na kare to alert */
const openLink = async (url, label) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Not available', `${label} is not available on this device.`);
      return;
    }
    await Linking.openURL(url);
  } catch (err) {
    Alert.alert('Could not open', err.message);
  }
};

const OPTIONS = [
  {
    id: 'whatsapp',
    icon: '💬',
    iconBg: '#E8F5E9',
    title: 'WhatsApp Chat',
    subtitle: 'Chat with our team',
    log: 'Open WhatsApp',
    tappable: true,
  },
  {
    id: 'call',
    icon: '📞',
    iconBg: '#E8F0FE',
    title: 'Call Us',
    subtitle: 'Talk to our executive',
    log: 'Call Support',
    tappable: true,
  },
  {
    id: 'ticket',
    icon: '🎫',
    iconBg: '#FFF3E0',
    title: 'Raise a Ticket',
    subtitle: 'Submit your query',
    log: 'Raise Ticket',
    tappable: true,
  },
  {
    id: 'hours',
    icon: '🕐',
    iconBg: '#F3E5F5',
    title: 'Working Hours',
    subtitle: 'Mon - Sat (10 AM - 7 PM)',
    tappable: false,
  },
];

export default function HelpSupportScreen({ route }) {
  const options = route?.params?.options || OPTIONS;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="Help & Support" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>How can we help you?</Text>

        {options.map((option) => (
          <SupportOption key={option.id} option={option} />
        ))}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>We are always here to help you!</Text>
          <Text style={styles.heart}>❤️</Text>
        </View>
      </ScrollView>

      {/* support kisi tab ka screen nahi — koi tab active nahi dikhta */}
      <BottomNav activeTab={null} />
    </SafeAreaView>
  );
}

function SupportOption({ option }) {
  const content = (
    <>
      <View style={[styles.iconCircle, { backgroundColor: option.iconBg }]}>
        <Text style={styles.icon}>{option.icon}</Text>
      </View>

      <View style={styles.cardText}>
        <Text style={styles.title}>{option.title}</Text>
        <Text style={styles.subtitle}>{option.subtitle}</Text>
      </View>

      {option.tappable ? <Text style={styles.chevron}>›</Text> : null}
    </>
  );

  // non-tappable option plain View hai — koi press feedback nahi
  if (!option.tappable) {
    return <View style={styles.card}>{content}</View>;
  }

  const handlePress = () => {
    console.log(option.log);

    if (option.id === 'whatsapp') {
      openLink(`https://wa.me/${SUPPORT_PHONE}`, 'WhatsApp');
    } else if (option.id === 'call') {
      openLink(`tel:+${SUPPORT_PHONE}`, 'Calling');
    }
    // 'ticket' — future scope, abhi sirf log
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={handlePress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  pressed: {
    opacity: 0.85,
  },

  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  /* cards */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 20,
  },
  cardText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 3,
  },
  chevron: {
    fontSize: 24,
    lineHeight: 26,
    color: '#BBBBBB',
    marginLeft: 8,
  },

  /* bottom note */
  footerNote: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
  },
  heart: {
    fontSize: 16,
    marginTop: 6,
  },
});
