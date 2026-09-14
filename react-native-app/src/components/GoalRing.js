import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

export const GoalRing = ({ size = 180, strokeWidth = 14, steps = 8420, stepGoal = 10000, calories = 520, calGoal = 700 }) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const stepPercent = Math.min(steps / stepGoal, 1);
  const stepStrokeDashoffset = circumference - stepPercent * circumference;

  const calRadius = radius - strokeWidth - 4;
  const calCircumference = 2 * Math.PI * calRadius;
  const calPercent = Math.min(calories / calGoal, 1);
  const calStrokeDashoffset = calCircumference - calPercent * calCircumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Step Ring Background */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceHighlight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Step Ring Progress */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={stepStrokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* Calories Ring Background */}
        <Circle
          cx={center}
          cy={center}
          r={calRadius}
          stroke={colors.surfaceHighlight}
          strokeWidth={strokeWidth - 2}
          fill="none"
        />
        {/* Calories Ring Progress */}
        <Circle
          cx={center}
          cy={center}
          r={calRadius}
          stroke={colors.accentOrange}
          strokeWidth={strokeWidth - 2}
          strokeDasharray={`${calCircumference} ${calCircumference}`}
          strokeDashoffset={calStrokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.centerTextContainer}>
        <Text style={styles.centerValue}>{steps.toLocaleString()}</Text>
        <Text style={styles.centerLabel}>STEPS</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
});
