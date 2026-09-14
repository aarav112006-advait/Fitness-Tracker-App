import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';
import { FitnessContext } from '../context/FitnessContext';
import { IconTrophy, IconUsers } from '../components/Icons';

export const ChallengesScreen = () => {
  const { challenges, toggleJoinChallenge } = useContext(FitnessContext);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={globalStyles.screenPadding}>
        <Text style={globalStyles.title}>Community Challenges</Text>
        <Text style={[globalStyles.subtext, { marginBottom: 16 }]}>Push your boundaries and compete with athletes worldwide</Text>

        {challenges.map(item => {
          const percent = Math.min(Math.round((item.progress / item.target) * 100), 100);

          return (
            <View key={item.id} style={[globalStyles.card, styles.challengeCard]}>
              <View style={globalStyles.rowBetween}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <Text style={styles.daysLeftText}>{item.daysLeft} days left</Text>
              </View>

              <Text style={styles.challengeTitle}>{item.title}</Text>
              
              <View style={[globalStyles.rowCenter, { marginTop: 6 }]}>
                <IconUsers size={14} color={colors.textMuted} />
                <Text style={styles.participantsText}>{item.participants.toLocaleString()} Athletes joined</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressBackground}>
                  <View style={[styles.progressFill, { width: `${percent}%` }]} />
                </View>
                <View style={globalStyles.rowBetween}>
                  <Text style={styles.progressValue}>
                    {item.progress} / {item.target} {item.unit} ({percent}%)
                  </Text>
                  {item.userRank && (
                    <Text style={styles.userRankText}>Rank #{item.userRank}</Text>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, item.joined ? styles.leaveBtn : styles.joinBtn]}
                  onPress={() => toggleJoinChallenge(item.id)}>
                  <Text style={[styles.actionBtnText, item.joined ? styles.leaveBtnText : styles.joinBtnText]}>
                    {item.joined ? 'Joined ✓' : 'Join Challenge'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.leaderboardBtn}
                  onPress={() => setSelectedLeaderboard(item)}>
                  <IconTrophy size={16} color={colors.warning} />
                  <Text style={styles.leaderboardBtnText}>Leaderboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Leaderboard Modal */}
      <Modal visible={Boolean(selectedLeaderboard)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedLeaderboard && (
              <>
                <View style={globalStyles.rowCenter}>
                  <IconTrophy size={24} color={colors.warning} />
                  <Text style={[styles.modalTitle, { marginLeft: 10 }]}>{selectedLeaderboard.title}</Text>
                </View>
                <Text style={styles.modalSub}>Leaderboard Rankings</Text>

                <View style={styles.rankingsList}>
                  {selectedLeaderboard.leaderboard.map(rankItem => (
                    <View key={rankItem.rank} style={[styles.rankRow, rankItem.name === 'You' && styles.rankRowYou]}>
                      <View style={globalStyles.rowCenter}>
                        <Text style={styles.rankNumber}>#{rankItem.rank}</Text>
                        <Text style={styles.rankAvatar}>{rankItem.avatar}</Text>
                        <Text style={[styles.rankName, rankItem.name === 'You' && { color: colors.primary }]}>
                          {rankItem.name}
                        </Text>
                      </View>
                      <Text style={styles.rankScore}>{rankItem.score}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedLeaderboard(null)}>
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  challengeCard: {
    padding: 18,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  daysLeftText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  challengeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  participantsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  progressSection: {
    marginVertical: 14,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  userRankText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  joinBtn: {
    backgroundColor: colors.primary,
  },
  joinBtnText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  leaveBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  leaveBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  leaderboardBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  rankingsList: {
    marginBottom: 16,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankRowYou: {
    backgroundColor: colors.primaryGlow,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 32,
  },
  rankAvatar: {
    fontSize: 18,
    marginRight: 8,
  },
  rankName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rankScore: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modalCloseBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
