import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';
import { AuthContext } from '../context/AuthContext';
import { FitnessContext } from '../context/FitnessContext';
import { IconWatch, IconTrophy, IconActivity } from '../components/Icons';

export const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { wearableConnected, syncWearableData } = useContext(FitnessContext);

  const badges = [
    { title: 'Century Club', desc: '100k Steps in a Week', icon: '⚡' },
    { title: 'Iron Will', desc: '14-Day Workout Streak', icon: '🛡️' },
    { title: 'Tempo Master', desc: 'Sub-5:00 /km Pace Run', icon: '🏃' },
    { title: 'Night Owl', desc: '10 Evening HIIT Sessions', icon: '🌙' },
  ];

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.screenPadding}>
      {/* Profile Card */}
      <View style={[globalStyles.card, styles.profileHeaderCard]}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>🏃‍♂️</Text>
        </View>
        <Text style={styles.profileName}>{user ? user.displayName : 'Aarav Patel'}</Text>
        <Text style={styles.profileBio}>{user ? user.bio : 'Marathon trainee & hybrid athlete'}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>72 kg</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>178 cm</Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>482 km</Text>
            <Text style={styles.statLabel}>Lifetime Run</Text>
          </View>
        </View>
      </View>

      {/* Hardware & Wearables Manager */}
      <Text style={globalStyles.sectionHeader}>Connected Devices</Text>
      <View style={[globalStyles.card, styles.deviceCard]}>
        <View style={globalStyles.rowCenter}>
          <View style={styles.deviceIcon}>
            <IconWatch size={22} color={colors.primary} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.deviceName}>Google Fit / Health Connect</Text>
            <Text style={styles.deviceStatus}>
              {wearableConnected ? 'Active & Synced' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.syncDeviceBtn} onPress={syncWearableData}>
          <Text style={styles.syncDeviceBtnText}>Sync Now</Text>
        </TouchableOpacity>
      </View>

      {/* Trophy Case */}
      <Text style={[globalStyles.sectionHeader, { marginTop: 12 }]}>Trophy Case & Badges</Text>
      <View style={styles.badgeGrid}>
        {badges.map((b, idx) => (
          <View key={idx} style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>{b.icon}</Text>
            <Text style={styles.badgeTitle}>{b.title}</Text>
            <Text style={styles.badgeDesc}>{b.desc}</Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 34,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  profileBio: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  deviceStatus: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  syncDeviceBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  syncDeviceBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
    marginBottom: 24,
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
