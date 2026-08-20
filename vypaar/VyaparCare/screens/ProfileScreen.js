import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, profile, updateProfile, signOut } = useAuth();

  const [uploading, setUploading] = useState(false);

  const userName = profile?.name || profile?.full_name || 'Ravi Kumar';
  const customerId = profile?.customer_id || 'VCC2505181';
  const userEmail = profile?.email || user?.email || 'client@vyaparcare.com';
  const userPhone = profile?.phone || '+91 98765 43210';
  const avatarUrl = profile?.profile_photo || profile?.avatar_url || null;
  const initial = userName.charAt(0).toUpperCase();

  const handlePickAndUploadPhoto = async () => {
    try {
      let fileUri = null;
      let fileName = null;
      let fileType = 'image/jpeg';

      // 1. Try launchImageLibrary first (react-native-image-picker)
      try {
        const imageResult = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 1,
        });

        if (imageResult.didCancel) {
          return;
        }

        if (imageResult.assets && imageResult.assets.length > 0) {
          const asset = imageResult.assets[0];
          fileUri = asset.uri;
          fileName = asset.fileName || `avatar_${Date.now()}.jpg`;
          fileType = asset.type || 'image/jpeg';
        }
      } catch (pickerErr) {
        console.log('launchImageLibrary fallback to DocumentPicker:', pickerErr);
      }

      // 2. Fallback to DocumentPicker.pick if launchImageLibrary not available
      if (!fileUri) {
        try {
          const docResult = await DocumentPicker.pick({
            type: [DocumentPicker.types.images],
          });
          if (docResult && docResult.length > 0) {
            const doc = docResult[0];
            fileUri = doc.uri;
            fileName = doc.name || `avatar_${Date.now()}.jpg`;
            fileType = doc.type || 'image/jpeg';
          }
        } catch (docErr) {
          if (DocumentPicker.isCancel(docErr)) {
            return;
          }
          throw docErr;
        }
      }

      if (!fileUri) return;

      setUploading(true);
      let finalPhotoUrl = fileUri;

      if (isSupabaseConfigured && user?.id) {
        try {
          const fileExt = fileName ? fileName.split('.').pop() : 'jpg';
          const filePath = `avatar_${user.id}_${Date.now()}.${fileExt}`;

          // Fetch file blob for Supabase storage upload
          const response = await fetch(fileUri);
          const blob = await response.blob();

          // Upload to Supabase 'avatars' storage bucket
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, blob, {
              contentType: fileType,
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
              finalPhotoUrl = publicUrlData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('Storage upload note:', storageErr);
        }
      }

      // Update in local state & database
      await updateProfile({ profile_photo: finalPhotoUrl });
      setUploading(false);
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (err) {
      setUploading(false);
      if (!DocumentPicker.isCancel(err)) {
        console.warn('Image picker error:', err);
        Alert.alert('Error', 'Could not update profile photo.');
      }
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out from Vyapar Care?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B2B5E' }} edges={['left', 'right', 'top']}>
      <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        {/* Top Header */}
      <View style={styles.headerRow}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitialText}>{initial}</Text>
              </View>
            )}

            {/* Edit Camera Button Overlay */}
            <Pressable
              style={({ pressed }) => [
                styles.editBadge,
                pressed && styles.btnPressed,
              ]}
              onPress={handlePickAndUploadPhoto}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#1B2B5E" />
              ) : (
                <Text style={styles.editBadgeIcon}>📷</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.profileName}>{userName}</Text>
          <View style={styles.cidPill}>
            <Text style={styles.cidText}>ID: {customerId}</Text>
          </View>
          <Text style={styles.verifiedBadge}>✓ Verified Business Client</Text>
        </View>

        {/* Profile Info Details */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>ACCOUNT DETAILS</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{userName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer ID</Text>
            <Text style={[styles.infoValue, { color: '#C5991A', fontWeight: 'bold' }]}>
              {customerId}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{userEmail}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Registered Mobile</Text>
            <Text style={styles.infoValue}>{userPhone}</Text>
          </View>
        </View>

        {/* Quick Menu Links */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>COMPLIANCE SERVICES</Text>

          <Pressable
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuPressed]}
            onPress={() => navigation.navigate('WorkProgress')}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📦</Text>
              <Text style={styles.menuTitle}>My Active Orders & Filings</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuPressed]}
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>💳</Text>
              <Text style={styles.menuTitle}>Payment History & Invoices</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuPressed]}
            onPress={() => navigation.navigate('UploadDocuments')}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuTitle}>My Document Vault</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              styles.menuRowLast,
              pressed && styles.menuPressed,
            ]}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🛟</Text>
              <Text style={styles.menuTitle}>Help & Support Desk</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]}
          onPress={handleSignOut}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out Account</Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerText}>Vyapar Care Consultancy Services v2.4</Text>
          <Text style={styles.footerSubText}>
            Authorized Business & Legal Compliance Platform
          </Text>
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B2B5E',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#C5991A',
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#1B2B5E',
    borderWidth: 3,
    borderColor: '#C5991A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#DFB53B',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C5991A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  editBadgeIcon: {
    fontSize: 17,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B2B5E',
    marginBottom: 4,
  },
  cidPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cidText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
  },
  verifiedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  menuPressed: {
    backgroundColor: '#F8FAFC',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  footerWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  footerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  footerSubText: {
    fontSize: 10.5,
    color: '#CBD5E1',
    marginTop: 2,
  },
});
