import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const MetricCard = ({ icon, title, value, unit, goal, progressColor = colors.primary }) => {
  const percent = goal ? Math.min(Math.round((value / goal) * 100), 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value.toLocaleString()}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {goal && (
        <View style={styles.goalContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: progressColor }]} />
          </View>
          <View style={styles.goalTextRow}>
            <Text style={styles.goalText}>{percent}% of goal</Text>
            <Text style={styles.goalTarget}>{goal.toLocaleString()} {unit}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 150,
    margin: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    marginLeft: 4,
  },
  goalContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  goalText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  goalTarget: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
