# Firestore Schema Reference Guide

This document outlines the data model, collection hierarchies, document fields, data types, and access policies for the Fitness Tracking Application.

---

## Collections Overview

```text
Firestore Root
├── users/                     # User profiles, preferences, and account metadata
│   └── {userId}/notifications/ # User-specific activity alerts and notifications
├── daily_metrics/             # Daily aggregate logs (steps, calories, active time, sleep)
├── workouts/                  # Individual recorded workout sessions
├── workout_plans/             # Structured exercise plans and weekly schedules
├── challenges/                # Fitness community challenges and sprint goals
├── challenge_participants/    # Participation status, milestones, and personal progress
├── social_posts/              # User social feed, milestone broadcasts, and workouts
│   └── {postId}/comments/     # Comments thread on specific posts
└── leaderboard/               # Aggregated leaderboard snapshots (global, challenge, weekly)
```

---

## 1. `users` Collection
**Document ID:** `{userId}` (matches Firebase Authentication `uid`)

| Field | Type | Description |
|---|---|---|
| `uid` | `string` | Unique Firebase user ID |
| `email` | `string` | User email address |
| `displayName` | `string` | Public display name |
| `photoURL` | `string` | Avatar image storage URL |
| `bio` | `string` | Short user bio or personal fitness motto |
| `role` | `string` | Role (`user`, `coach`, `admin`) |
| `fitnessLevel` | `string` | `beginner`, `intermediate`, `advanced` |
| `dailyGoals` | `map` | User target goals (e.g. `{ steps: 10000, calories: 500, activeMinutes: 45, waterMl: 2500 }`) |
| `currentStreak` | `number` | Consecutive active days logging metrics |
| `longestStreak` | `number` | All-time highest streak count |
| `totalPoints` | `number` | Gamification points earned across challenges |
| `activeWorkoutPlanId` | `string` | Reference ID to active `workout_plans` doc |
| `badges` | `array<string>` | List of awarded badge keys |
| `createdAt` | `timestamp` | Profile creation timestamp |
| `updatedAt` | `timestamp` | Last profile update timestamp |

---

## 2. `daily_metrics` Collection
**Document ID:** `{userId}_{YYYY-MM-DD}`

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | Reference to `users/{userId}` |
| `date` | `string` | ISO Date string format `YYYY-MM-DD` |
| `steps` | `number` | Total daily step count |
| `distanceMeters` | `number` | Total distance in meters |
| `caloriesBurned` | `number` | Active + basal calories burned |
| `activeMinutes` | `number` | Minutes spent in moderate-to-vigorous activity |
| `waterIntakeMl` | `number` | Water consumed in milliliters |
| `sleepHours` | `number` | Hours of recorded sleep |
| `goalsCompleted` | `boolean` | Flag indicating if all daily goals were satisfied |
| `loggedAt` | `timestamp` | Server timestamp when recorded |

---

## 3. `workouts` Collection
**Document ID:** Auto-generated ID (`{workoutId}`)

| Field | Type | Description |
|---|---|---|
| `workoutId` | `string` | Unique identifier |
| `userId` | `string` | Owner reference |
| `activityType` | `string` | e.g. `running`, `cycling`, `weightlifting`, `hiit`, `yoga` |
| `title` | `string` | Name of the session |
| `durationMinutes` | `number` | Session duration in minutes |
| `caloriesBurned` | `number` | Estimated calories burned |
| `heartRateAvg` | `number` | Average beats per minute (BPM) |
| `heartRateMax` | `number` | Peak beats per minute (BPM) |
| `distanceMeters` | `number` | Optional distance for outdoor cardio |
| `routeCoordinates` | `array<map>` | Geo-coordinates `[{ lat: number, lng: number }]` |
| `notes` | `string` | User remarks on form, intensity, or fatigue |
| `visibility` | `string` | `private`, `friends`, `public` |
| `date` | `timestamp` | Timestamp of the workout session |
| `createdAt` | `timestamp` | Creation server timestamp |

---

## 4. `workout_plans` Collection
**Document ID:** Auto-generated ID (`{planId}`)

| Field | Type | Description |
|---|---|---|
| `planId` | `string` | Unique identifier |
| `creatorId` | `string` | Creator user ID |
| `title` | `string` | Plan title (e.g., "4-Week Fat Burn & Tone") |
| `description` | `string` | Detailed overview and objectives |
| `difficulty` | `string` | `beginner`, `intermediate`, `advanced` |
| `durationWeeks` | `number` | Total duration of the program |
| `weeklySchedule` | `array<map>` | Daily workout blocks `[{ day: "Monday", exercises: [...] }]` |
| `isPublic` | `boolean` | Community visibility toggle |
| `enrolledCount` | `number` | Number of active enrollees |
| `createdAt` | `timestamp` | Creation timestamp |

---

## 5. `challenges` Collection
**Document ID:** Auto-generated ID (`{challengeId}`)

| Field | Type | Description |
|---|---|---|
| `challengeId` | `string` | Unique identifier |
| `creatorId` | `string` | Admin or organizer user ID |
| `title` | `string` | Name (e.g., "100K Steps September Sprint") |
| `description` | `string` | Rules and rewards |
| `category` | `string` | `steps`, `calories`, `distance`, `streak` |
| `targetGoal` | `number` | Target metric to accomplish |
| `unit` | `string` | `steps`, `kcal`, `meters`, `days` |
| `badgeAwarded` | `string` | Badge ID granted upon completion |
| `pointsReward` | `number` | Gamification points earned |
| `startDate` | `timestamp` | Challenge kick-off date |
| `endDate` | `timestamp` | Challenge closing date |
| `participantCount`| `number` | Total enrolled participants |
| `maxParticipants`| `number` | Maximum allowed capacity (or null if open) |
| `status` | `string` | `upcoming`, `active`, `completed` |
| `createdAt` | `timestamp` | Timestamp created |

---

## 6. `challenge_participants` Collection
**Document ID:** `{challengeId}_{userId}`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Composite key `{challengeId}_{userId}` |
| `challengeId` | `string` | Reference to parent challenge |
| `userId` | `string` | Participant user ID |
| `displayName` | `string` | Cached display name for quick leaderboard queries |
| `photoURL` | `string` | Cached avatar |
| `currentProgress` | `number` | Metric accumulated so far |
| `progressPercent` | `number` | Percentage completed (`0.0` to `100.0`) |
| `completed` | `boolean` | True if user has reached `targetGoal` |
| `completedAt` | `timestamp` | Timestamp when goal was met (nullable) |
| `joinedAt` | `timestamp` | Timestamp when user joined |
| `lastUpdated` | `timestamp` | Timestamp of latest progress evaluation |

---

## 7. `social_posts` Collection
**Document ID:** Auto-generated ID (`{postId}`)

| Field | Type | Description |
|---|---|---|
| `postId` | `string` | Unique identifier |
| `authorId` | `string` | Author user ID |
| `authorName` | `string` | Author display name |
| `authorPhoto` | `string` | Author avatar URL |
| `postType` | `string` | `workout_summary`, `challenge_completed`, `milestone`, `general` |
| `content` | `string` | Post message / caption |
| `mediaUrl` | `string` | Optional progress picture or route map screenshot |
| `linkedWorkoutId`| `string` | Optional reference to a `workouts` document |
| `linkedChallengeId`| `string` | Optional reference to a `challenges` document |
| `likes` | `array<string>`| Array of user IDs who liked the post |
| `likesCount` | `number` | Cached count of likes |
| `commentsCount` | `number` | Cached count of comments |
| `createdAt` | `timestamp` | Creation server timestamp |

---

## 8. `leaderboard` Collection
**Document ID:** `{category}_{timeframe}` (e.g., `global_weekly`, `steps_challenge_{id}`)

| Field | Type | Description |
|---|---|---|
| `leaderboardId`| `string` | Unique identifier |
| `category` | `string` | e.g. `steps`, `points`, `challenge` |
| `timeframe` | `string` | `weekly`, `monthly`, `all_time`, `challenge` |
| `rankings` | `array<map>` | Top ranked participants: `[{ rank: 1, userId: "...", displayName: "...", score: 154000, photoURL: "..." }]` |
| `totalContenders`| `number` | Total evaluated participants |
| `updatedAt` | `timestamp` | Last refresh timestamp |
