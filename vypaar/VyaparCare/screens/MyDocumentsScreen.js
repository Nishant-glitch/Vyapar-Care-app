import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { getCompletedDocuments } from '../lib/database';

const DOCUMENTS = [
  { id: 'certificate', name: 'GST Certificate', icon: '📜', iconBg: '#E8F5E9' },
  { id: 'acknowledgment', name: 'Acknowledgment', icon: '📄', iconBg: '#E8F0FE' },
  { id: 'application', name: 'Application Copy', icon: '📋', iconBg: '#FFF3E0' },
  { id: 'gstProof', name: 'GST Number Proof', icon: '🔢', iconBg: '#F3E5F5' },
];

// DB me icon store nahi hota — index se assign
const ICONS = [
  { icon: '📜', iconBg: '#E8F5E9' },
  { icon: '📄', iconBg: '#E8F0FE' },
  { icon: '📋', iconBg: '#FFF3E0' },
  { icon: '🔢', iconBg: '#F3E5F5' },
];

export default function MyDocumentsScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data, loading, error, reload } = useFetch(
    async () =>
      (await getCompletedDocuments(user.id)).map((doc, i) => ({
        ...doc,
        ...ICONS[i % ICONS.length],
      })),
    [user?.id],
    { demoData: route?.params?.documents || DOCUMENTS, enabled: !!user?.id }
  );

  const documents = data || [];

  /** file_url public Storage link hai — usi ko kholte/download karte hain */
  const openFile = async (item) => {
    if (!item.file_url) {
      console.log(`Download: ${item.name} (file not available yet)`);
      return;
    }
    const canOpen = await Linking.canOpenURL(item.file_url);
    if (canOpen) Linking.openURL(item.file_url);
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => {
        console.log(`View Document: ${item.name}`);
        openFile(item);
      }}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>

      <View style={styles.cardText}>
        <Text style={styles.docName} numberOfLines={1}>
          {item.name}
        </Text>

        {/* nested Pressable — tap yahan hua to card ka onPress nahi chalega */}
        <Pressable
          onPress={() => {
            console.log(`Download: ${item.name}`);
            openFile(item);
          }}
          hitSlop={6}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.downloadLink}>View / Download</Text>
        </Pressable>
      </View>

      <Text style={styles.chevron}>⬇</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="My Documents" />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No documents available yet</Text>
            </View>
          }
        />
      )}

      {/* ---------- fixed button ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            documents.length === 0 && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={() => console.log('Download All Documents')}
          disabled={documents.length === 0}
        >
          <Text style={styles.buttonText}>Download All</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pressed: {
    opacity: 0.85,
  },

  /* list */
  listContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
  },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 18,
  },
  cardText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  docName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  downloadLink: {
    fontSize: 13,
    color: COLORS.gold,
    textDecorationLine: 'underline',
    marginTop: 3,
  },
  chevron: {
    fontSize: 18,
    color: '#999999',
    marginLeft: 10,
  },

  /* empty */
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grayText,
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
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
