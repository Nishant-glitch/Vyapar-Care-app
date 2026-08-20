import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoBadge } from './BrandLogo';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileDrawerModal({ visible, onClose, onOpenFormats }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, profile, logout } = useAuth();

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Ravi Kumar';
  const userCustomerId = profile?.customer_id || 'VCC-2026-8910';
  const userPhone = profile?.phone || '+91 98765 43210';
  const userEmail = user?.email || 'client@vyaparcare.com';

  const menuItems = [
    {
      id: 'work_progress',
      icon: '📦',
      title: 'My Orders & Filings',
      subtitle: 'Track active applications & SRN status',
      onPress: () => {
        onClose();
        navigation.navigate('WorkProgress');
      },
    },
    {
      id: 'payment_history',
      icon: '💳',
      title: 'Payment History',
      subtitle: 'View receipts, invoices & payment ledger',
      onPress: () => {
        onClose();
        navigation.navigate('PaymentHistory');
      },
    },
    {
      id: 'my_docs',
      icon: '📄',
      title: 'My Documents',
      subtitle: 'Uploaded certificates, PAN & KYC files',
      onPress: () => {
        onClose();
        navigation.navigate('UploadDocuments');
      },
    },
    {
      id: 'formats',
      icon: '📑',
      title: 'Download Legal Formats',
      subtitle: '13 Specimen NOCs, Deeds & Declarations',
      onPress: () => {
        onClose();
        if (onOpenFormats) {
          onOpenFormats();
        }
      },
    },
    {
      id: 'support',
      icon: '🛟',
      title: 'Help & Support Desk',
      subtitle: 'Direct CA / Legal advisory & ticket support',
      onPress: () => {
        onClose();
        navigation.navigate('HelpSupport');
      },
    },
  ];

  const handleLogout = async () => {
    onClose();
    if (logout) {
      await logout();
    }
    navigation.navigate('Login');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.drawerContainer,
            {
              paddingTop: Math.max(insets.top, 16) + 8,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            },
          ]}
        >
          {/* Top Close Row */}
          <View style={styles.drawerTopRow}>
            <View style={styles.brandBadgeRow}>
              <View style={styles.miniLogo}>
                <LogoBadge size={32} showFlourishes={false} />
              </View>
              <Text style={styles.brandTitle}>Vyapar Care Account</Text>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* User Profile Card */}
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfoWrap}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
              <View style={styles.cidPill}>
                <Text style={styles.cidText}>ID: {userCustomerId}</Text>
              </View>
            </View>
          </View>

          {/* Menu Items List */}
          <ScrollView
            style={styles.menuScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.menuSectionHeading}>ACCOUNT & COMPLIANCE HUB</Text>

            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.menuItemRow,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuIconCircle}>
                  <Text style={styles.menuIconText}>{item.icon}</Text>
                </View>

                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                <Text style={styles.menuArrow}>›</Text>
              </Pressable>
            ))}

            {/* Logout Button */}
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutPressed,
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Log Out Account</Text>
            </Pressable>

            {/* Regulatory Footer */}
            <View style={styles.footerNote}>
              <Text style={styles.footerText}>
                Vyapar Care Consultancy Services v2.4
              </Text>
              <Text style={styles.footerSub}>
                Authorized Corporate Compliance & Business Portal
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLogo: {
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B2B5E',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'bold',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2B5E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#C5991A',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C5991A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B2B5E',
  },
  userInfoWrap: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 6,
  },
  cidPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cidText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DFB53B',
    letterSpacing: 0.5,
  },
  menuScroll: {
    paddingBottom: 20,
  },
  menuSectionHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItemPressed: {
    backgroundColor: '#EEF2F6',
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIconText: {
    fontSize: 20,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
  },
  menuArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutPressed: {
    opacity: 0.85,
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  footerSub: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2,
  },
});
