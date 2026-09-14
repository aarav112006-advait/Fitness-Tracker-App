// Firebase Service Abstraction
// Gracefully handles both native @react-native-firebase and mock fallback for web/simulator testing
let authModule = null;
let firestoreModule = null;

try {
  authModule = require('@react-native-firebase/auth').default;
  firestoreModule = require('@react-native-firebase/firestore').default;
} catch (e) {
  // Simulator or development without native linking
}

export const isFirebaseAvailable = () => Boolean(authModule && firestoreModule);

export const firebaseAuth = {
  signInWithEmailAndPassword: async (email, password) => {
    if (authModule) {
      return await authModule().signInWithEmailAndPassword(email, password);
    }
    // Mock authentication
    return {
      user: {
        uid: 'demo_user_123',
        email,
        displayName: email.split('@')[0] || 'Athlete',
      },
    };
  },
  createUserWithEmailAndPassword: async (email, password) => {
    if (authModule) {
      return await authModule().createUserWithEmailAndPassword(email, password);
    }
    return {
      user: {
        uid: 'demo_user_' + Date.now(),
        email,
        displayName: email.split('@')[0],
      },
    };
  },
  signOut: async () => {
    if (authModule) {
      return await authModule().signOut();
    }
    return true;
  },
};

export const firestoreService = {
  getUserProfile: async (uid) => {
    if (firestoreModule) {
      const doc = await firestoreModule().collection('users').doc(uid).get();
      return doc.exists ? doc.data() : null;
    }
    return null;
  },
  saveWorkoutSession: async (uid, workoutData) => {
    if (firestoreModule) {
      return await firestoreModule().collection('workouts').add({
        userId: uid,
        ...workoutData,
        createdAt: firestoreModule.FieldValue.serverTimestamp(),
      });
    }
    return { id: 'mock_workout_' + Date.now(), ...workoutData };
  },
  logDailyMetrics: async (uid, dateStr, metrics) => {
    if (firestoreModule) {
      return await firestoreModule().collection('metrics').doc(`${uid}_${dateStr}`).set(metrics, { merge: true });
    }
    return true;
  },
};
