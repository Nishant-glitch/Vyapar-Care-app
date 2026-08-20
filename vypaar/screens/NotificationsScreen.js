import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { formatDateTime, getNotifications, markNotificationRead } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

const RED = '#E74C3C';
const TIMESTAMP = '#999999';

// type -> dot colour
const DOT_COLORS = {
  success: COLORS.whatsapp, // #25D366
  info: COLORS.primaryDark,
  payment: COLORS.gold,
  action: RED,
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'success',
    title: 'Your documents are verified successfully.',
    description: 'All 5 documents have been checked and approved by our team.',
    timestamp: '2 May 2025 - 11:00 AM',
    unread: true,
  },
  {
    id: 'n2',
    type: 'info',
    title: 'GST application has been submitted.',
    description: 'Your application has been filed on the GST portal.',
    timestamp: '2 May 2025 - 12:30 PM',
    unread: true,
  },
  {
    id: 'n3',
    type: 'info',
    title: 'Application is under processing.',
    description: 'The department is reviewing your application.',
    timestamp: '2 May 2025 - 1:45 PM',
    unread: false,
  },
  {
    id: 'n4',
    type: 'payment',
    title: 'Final payment of ₹5,000 pending.',
    description: 'Please clear the remaining amount to receive your certificate.',
    timestamp: '2 May 2025 - 2:10 PM',
    unread: false,
  },
];

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const {
    data: notifications,
    setData,
    loading,
    error,
    refreshing,
    reload,
    refresh,
  } = useFetch(() => getNotifications(user.id), [user?.id], {
    demoData: INITIAL_NOTIFICATIONS,
    enabled: !!user?.id,
  });

  const list = notifications || [];
  const unreadCount = list.filter((n) => (n.read != null ? !n.read : n.unread)).length;

  const onRefresh = useCallback(() => {
    console.log('Refreshing notifications');
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewAll = () => {
    console.log('Load More Notifications');
  };

  const handleTap = async (item) => {
    console.log(`Notification tapped: ${item.title}`);

    // tap = padh liya
    const isUnread = item.read != null ? !item.read : item.unread;
    if (isUnread) {
      setData((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true, unread: false } : n))
      );
      if (isSupabaseConfigured) {
        markNotificationRead(item.id).catch((e) =>
          console.log('Mark read failed:', e.message)
        );
      }
    }

    // payment wali notification → final payment screen
    if (item.type === 'payment') navigation.navigate('FinalPaymentDue');
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        (item.read != null ? !item.read : item.unread) && styles.cardUnread,
        pressed && styles.pressed,
      ]}
      onPress={() => handleTap(item)}
    >
      <View style={[styles.dot, { backgroundColor: DOT_COLORS[item.type] }]} />

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.timestamp}>
          {item.created_at ? formatDateTime(item.created_at) : item.timestamp}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <ScreenHeader title="Notifications" />

      {unreadCount > 0 ? (
        <Text style={styles.unreadCount}>
          {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
        </Text>
      ) : null}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryDark}
              colors={[COLORS.primaryDark, COLORS.gold]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}

      {/* ---------- fixed bottom ---------- */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          onPress={handleViewAll}
        >
          <Text style={styles.outlineButtonText}>View All Notifications</Text>
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

  unreadCount: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* list */
  listContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
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
  cardUnread: {
    backgroundColor: '#F8F6F0',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4, // title ki pehli line ke saath align
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    lineHeight: 19,
  },
  description: {
    fontSize: 13,
    color: COLORS.grayText,
    lineHeight: 18,
    marginTop: 3,
  },
  timestamp: {
    fontSize: 11,
    color: TIMESTAMP,
    marginTop: 4,
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
  outlineButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
