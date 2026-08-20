import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoBadge } from './BrandLogo';
import { COLORS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function AppTopBar({ title = 'Vyapar Care', onOpenProfile }) {
  const navigation = useNavigation();
  const { profile, user } = useAuth();

  const userName = profile?.name || profile?.full_name || user?.email?.split('@')[0] || 'Ravi Kumar';
  const initial = userName.charAt(0).toUpperCase();
  const profilePhoto = profile?.profile_photo || profile?.avatar_url || null;

  const handleAvatarPress = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      navigation.navigate('Profile');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topBarContainer}>
        {/* Left: VC Logo + Brand */}
        <View style={styles.leftSection}>
          <View style={styles.logoWrap}>
            <LogoBadge size={28} showFlourishes={false} />
          </View>
          <View>
            <Text style={styles.brandTitle}>Vyapar Care</Text>
            <Text style={styles.brandSubtitle}>Compliance Hub</Text>
          </View>
        </View>

        {/* Center: Title / Current Tab */}
        <View style={styles.centerSection}>
          <Text style={styles.tabHeading} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right: Notifications + Profile Avatar */}
        <View style={styles.rightSection}>
          {/* Notification Bell */}
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.badgeDot} />
          </Pressable>

          {/* Profile Avatar */}
          <Pressable
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleAvatarPress}
            onLongPress={() => Alert.alert('Profile', 'View & Edit Profile')}
            hitSlop={8}
            accessibilityLabel="Profile"
            accessibilityRole="button"
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitial}>{initial}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1B2B5E',
  },
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B2B5E',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3C72',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.2,
  },
  logoWrap: {
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  brandSubtitle: {
    fontSize: 9.5,
    color: '#DFB53B',
    fontWeight: '700',
  },
  centerSection: {
    flex: 1.5,
    alignItems: 'center',
  },
  tabHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 16,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 6,
    right: 7,
    borderWidth: 1.5,
    borderColor: '#1B2B5E',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B2B5E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C5991A',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    resizeMode: 'cover',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DFB53B',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
