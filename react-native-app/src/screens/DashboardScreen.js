import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';
import { FitnessContext } from '../context/FitnessContext';
import { AuthContext } from '../context/AuthContext';
import { GoalRing } from '../components/GoalRing';
import { MetricCard } from '../components/MetricCard';
import { IconFlame, IconFootprints, IconHeart, IconActivity, IconWatch, IconDumbbell } from '../components/Icons';

export const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { metrics, isSyncing, syncWearableData, completedWorkouts } = useContext(FitnessContext);

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={globalStyles.screenPadding}
      refreshControl={<RefreshControl refreshing={isSyncing} onRefresh={syncWearableData} tintColor={colors.primary} />}>
      
      {/* User Greeting & Sync Header */}
      <View style={[globalStyles.rowBetween, styles.headerRow]}>
        <View>
          <Text style={styles.greetingSub}>WELCOME BACK</Text>
          <Text style={styles.greetingName}>{user ? user.displayName : 'Athlete'} 🔥</Text>
        </View>
        <TouchableOpacity style={styles.syncBadge} onPress={syncWearableData} disabled={isSyncing}>
          <IconWatch size={16} color={colors.primary} />
          <Text style={styles.syncText}>{isSyncing ? 'Syncing...' : 'Connected'}</Text>
        </TouchableOpacity>
      </View>

      {/* Goal Ring Hero Section */}
      <View style={styles.ringCard}>
        <GoalRing
          steps={metrics.steps}
          stepGoal={metrics.stepGoal}
          calories={metrics.calories}
          calGoal={metrics.calGoal}
          size={190}
          strokeWidth={14}
        />
        <View style={styles.ringLegend}>
          <View style={globalStyles.rowCenter}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Steps: {metrics.steps.toLocaleString()} / {metrics.stepGoal.toLocaleString()}</Text>
          </View>
          <View style={[globalStyles.rowCenter, { marginTop: 6 }]}>
            <View style={[styles.legendDot, { backgroundColor: colors.accentOrange }]} />
            <Text style={styles.legendText}>Active Calories: {metrics.calories} / {metrics.calGoal} kcal</Text>
          </View>
        </View>
      </View>

      {/* Metric Cards Grid */}
      <Text style={[globalStyles.sectionHeader, { marginTop: 8 }]}>Daily Performance</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.gridRow}>
          <MetricCard
            icon={<IconFootprints size={18} color={colors.secondary} />}
            title="Distance"
            value={metrics.distanceKm}
            unit="km"
            goal={8.0}
            progressColor={colors.secondary}
          />
          <MetricCard
            icon={<IconActivity size={18} color={colors.primary} />}
            title="Active Time"
            value={metrics.activeMinutes}
            unit="min"
            goal={metrics.activeMinGoal}
            progressColor={colors.primary}
          />
        </View>
        <View style={styles.gridRow}>
          <MetricCard
            icon={<IconHeart size={18} color={colors.accentPink} />}
            title="Heart Rate"
            value={metrics.heartRateBpm}
            unit="bpm"
            progressColor={colors.accentPink}
          />
          <MetricCard
            icon={<IconFlame size={18} color={colors.accentOrange} />}
            title="Burned"
            value={metrics.calories}
            unit="kcal"
            goal={metrics.calGoal}
            progressColor={colors.accentOrange}
          />
        </View>
      </View>

      {/* Quick Workout CTA */}
      <TouchableOpacity
        style={styles.workoutCta}
        onPress={() => navigation.navigate('Workouts')}>
        <View style={globalStyles.rowCenter}>
          <View style={styles.ctaIconBox}>
            <IconDumbbell size={24} color={colors.background} />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.ctaTitle}>Ready to Train?</Text>
            <Text style={styles.ctaSub}>Explore tailored workout routines & start a session</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Recent Activity Log */}
      <Text style={[globalStyles.sectionHeader, { marginTop: 20 }]}>Today's Sessions</Text>
      {completedWorkouts.length === 0 ? (
        <View style={styles.emptySessionBox}>
          <Text style={styles.emptySessionText}>No workouts logged yet today. Let's move!</Text>
        </View>
      ) : (
        completedWorkouts.map((item, idx) => (
          <View key={idx} style={[globalStyles.card, styles.sessionCard]}>
            <View style={globalStyles.rowCenter}>
              <View style={styles.sessionIconBox}>
                <IconDumbbell size={18} color={colors.accentPurple} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.sessionTitle}>{item.title}</Text>
                <Text style={styles.sessionSub}>{item.durationMinutes} mins • {item.caloriesBurn} kcal burned</Text>
              </View>
            </View>
            <Text style={styles.sessionTime}>Completed</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  ringCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  ringLegend: {
    marginTop: 18,
    width: '100%',
    paddingHorizontal: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  metricsGrid: {
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutCta: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 10,
  },
  ctaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ctaSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptySessionBox: {
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptySessionText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  sessionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sessionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sessionTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
});
