# ⚡ TrackFit - React Native Fitness & Workout Tracking Application

A high-performance, athletic dark-mode fitness tracking mobile application built with **React Native**, **React Navigation**, **Firebase Auth & Firestore**, and a modular **Google Fit / Health Connect API** abstraction layer with automated simulator fallback.

---

## 📱 Features

1. **Dashboard & Daily Goal Rings**:
   - Multi-ring circular visualizer for Steps and Active Calories.
   - Live metrics grid: Distance (km), Active Minutes, Heart Rate (bpm), and Burned Calories.
   - Wearable sync banner with manual sync trigger.

2. **Workouts & Live Session Tracker**:
   - Curated workout plans library (HIIT, Strength, Mobility).
   - Routine breakdown with exercise lists, target sets, and reps.
   - Live active session logger featuring timer, set-by-set completion checkboxes, and calorie burn tracking.

3. **Community Challenges & Streaks**:
   - Distance runs, daily step streaks, and core challenge modules.
   - Interactive join/leave toggles and live personal rank tracking.
   - Leaderboard drawer modal showing athlete rankings.

4. **Social Community Feed**:
   - Activity feed displaying peer workout completions and milestone badges.
   - Interactive cheer/fire reactions.
   - Modal for posting custom workout achievements.

5. **Profile & Device Manager**:
   - Biometric details, lifetime statistics, and trophy case badges.
   - Wearable hardware connection status manager (Google Fit / Health Connect).

6. **Authentication**:
   - Firebase Auth integration with email/password registration and sign-in.
   - Instant 1-click Demo Athlete login for immediate evaluation on simulators and web.

---

## 🛠 Tech Stack

- **Framework**: React Native (v0.72+)
- **Navigation**: React Navigation v6 (Bottom Tabs & Native Stack)
- **Backend & Auth**: Firebase SDK (`@react-native-firebase/app`, `auth`, `firestore`)
- **Health Metrics**: Google Fit API (`react-native-google-fit` / Health Connect abstraction with automated sensor simulator fallback)
- **Graphics**: `react-native-svg` zero-dependency athletic vector icons
- **Styling**: Athletic dark-mode design system with neon accents

---

## 🚀 Setup & Build Instructions

### Prerequisites
- Node.js (>= 18)
- Android Studio & Android SDK (for Android builds) or Xcode & CocoaPods (for iOS builds)
- Google Cloud Console Project (for Google Fit OAuth credentials)
- Firebase Project Console

---

### 1. Installation

```bash
cd fitness-tracker-app/react-native-app
npm install
```

### 2. Firebase Configuration

#### Android Setup:
1. In your Firebase Console, register an Android app with package name `com.trackfit.fitnessapp`.
2. Download `google-services.json` and place it in `android/app/google-services.json`.
3. In `android/build.gradle`, verify:
   ```gradle
   buildscript {
     dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
     }
   }
   ```
4. In `android/app/build.gradle`, append:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

#### iOS Setup:
1. In your Firebase Console, register an iOS app with bundle ID `com.trackfit.fitnessapp`.
2. Download `GoogleService-Info.plist` and add it to your Xcode project root via Xcode.
3. Install CocoaPods dependencies:
   ```bash
   cd ios && pod install && cd ..
   ```

---

### 3. Google Fit OAuth Setup

1. In the Google Cloud Console, enable the **Fitness API**.
2. Under **APIs & Services > Credentials**, create an **OAuth 2.0 Client ID**:
   - Type: Android
   - Package name: `com.trackfit.fitnessapp`
   - SHA-1 fingerprint: Obtain via `cd android && ./gradlew signingReport`
3. The app's `googleFitService.js` automatically requests scopes:
   - `FITNESS_ACTIVITY_READ`
   - `FITNESS_BODY_READ`
   - `FITNESS_LOCATION_READ`
4. **Simulator Mode**: If running in an emulator or environment without Google Play Services / Google Fit, `googleFitService.js` seamlessly detects this and provides realistic simulated sensor data so all UI elements and flows can be previewed without hardware dependencies.

---

### 4. Running the App

```bash
# Start Metro bundler
npm start

# Run on Android emulator / connected device
npm run android

# Run on iOS simulator
npm run ios
```
