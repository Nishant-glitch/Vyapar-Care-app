import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS } from '../constants/theme';
import { useFetch } from '../hooks/useFetch';
import { getServices } from '../lib/database';

// Default catalogue
const SERVICES = [
  {
    id: 'pvt-ltd-reg',
    name: 'Private Limited Company Registration',
    detailTitle: 'Private Limited Company Registration',
    description: 'Incorporate your Private Limited Company with MCA.',
    icon: '🏢',
    iconBg: '#FFF3E0',
    fee: 15000,
    advancePercent: 50,
    processingTime: '7-10 Working Days',
    popular: true,
  },
  {
    id: 'gst',
    name: 'GST Services',
    detailTitle: 'GST Registration',
    description: 'New GST Registration for Proprietorship, Partnership or Private Limited.',
    icon: '📋',
    iconBg: '#E8F0FE',
    fee: 10000,
    advancePercent: 50,
    processingTime: '3-5 Working Days',
    popular: true,
  },
  { id: 'trademark', name: 'Trademark Registration', icon: '™️', iconBg: '#E8F5E9', popular: true },
  { id: 'fssai', name: 'FSSAI License', icon: '🍽️', iconBg: '#FCE4EC', popular: true },
  { id: 'msme', name: 'MSME / Udyam', icon: '🏭', iconBg: '#F3E5F5', popular: false },
  { id: 'itr', name: 'ITR Filing', icon: '📄', iconBg: '#E0F7FA', popular: false },
  { id: 'iec', name: 'IEC / Import Export', icon: '🌐', iconBg: '#FFF8E1', popular: false },
  { id: 'other', name: 'Other Services', icon: '⚙️', iconBg: '#ECEFF1', popular: false },
];

const ICON_BGS = [
  '#FFF3E0',
  '#E8F0FE',
  '#E8F5E9',
  '#FCE4EC',
  '#F3E5F5',
  '#E0F7FA',
  '#FFF8E1',
  '#ECEFF1',
];

const normalize = (row, index) => ({
  ...row,
  iconBg: ICON_BGS[index % ICON_BGS.length],
  icon: row.icon || '📄',
  popular: index < 4,
});

export default function ServicesScreen({ navigation }) {
  const [query, setQuery] = useState('');

  const { data: services, loading, error, reload } = useFetch(
    async () => (await getServices()).map(normalize),
    [],
    { demoData: SERVICES }
  );

  const list = services || [];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q ? list.filter((s) => s.name.toLowerCase().includes(q)) : list;

    if (q) return matches.map((s) => ({ type: 'service', ...s }));

    const build = (title, items) =>
      items.length ? [{ type: 'header', id: `h-${title}`, title }, ...items.map((s) => ({ type: 'service', ...s }))] : [];

    return [
      ...build('Popular Services', matches.filter((s) => s.popular)),
      ...build('Other Services', matches.filter((s) => !s.popular)),
    ];
  }, [query, list]);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => {
          console.log(`Selected: ${item.name}`);
          navigation.navigate('ServiceDetail', { service: item });
        }}
      >
        <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.serviceName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.fee ? (
            <Text style={styles.serviceFee}>
              {`₹${Number(item.fee).toLocaleString('en-IN')}`}
            </Text>
          ) : null}
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScreenHeader title="All Services" />

      {/* ---------- search ---------- */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Services..."
          placeholderTextColor="#AAAAAA"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* ---------- list ---------- */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No services found</Text>
            </View>
          }
        />
      )}

      <BottomNav activeTab="My Work" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pressed: {
    opacity: 0.7,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111111',
    padding: 0,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.grayText,
    marginBottom: 10,
    marginTop: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
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
  serviceName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  serviceFee: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C5991A',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    lineHeight: 26,
    color: '#BBBBBB',
    marginLeft: 8,
  },
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
});
