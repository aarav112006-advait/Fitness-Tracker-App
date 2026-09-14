import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';
import { FitnessContext } from '../context/FitnessContext';
import { AuthContext } from '../context/AuthContext';
import { IconFlame, IconHeart, IconShare } from '../components/Icons';

export const CommunityScreen = () => {
  const { user } = useContext(AuthContext);
  const { communityPosts, toggleCheerPost, addCommunityPost } = useContext(FitnessContext);
  const [showPostModal, setShowPostModal] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');

  const handleSharePost = () => {
    if (!workoutTitle) return;
    addCommunityPost({
      userName: user ? user.displayName : 'Athlete',
      avatar: '⚡',
      workoutTitle,
      metrics: { time: '45m', calories: '380 kcal', distance: '5.2 km' },
      badge: '🔥 Shared Session',
    });
    setWorkoutTitle('');
    setWorkoutNotes('');
    setShowPostModal(false);
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={globalStyles.screenPadding}>
        <View style={globalStyles.rowBetween}>
          <View>
            <Text style={globalStyles.title}>Community</Text>
            <Text style={[globalStyles.subtext, { marginBottom: 16 }]}>Cheer on friends and celebrate fitness milestones</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={() => setShowPostModal(true)}>
            <Text style={styles.shareBtnText}>+ Share</Text>
          </TouchableOpacity>
        </View>

        {communityPosts.map(post => (
          <View key={post.id} style={[globalStyles.card, styles.postCard]}>
            {/* Author Row */}
            <View style={globalStyles.rowBetween}>
              <View style={globalStyles.rowCenter}>
                <Text style={styles.authorAvatar}>{post.avatar}</Text>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.authorName}>{post.userName}</Text>
                  <Text style={styles.postTime}>{post.timeAgo}</Text>
                </View>
              </View>
              {post.badge && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{post.badge}</Text>
                </View>
              )}
            </View>

            {/* Workout Highlight */}
            <Text style={styles.postWorkoutTitle}>{post.workoutTitle}</Text>

            {/* Metric Pills */}
            <View style={styles.metricsRow}>
              {Object.entries(post.metrics).map(([k, val]) => (
                <View key={k} style={styles.metricPill}>
                  <Text style={styles.metricKey}>{k.toUpperCase()}: </Text>
                  <Text style={styles.metricVal}>{val}</Text>
                </View>
              ))}
            </View>

            {/* Action Bar */}
            <View style={styles.postActionBar}>
              <TouchableOpacity
                style={[styles.cheerBtn, post.hasCheered && styles.cheerBtnActive]}
                onPress={() => toggleCheerPost(post.id)}>
                <IconFlame size={16} color={post.hasCheered ? colors.accentOrange : colors.textMuted} />
                <Text style={[styles.cheerCount, post.hasCheered && { color: colors.accentOrange }]}>
                  {post.cheersCount} Cheers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareIconBtn}>
                <IconShare size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Share Workout Modal */}
      <Modal visible={showPostModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Your Workout</Text>
            <Text style={styles.modalSub}>Inspire your community with your latest session</Text>

            <TextInput
              style={styles.input}
              placeholder="Workout Title (e.g. 5K Morning Pace Run)"
              placeholderTextColor={colors.textMuted}
              value={workoutTitle}
              onChangeText={setWorkoutTitle}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="How did it feel? (Optional)"
              placeholderTextColor={colors.textMuted}
              multiline
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPostModal(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSharePost}>
                <Text style={styles.modalSubmitBtnText}>Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  shareBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 13,
  },
  postCard: {
    padding: 18,
  },
  authorAvatar: {
    fontSize: 24,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  postTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentOrange,
  },
  postWorkoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginVertical: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metricPill: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 6,
  },
  metricKey: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  postActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cheerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
  },
  cheerBtnActive: {
    backgroundColor: colors.accentOrangeGlow,
  },
  cheerCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  shareIconBtn: {
    padding: 6,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    color: colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: colors.background,
    fontWeight: '700',
  },
});
