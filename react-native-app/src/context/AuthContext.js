import React, { createContext, useState, useEffect } from 'react';
import { firebaseAuth, firestoreService } from '../services/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    uid: 'athlete_demo_001',
    email: 'athlete@trackfit.io',
    displayName: 'Aarav Patel',
    bio: 'Marathon trainee & hybrid athlete 🏃‍♂️🏋️‍♂️',
    weightKg: 72,
    heightCm: 178,
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await firebaseAuth.signInWithEmailAndPassword(email, password);
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0],
      });
      return true;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: displayName || email.split('@')[0],
      });
      return true;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await firebaseAuth.signOut();
    setUser(null);
  };

  const quickDemoLogin = () => {
    setUser({
      uid: 'athlete_demo_001',
      email: 'athlete@trackfit.io',
      displayName: 'Aarav Patel',
      bio: 'Marathon trainee & hybrid athlete 🏃‍♂️🏋️‍♂️',
      weightKg: 72,
      heightCm: 178,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        register,
        logout,
        quickDemoLogin,
        isAuthenticated: Boolean(user),
      }}>
      {children}
    </AuthContext.Provider>
  );
};
