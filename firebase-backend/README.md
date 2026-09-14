# 🏋️‍♂️ Fitness Tracker App — Firebase Backend & Cloud Services

Production-ready Firebase backend configuration, security rules, composite indexing, schema specifications, and Cloud Functions for the Fitness Tracking Application.

---

## 📁 Repository Structure

```text
firebase-backend/
├── firebase.json              # Firebase project configuration (Firestore, Functions, Storage, Emulators)
├── firestore.rules            # Granular security rules for all collections
├── firestore.indexes.json      # Composite & collection group indexing definitions
├── storage.rules              # Cloud Storage security rules for avatars & progress media
├── schema_reference.md        # Comprehensive Firestore document schema specifications
├── functions/                 # Node.js Firebase Cloud Functions
│   ├── package.json           # Dependencies (firebase-admin, firebase-functions)
│   ├── .env.example           # Configuration template
│   └── index.js               # Auth triggers, Firestore triggers, Pub/Sub, & Callables
└── README.md                  # Setup, testing, and deployment guide
```

---

## ⚡ Cloud Functions Overview

| Function Name | Type | Trigger | Purpose |
|---|---|---|---|
| `onUserCreate` | Auth Trigger | `auth.user().onCreate` | Creates `users/{uid}`, seeds starter daily goals, streak counters, and assigns the default 4-week starter workout plan. |
| `onDailyMetricsLogged` | Firestore Trigger | `daily_metrics/{id}.onWrite` | Recalculates consecutive daily streaks and increments progress for all enrolled active community challenges. Awards badges & points upon completion. |
| `updateChallengeLeaderboards` | Scheduled Pub/Sub | Every 60 minutes | Aggregates top contenders across active challenges and generates a cached leaderboard document (`leaderboard/challenge_{id}`) and global points ranking. |
| `onSocialPostCreated` | Firestore Trigger | `social_posts/{id}.onCreate` | Detects workout milestone completions and notifies challenge peers and community followers. |
| `joinChallenge` | HTTPS Callable | `https.onCall` | Atomic transaction verifying challenge status, expiration, and participant capacity before enrolling a user. |

---

## 🔒 Security Architecture

1. **Role-Based Access Control (RBAC)**:
   - Client writes are restricted to documents where `request.auth.uid == resource.data.userId`.
   - Critical gamification attributes (`totalPoints`, `level`, `badges`) are shielded from client manipulation and can only be modified via Cloud Functions using the Firebase Admin SDK.
2. **Leaderboard Integrity**:
   - Direct client writes to `/leaderboard/*` are forbidden (`allow write: if isAdmin()`). All ranking calculations execute server-side.
3. **Storage Sanitization**:
   - File size caps (5MB for avatars, 15MB for workout clips) and strict MIME type matching `(image|video)/.*`.
4. **Race-Condition Protection**:
   - `joinChallenge` utilizes Firestore transactions to enforce hard participant quotas (`maxParticipants`).

---

## 🛠 Local Development & Testing with Emulators

Run the entire Firebase stack locally without touching live production resources.

### 1. Prerequisites
- Node.js 18+
- Java JRE (required for Firestore and Pub/Sub emulators)
- Firebase CLI:
  ```bash
  npm install -g firebase-tools
  ```

### 2. Install Functions Dependencies
```bash
cd functions
npm install
cd ..
```

### 3. Start Local Emulators
```bash
firebase emulators:start
```

Emulators will boot up on the following ports:
- **Emulator UI**: [http://localhost:4000](http://localhost:4000)
- **Firestore**: `localhost:8080`
- **Functions**: `localhost:5001`
- **Auth**: `localhost:9099`
- **Storage**: `localhost:9199`

---

## 🚀 Deployment to Production

### 1. Login and Select Project
```bash
firebase login
firebase use <YOUR_FIREBASE_PROJECT_ID>
```

### 2. Deploy Everything
```bash
firebase deploy
```

### 3. Deploy Specific Targets
```bash
# Deploy only Firestore rules and indexes
firebase deploy --only firestore

# Deploy only Cloud Functions
firebase deploy --only functions

# Deploy only Cloud Storage rules
firebase deploy --only storage
```
