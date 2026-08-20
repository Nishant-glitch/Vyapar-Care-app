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
import DocumentPicker from 'react-native-document-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { getDocuments, getLatestOrder, uploadDocument } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

const RED = '#E74C3C';
const UPLOAD_DELAY = 1500;

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

  const { data, loading, error, reload, setData } = useFetch(
    async () => {
      const orderUuid =
        paramOrderUuid || (await getLatestOrder(user?.id).then((o) => o?.id));
      if (!orderUuid) return { orderUuid: null, docs: [] };
      return { orderUuid, docs: await getDocuments(orderUuid) };
    },
    [paramOrderUuid, user?.id],
    { demoData: { orderUuid: null, docs: INITIAL_DOCS }, enabled: !!(paramOrderUuid || user?.id) }
  );

  const docs = data?.docs || [];
  const orderUuid = data?.orderUuid;

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
    if (doc.status !== 'pending') return;
    console.log(`Pick document: ${doc.name}`);

    // demo mode simulation
    if (!isSupabaseConfigured || !orderUuid) {
      setStatus(doc.id, 'uploading');
      const timer = setTimeout(() => setStatus(doc.id, 'uploaded'), UPLOAD_DELAY);
      timers.current.push(timer);
      return;
    }

    let file;
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });

      if (!results || results.length === 0) return;
      const picked = results[0];

      file = {
        uri: picked.uri,
        name: picked.name || `${doc.id}.pdf`,
        mimeType: picked.type || (picked.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      };
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return;
      console.log('Pick failed:', err.message);
      Alert.alert('Could not open file', err.message);
      return;
    }

    setStatus(doc.id, 'uploading');
    try {
      const updated = await uploadDocument({
        orderUuid,
        documentId: doc.id,
        file,
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

      <ScreenHeader title="Upload Documents" />

      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={styles.progressTitle}>Required Documents</Text>
        <Text style={styles.progressCount}>
          {uploadedCount}/{docs.length} Uploaded
        </Text>
      </View>

      {/* List */}
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

      {/* Fixed Submit Button */}
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
      ? COLORS.primaryDark
      : RED;

  return (
    <Animated.View style={[styles.card, { opacity: fade }]}>
      <View style={styles.cardLeft}>
        <Text style={styles.docName}>{doc.name}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {!uploaded ? (
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            uploading && styles.actionBtnDisabled,
            pressed && !uploading && styles.pressed,
          ]}
          onPress={() => onPress(doc)}
          disabled={uploading}
        >
          <Text style={styles.actionBtnText}>{uploading ? '...' : 'Upload'}</Text>
        </Pressable>
      ) : (
        <Text style={styles.tickIcon}>✓</Text>
      )}
    </Animated.View>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  android: { elevation: 1 },
  default: {},
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  progressCount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#059669',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadow,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 10,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: '#1B2B5E',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tickIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    paddingRight: 6,
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  button: {
    backgroundColor: '#C5991A',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  pressed: {
    opacity: 0.85,
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});
