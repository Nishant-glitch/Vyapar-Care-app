import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { getDocuments, getLatestOrder, uploadDocument } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

const RED = '#E74C3C';
const UPLOAD_DELAY = 1500; // asli file picker aane tak simulation

const INITIAL_DOCS = [
  { id: 'aadhaar', name: 'Aadhaar Card', status: 'uploaded' },
  { id: 'pan', name: 'PAN Card', status: 'uploaded' },
  { id: 'address', name: 'Address Proof', status: 'uploaded' },
  { id: 'bank', name: 'Bank Statement', status: 'uploaded' },
  { id: 'photo', name: 'Photograph', status: 'pending' },
];

export default function UploadDocumentsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const timers = useRef([]);

  const paramOrderUuid = route?.params?.orderUuid;

  // order pata nahi to latest order ke documents
  const { data, loading, error, reload, setData } = useFetch(
    async () => {
      const orderUuid =
        paramOrderUuid || (await getLatestOrder(user.id).then((o) => o?.id));
      if (!orderUuid) return { orderUuid: null, docs: [] };
      return { orderUuid, docs: await getDocuments(orderUuid) };
    },
    [paramOrderUuid, user?.id],
    { demoData: { orderUuid: null, docs: INITIAL_DOCS }, enabled: !!(paramOrderUuid || user?.id) }
  );

  const docs = data?.docs || [];
  const orderUuid = data?.orderUuid;

  // unmount pe pending timers clear — warna "setState on unmounted" chalega
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const uploadedCount = docs.filter((d) =>
    ['uploaded', 'verified'].includes(d.status)
  ).length;
  const allUploaded = docs.length > 0 && uploadedCount === docs.length;

  const setStatus = (id, status, patch = {}) =>
    setData((prev) => ({
      ...prev,
      docs: prev.docs.map((d) => (d.id === id ? { ...d, status, ...patch } : d)),
    }));

  const handlePress = async (doc) => {
    if (doc.status !== 'pending') return; // uploaded / uploading pe kuch nahi
    console.log(`Pick document: ${doc.name}`);

    // demo mode: purana simulation
    if (!isSupabaseConfigured || !orderUuid) {
      setStatus(doc.id, 'uploading');
      const timer = setTimeout(() => setStatus(doc.id, 'uploaded'), UPLOAD_DELAY);
      timers.current.push(timer);
      return;
    }

    const picked = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled) return;

    setStatus(doc.id, 'uploading');
    try {
      const updated = await uploadDocument({
        orderUuid,
        documentId: doc.id,
        file: picked.assets[0],
      });
      setStatus(doc.id, updated.status, { file_url: updated.file_url });
    } catch (err) {
      console.log('Upload failed:', err.message);
      Alert.alert('Upload failed', err.message);
      setStatus(doc.id, 'pending');
    }
  };

  const handleSubmit = () => {
    if (!allUploaded) return;
    console.log('All Documents Uploaded, Navigate to Work Progress');
    navigation.navigate('WorkProgress', { orderUuid });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenHeader title="Upload Documents" />

      {/* ---------- progress ---------- */}
      <View style={styles.progressRow}>
        <Text style={styles.progressTitle}>Required Documents</Text>
        <Text style={styles.progressCount}>
          {uploadedCount}/{docs.length} Uploaded
        </Text>
      </View>

      {/* ---------- list ---------- */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <FlatList
          data={docs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <DocumentCard doc={item} onPress={handlePress} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No documents required yet</Text>
            </View>
          }
        />
      )}

      {/* ---------- fixed button ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !allUploaded && styles.buttonDisabled,
            pressed && allUploaded && styles.pressed,
          ]}
          onPress={handleSubmit}
          disabled={!allUploaded}
        >
          <Text style={styles.buttonText}>Upload Document</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function DocumentCard({ doc, onPress }) {
  const uploaded = doc.status === 'uploaded';
  const uploading = doc.status === 'uploading';

  // status badalne pe halka fade — change turant chalne ki jagah dikhta hai
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    fade.setValue(0.3);
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [doc.status, fade]);

  const statusLabel = uploaded ? 'Uploaded' : uploading ? 'Uploading...' : 'Pending';
  const statusColor = uploaded
    ? COLORS.whatsapp
    : uploading
      ? COLORS.grayText
      : RED;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && doc.status === 'pending' && styles.pressed]}
      onPress={() => onPress(doc)}
    >
      <View style={[styles.iconCircle, { backgroundColor: uploaded ? '#E8F5E9' : '#E8F0FE' }]}>
        <Text style={styles.icon}>📄</Text>
      </View>

      <View style={styles.cardText}>
        <Text style={styles.docName} numberOfLines={1}>
          {doc.name}
        </Text>
        <Animated.Text style={[styles.docStatus, { color: statusColor, opacity: fade }]}>
          {statusLabel}
        </Animated.Text>
      </View>

      <Animated.Text
        style={[styles.statusIcon, { color: statusColor, opacity: fade }]}
      >
        {uploaded ? '✓' : uploading ? '⋯' : '!'}
      </Animated.Text>
    </Pressable>
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

  /* progress */
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.gold,
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.grayText,
  },

  /* cards */
  listContent: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
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
  },
  docName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  docStatus: {
    fontSize: 12,
    marginTop: 3,
  },
  statusIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    width: 22,
    textAlign: 'center',
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
    backgroundColor: COLORS.gold,
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
