import React, { createContext, useState, useEffect } from 'react';
import { googleFitService } from '../services/googleFitService';
import { mockWorkouts, mockChallenges, mockCommunityPosts } from '../data/mockData';

export const FitnessContext = createContext();

export const FitnessProvider = ({ children }) => {
  // Daily Metrics
  const [metrics, setMetrics] = useState({
    steps: 8420,
    stepGoal: 10000,
    calories: 540,
    calGoal: 700,
    distanceKm: 6.57,
    activeMinutes: 48,
    activeMinGoal: 60,
    heartRateBpm: 72,
    lastSyncTime: new Date(),
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [wearableConnected, setWearableConnected] = useState(true);

  // Active Workout State
  const [activeSession, setActiveSession] = useState(null);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);

  // Challenges & Community Feed
  const [challenges, setChallenges] = useState(mockChallenges);
  const [communityPosts, setCommunityPosts] = useState(mockCommunityPosts);

  // Sync with Google Fit or Simulated Sensors
  const syncWearableData = async () => {
    setIsSyncing(true);
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      await googleFitService.authorize();
      const steps = await googleFitService.getDailySteps(startOfDay, now);
      const calories = await googleFitService.getDailyCalories(startOfDay, now);
      const distance = await googleFitService.getDailyDistance(startOfDay, now);
      const hrSamples = await googleFitService.getHeartRateSamples(startOfDay, now);
      const latestHr = hrSamples.length > 0 ? hrSamples[hrSamples.length - 1].value : 72;

      setMetrics(prev => ({
        ...prev,
        steps: steps || prev.steps,
        calories: calories || prev.calories,
        distanceKm: distance || prev.distanceKm,
        heartRateBpm: latestHr,
        lastSyncTime: new Date(),
      }));
      setWearableConnected(true);
    } catch (err) {
      console.warn('Wearable sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncWearableData();
  }, []);

  // Workout Session Handlers
  const startWorkout = (workoutPlan) => {
    setActiveSession({
      workoutPlan,
      startTime: new Date(),
      elapsedSeconds: 0,
      completedSets: {},
      isPaused: false,
    });
  };

  const togglePauseWorkout = () => {
    if (!activeSession) return;
    setActiveSession(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const toggleSetComplete = (exerciseIdx, setIdx) => {
    if (!activeSession) return;
    const key = `${exerciseIdx}_${setIdx}`;
    setActiveSession(prev => ({
      ...prev,
      completedSets: {
        ...prev.completedSets,
        [key]: !prev.completedSets[key],
      },
    }));
  };

  const finishWorkout = () => {
    if (!activeSession) return;
    const finishedWorkout = {
      id: 'session_' + Date.now(),
      title: activeSession.workoutPlan.title,
      durationMinutes: Math.max(Math.round(activeSession.elapsedSeconds / 60), 1),
      caloriesBurn: activeSession.workoutPlan.caloriesBurn,
      completedAt: new Date().toISOString(),
    };
    setCompletedWorkouts(prev => [finishedWorkout, ...prev]);
    // Boost calories and active minutes in daily summary
    setMetrics(prev => ({
      ...prev,
      calories: prev.calories + finishedWorkout.caloriesBurn,
      activeMinutes: prev.activeMinutes + finishedWorkout.durationMinutes,
    }));
    setActiveSession(null);
  };

  const cancelWorkout = () => {
    setActiveSession(null);
  };

  // Challenges Handlers
  const toggleJoinChallenge = (challengeId) => {
    setChallenges(prev =>
      prev.map(c => {
        if (c.id === challengeId) {
          const nextJoined = !c.joined;
          return {
            ...c,
            joined: nextJoined,
            participants: nextJoined ? c.participants + 1 : c.participants - 1,
          };
        }
        return c;
      })
    );
  };

  // Community Cheer / Like Handler
  const toggleCheerPost = (postId) => {
    setCommunityPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const hasCheered = post.hasCheered;
          return {
            ...post,
            hasCheered: !hasCheered,
            cheersCount: hasCheered ? post.cheersCount - 1 : post.cheersCount + 1,
          };
        }
        return post;
      })
    );
  };

  const addCommunityPost = (postData) => {
    const newPost = {
      id: 'post_' + Date.now(),
      timeAgo: 'Just now',
      cheersCount: 0,
      hasCheered: false,
      ...postData,
    };
    setCommunityPosts(prev => [newPost, ...prev]);
  };

  return (
    <FitnessContext.Provider
      value={{
        metrics,
        isSyncing,
        wearableConnected,
        syncWearableData,
        workouts: mockWorkouts,
        completedWorkouts,
        activeSession,
        startWorkout,
        togglePauseWorkout,
        toggleSetComplete,
        finishWorkout,
        cancelWorkout,
        challenges,
        toggleJoinChallenge,
        communityPosts,
        toggleCheerPost,
        addCommunityPost,
      }}>
      {children}
    </FitnessContext.Provider>
  );
};
