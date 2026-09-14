import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';
import { FitnessContext } from '../context/FitnessContext';
import { IconDumbbell, IconFlame, IconPlay, IconPause, IconCheck } from '../components/Icons';

export const WorkoutsScreen = () => {
  const { workouts, activeSession, startWorkout, togglePauseWorkout, toggleSetComplete, finishWorkout, cancelWorkout } = useContext(FitnessContext);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Active workout timer
  useEffect(() => {
    let interval = null;
    if (activeSession && !activeSession.isPaused) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
        activeSession.elapsedSeconds += 1;
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeSession, activeSession?.isPaused]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={globalStyles.screenPadding}>
        <Text style={globalStyles.title}>Workouts</Text>
        <Text style={[globalStyles.subtext, { marginBottom: 16 }]}>Explore targeted routines or track live sets</Text>

        {/* Active Session Sticky Banner if workout in progress */}
        {activeSession && (
          <View style={styles.activeBanner}>
            <View style={globalStyles.rowBetween}>
              <View>
                <Text style={styles.activeTag}>WORKOUT IN PROGRESS</Text>
                <Text style={styles.activeTitle}>{activeSession.workoutPlan.title}</Text>
                <Text style={styles.activeTimer}>{formatTime(timerSeconds)}</Text>
              </View>
              <View style={globalStyles.rowCenter}>
                <TouchableOpacity style={styles.timerBtn} onPress={togglePauseWorkout}>
                  {activeSession.isPaused ? <IconPlay size={18} color="#FFF" /> : <IconPause size={18} color="#FFF" />}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.timerBtn, { backgroundColor: colors.primary, marginLeft: 8 }]} onPress={finishWorkout}>
                  <IconCheck size={20} color={colors.background} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Exercise Set Checklist */}
            <View style={styles.exerciseSetContainer}>
              <Text style={styles.exerciseSetHeader}>Reps & Sets Tracker</Text>
              {activeSession.workoutPlan.exercises.map((ex, exIdx) => (
                <View key={exIdx} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <View style={styles.setRow}>
                    {Array.from({ length: ex.sets }).map((_, setIdx) => {
                      const key = `${exIdx}_${setIdx}`;
                      const isDone = activeSession.completedSets[key];
                      return (
                        <TouchableOpacity
                          key={setIdx}
                          style={[styles.setBubble, isDone && styles.setBubbleDone]}
                          onPress={() => toggleSetComplete(exIdx, setIdx)}>
                          <Text style={[styles.setText, isDone && styles.setTextDone]}>
                            {setIdx + 1}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelLink} onPress={cancelWorkout}>
              <Text style={styles.cancelLinkText}>Discard Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Workout Catalog */}
        <Text style={[globalStyles.sectionHeader, { marginTop: activeSession ? 20 : 0 }]}>Curated Plans</Text>
        {workouts.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[globalStyles.card, styles.workoutCard]}
            onPress={() => setSelectedWorkout(item)}>
            <View style={globalStyles.rowBetween}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            <Text style={styles.workoutPlanTitle}>{item.title}</Text>
            <View style={[globalStyles.rowCenter, styles.workoutMeta]}>
              <Text style={styles.metaText}>{item.duration} Mins</Text>
              <Text style={styles.metaDot}>•</Text>
              <View style={globalStyles.rowCenter}>
                <IconFlame size={14} color={colors.accentOrange} />
                <Text style={[styles.metaText, { marginLeft: 4 }]}>{item.caloriesBurn} kcal</Text>
              </View>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{item.exercises.length} Exercises</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Routine Detail Modal */}
      <Modal visible={Boolean(selectedWorkout)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedWorkout && (
              <>
                <Text style={styles.modalCategory}>{selectedWorkout.category}</Text>
                <Text style={styles.modalTitle}>{selectedWorkout.title}</Text>
                <Text style={styles.modalSub}>{selectedWorkout.duration} mins • {selectedWorkout.caloriesBurn} kcal burn</Text>

                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalSectionTitle}>Exercise Breakdown</Text>
                  {selectedWorkout.exercises.map((ex, idx) => (
                    <View key={idx} style={styles.modalExerciseCard}>
                      <Text style={styles.modalExName}>{idx + 1}. {ex.name}</Text>
                      <Text style={styles.modalExDetail}>
                        {ex.sets} sets {ex.reps ? `× ${ex.reps} reps` : `• ${ex.durationSec}s hold`} (Rest: {ex.restSec}s)
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedWorkout(null)}>
                    <Text style={styles.modalCloseBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalStartBtn}
                    onPress={() => {
                      const plan = selectedWorkout;
                      setSelectedWorkout(null);
                      setTimerSeconds(0);
                      startWorkout(plan);
                    }}>
                    <Text style={styles.modalStartBtnText}>Start Training</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  workoutCard: {
    padding: 18,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 240, 118, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  workoutPlanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
  },
  workoutMeta: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaDot: {
    marginHorizontal: 8,
    color: colors.textMuted,
  },
  activeBanner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 20,
  },
  activeTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  activeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  activeTimer: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  timerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseSetContainer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exerciseSetHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  setRow: {
    flexDirection: 'row',
  },
  setBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  setBubbleDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  setText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  setTextDone: {
    color: colors.background,
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  cancelLinkText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  modalSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  modalExerciseCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  modalExName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalExDetail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCloseBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCloseBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  modalStartBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalStartBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
});
