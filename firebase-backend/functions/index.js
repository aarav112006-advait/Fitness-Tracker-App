const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * 1. onUserCreate
 * Auth Trigger: Triggered when a new user signs up via Firebase Authentication.
 * Initializes default user document, starter fitness goals, streak records,
 * and assigns a default 4-week starter workout plan.
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;
  const userRef = db.collection("users").doc(uid);

  const defaultStarterPlanId = "starter_full_body_foundation";

  const initialUserData = {
    uid,
    email: email || "",
    displayName: displayName || "Athlete",
    photoURL: photoURL || "",
    bio: "Ready to conquer my fitness goals!",
    role: "user",
    fitnessLevel: "beginner",
    dailyGoals: {
      steps: 10000,
      calories: 500,
      activeMinutes: 45,
      waterMl: 2500,
    },
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 50, // Welcome bonus
    activeWorkoutPlanId: defaultStarterPlanId,
    badges: ["welcome_onboard"],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const starterPlanRef = db.collection("workout_plans").doc(defaultStarterPlanId);

  try {
    const batch = db.batch();
    batch.set(userRef, initialUserData);

    // Create a starter notification
    const notificationRef = userRef.collection("notifications").doc();
    batch.set(notificationRef, {
      title: "Welcome to Fitness Tracker!",
      message: "Your profile has been created with a 4-week starter plan. Start logging your workouts today!",
      type: "system_welcome",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Ensure default starter plan document exists
    const starterPlanDoc = await starterPlanRef.get();
    if (!starterPlanDoc.exists) {
      batch.set(starterPlanRef, {
        planId: defaultStarterPlanId,
        creatorId: "system",
        title: "4-Week Full Body Foundation",
        description: "A balanced starter program for building healthy daily exercise habits.",
        difficulty: "beginner",
        durationWeeks: 4,
        isPublic: true,
        enrolledCount: 1,
        weeklySchedule: [
          { day: "Monday", focus: "Upper Body & Core", durationMinutes: 30 },
          { day: "Wednesday", focus: "Lower Body & Mobility", durationMinutes: 35 },
          { day: "Friday", focus: "Full Body HIIT", durationMinutes: 25 },
          { day: "Sunday", focus: "Active Recovery & Stretching", durationMinutes: 20 },
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      batch.update(starterPlanRef, {
        enrolledCount: admin.firestore.FieldValue.increment(1),
      });
    }

    await batch.commit();
    functions.logger.info(`Successfully initialized user profile for UID: ${uid}`);
  } catch (error) {
    functions.logger.error(`Error in onUserCreate for UID: ${uid}`, error);
    throw error;
  }
});

/**
 * 2. onDailyMetricsLogged
 * Firestore Trigger: Triggered when daily metrics are created or updated.
 * Recalculates user activity streaks (consecutive days) and aggregates
 * metrics toward active community challenges.
 */
exports.onDailyMetricsLogged = functions.firestore
  .document("daily_metrics/{metricId}")
  .onWrite(async (change, context) => {
    // If deleted, no action
    if (!change.after.exists) {
      return null;
    }

    const metricData = change.after.data();
    const { userId, date, steps = 0, caloriesBurned = 0, activeMinutes = 0 } = metricData;

    if (!userId || !date) {
      functions.logger.warn("daily_metrics write missing userId or date", context.params.metricId);
      return null;
    }

    const userRef = db.collection("users").doc(userId);

    try {
      // --- A. Recalculate Daily Streak ---
      // Check yesterday's metric
      const currentDateObj = new Date(date);
      const yesterdayDateObj = new Date(currentDateObj);
      yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
      const yesterdayStr = yesterdayDateObj.toISOString().split("T")[0];

      const yesterdayMetricSnapshot = await db
        .collection("daily_metrics")
        .where("userId", "==", userId)
        .where("date", "==", yesterdayStr)
        .limit(1)
        .get();

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) return;

        const userData = userDoc.data();
        let currentStreak = userData.currentStreak || 0;
        let longestStreak = userData.longestStreak || 0;

        if (!yesterdayMetricSnapshot.empty) {
          // Continuous streak
          currentStreak += 1;
        } else {
          // Reset streak to 1 if starting fresh or missed a day
          currentStreak = 1;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }

        transaction.update(userRef, {
          currentStreak,
          longestStreak,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // --- B. Update Active Challenges Progress ---
      const participantsQuery = await db
        .collection("challenge_participants")
        .where("userId", "==", userId)
        .where("completed", "==", false)
        .get();

      if (participantsQuery.empty) {
        return null;
      }

      const batch = db.batch();

      for (const participantDoc of participantsQuery.docs) {
        const participant = participantDoc.data();
        const challengeRef = db.collection("challenges").doc(participant.challengeId);
        const challengeDoc = await challengeRef.get();

        if (!challengeDoc.exists) continue;
        const challenge = challengeDoc.data();

        if (challenge.status !== "active") continue;

        let incrementalValue = 0;
        if (challenge.category === "steps") {
          incrementalValue = steps;
        } else if (challenge.category === "calories") {
          incrementalValue = caloriesBurned;
        } else if (challenge.category === "active_minutes") {
          incrementalValue = activeMinutes;
        }

        if (incrementalValue <= 0) continue;

        const newProgress = (participant.currentProgress || 0) + incrementalValue;
        const targetGoal = challenge.targetGoal || 1;
        const progressPercent = Math.min(100, Math.round((newProgress / targetGoal) * 100));
        const isGoalMet = newProgress >= targetGoal;

        const updatePayload = {
          currentProgress: newProgress,
          progressPercent,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (isGoalMet) {
          updatePayload.completed = true;
          updatePayload.completedAt = admin.firestore.FieldValue.serverTimestamp();

          // Award points and badges to the user
          batch.update(userRef, {
            totalPoints: admin.firestore.FieldValue.increment(challenge.pointsReward || 100),
            badges: admin.firestore.FieldValue.arrayUnion(challenge.badgeAwarded || "challenge_finisher"),
          });

          // Post achievement to social feed
          const socialPostRef = db.collection("social_posts").doc();
          batch.set(socialPostRef, {
            postId: socialPostRef.id,
            authorId: userId,
            authorName: participant.displayName || "Athlete",
            authorPhoto: participant.photoURL || "",
            postType: "challenge_completed",
            content: `🎉 I just completed the "${challenge.title}" challenge! Earned ${challenge.pointsReward || 100} points!`,
            linkedChallengeId: challenge.challengeId,
            likes: [],
            likesCount: 0,
            commentsCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        batch.update(participantDoc.ref, updatePayload);
      }

      await batch.commit();
      functions.logger.info(`Updated metrics and challenge progress for User: ${userId}`);
    } catch (error) {
      functions.logger.error(`Error in onDailyMetricsLogged for ${context.params.metricId}`, error);
      throw error;
    }
  });

/**
 * 3. updateChallengeLeaderboards
 * Scheduled Function: Runs periodically (e.g. every hour via Pub/Sub)
 * Ranks participants in active challenges, builds cached leaderboard documents,
 * and generates global weekly points leaderboards.
 */
exports.updateChallengeLeaderboards = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async (context) => {
    functions.logger.info("Executing periodic challenge leaderboard update...");

    try {
      const activeChallengesQuery = await db
        .collection("challenges")
        .where("status", "==", "active")
        .get();

      if (activeChallengesQuery.empty) {
        functions.logger.info("No active challenges to rank.");
        return null;
      }

      const batch = db.batch();

      for (const challengeDoc of activeChallengesQuery.docs) {
        const challenge = challengeDoc.data();
        const challengeId = challenge.challengeId;

        // Fetch top 50 participants by progress
        const topParticipantsSnapshot = await db
          .collection("challenge_participants")
          .where("challengeId", "==", challengeId)
          .orderBy("currentProgress", "desc")
          .limit(50)
          .get();

        let rank = 1;
        const rankings = [];

        topParticipantsSnapshot.forEach((doc) => {
          const data = doc.data();
          rankings.push({
            rank: rank++,
            userId: data.userId,
            displayName: data.displayName || "Anonymous Athlete",
            photoURL: data.photoURL || "",
            currentProgress: data.currentProgress || 0,
            progressPercent: data.progressPercent || 0,
            completed: data.completed || false,
          });
        });

        const leaderboardRef = db.collection("leaderboard").doc(`challenge_${challengeId}`);
        batch.set(leaderboardRef, {
          leaderboardId: `challenge_${challengeId}`,
          category: challenge.category || "general",
          timeframe: "challenge",
          challengeId,
          challengeTitle: challenge.title,
          totalContenders: challenge.participantCount || rankings.length,
          rankings,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Also compute a global top 20 points leaderboard
      const topUsersSnapshot = await db
        .collection("users")
        .orderBy("totalPoints", "desc")
        .limit(20)
        .get();

      let globalRank = 1;
      const globalRankings = [];
      topUsersSnapshot.forEach((doc) => {
        const u = doc.data();
        globalRankings.push({
          rank: globalRank++,
          userId: u.uid,
          displayName: u.displayName || "Athlete",
          photoURL: u.photoURL || "",
          score: u.totalPoints || 0,
          currentStreak: u.currentStreak || 0,
        });
      });

      const globalLeaderboardRef = db.collection("leaderboard").doc("global_points_all_time");
      batch.set(globalLeaderboardRef, {
        leaderboardId: "global_points_all_time",
        category: "points",
        timeframe: "all_time",
        rankings: globalRankings,
        totalContenders: globalRankings.length,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
      functions.logger.info("Successfully updated challenge and global leaderboards.");
    } catch (error) {
      functions.logger.error("Error in updateChallengeLeaderboards", error);
      throw error;
    }
  });

/**
 * 4. onSocialPostCreated
 * Firestore Trigger: Triggered when a new social post is published.
 * If the post represents a workout milestone or challenge completion,
 * fan out notifications to friends and challenge peers.
 */
exports.onSocialPostCreated = functions.firestore
  .document("social_posts/{postId}")
  .onCreate(async (snap, context) => {
    const postData = snap.data();
    const { authorId, authorName, postType, linkedChallengeId, content } = postData;

    // Only dispatch peer alerts for milestones or challenge completions
    if (postType !== "milestone" && postType !== "challenge_completed") {
      return null;
    }

    try {
      let recipientUserIds = new Set();

      // If linked to a challenge, notify other participants in the same challenge
      if (linkedChallengeId) {
        const peersSnapshot = await db
          .collection("challenge_participants")
          .where("challengeId", "==", linkedChallengeId)
          .limit(25)
          .get();

        peersSnapshot.forEach((doc) => {
          const peer = doc.data();
          if (peer.userId && peer.userId !== authorId) {
            recipientUserIds.add(peer.userId);
          }
        });
      }

      if (recipientUserIds.size === 0) {
        return null;
      }

      const batch = db.batch();

      recipientUserIds.forEach((recipientId) => {
        const notifRef = db.collection("users").doc(recipientId).collection("notifications").doc();
        batch.set(notifRef, {
          title: "Community Milestone!",
          message: `${authorName || "A peer"} shared an achievement: "${content.substring(0, 80)}"`,
          type: "peer_achievement",
          linkedPostId: snap.id,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      functions.logger.info(`Dispatched peer notifications for social post: ${snap.id}`);
    } catch (error) {
      functions.logger.error(`Error in onSocialPostCreated for post: ${snap.id}`, error);
      throw error;
    }
  });

/**
 * 5. joinChallenge
 * Callable HTTPS Function: Safely enrolls a user into an active challenge
 * with quota validation and atomic participant count incrementing.
 */
exports.joinChallenge = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication is required to join a community challenge."
    );
  }

  const userId = context.auth.uid;
  const { challengeId } = data;

  if (!challengeId || typeof challengeId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid challengeId must be provided."
    );
  }

  const challengeRef = db.collection("challenges").doc(challengeId);
  const participantRef = db.collection("challenge_participants").doc(`${challengeId}_${userId}`);
  const userRef = db.collection("users").doc(userId);

  return await db.runTransaction(async (transaction) => {
    const [challengeDoc, participantDoc, userDoc] = await Promise.all([
      transaction.get(challengeRef),
      transaction.get(participantRef),
      transaction.get(userRef),
    ]);

    if (!challengeDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Challenge does not exist.");
    }

    const challenge = challengeDoc.data();

    // Check challenge state
    if (challenge.status !== "active") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Cannot join challenge with status: ${challenge.status}. Only active challenges can be joined.`
      );
    }

    // Check if already enrolled
    if (participantDoc.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        "You are already enrolled in this challenge."
      );
    }

    // Check quota / max participants
    const currentCount = challenge.participantCount || 0;
    if (challenge.maxParticipants && currentCount >= challenge.maxParticipants) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "This challenge has reached its maximum participant capacity."
      );
    }

    const userData = userDoc.exists ? userDoc.data() : {};

    // Create participant record
    transaction.set(participantRef, {
      id: `${challengeId}_${userId}`,
      challengeId,
      userId,
      displayName: userData.displayName || "Athlete",
      photoURL: userData.photoURL || "",
      currentProgress: 0,
      progressPercent: 0,
      completed: false,
      completedAt: null,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Atomically increment participant count
    transaction.update(challengeRef, {
      participantCount: admin.firestore.FieldValue.increment(1),
    });

    return {
      success: true,
      message: `Successfully enrolled in "${challenge.title}"!`,
      challengeId,
      participantCount: currentCount + 1,
    };
  });
});
