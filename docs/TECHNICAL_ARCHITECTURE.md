# ScreenTimeBattle - Technical Architecture

## Overview
React Native CLI app with Kotlin native module for Android UsageStatsManager integration. Firebase for backend services. Offline-first architecture with local SQLite cache.

---

## 1. Tech Stack

### Frontend
- **React Native**: 0.83.0 (CLI, not Expo)
- **TypeScript**: Type safety
- **React Navigation**: Navigation
- **React Native Reanimated**: 60fps animations
- **React Native Gesture Handler**: Smooth gestures
- **React Native SVG**: Custom icons/illustrations
- **React Query / SWR**: Data fetching & caching
- **Zustand / Redux Toolkit**: State management
- **React Native MMKV**: Fast local storage
- **WatermelonDB / SQLite**: Offline-first database

### Backend
- **Firebase Auth**: Authentication
- **Firestore**: Real-time database (leaderboards, friends, user data)
- **Firebase Cloud Functions**: Server-side logic (league calculations, weekly resets)
- **Firebase Cloud Messaging**: Push notifications

### Native Android
- **Kotlin**: Native module development
- **UsageStatsManager**: App usage tracking
- **WorkManager**: Background data collection
- **Room Database**: Local caching (optional, or use React Native solution)

### Development Tools
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Detox / Maestro**: E2E testing (future)
- **Flipper**: Debugging

---

## 2. Project Structure

```
ScreenTimeBattle/
├── android/                    # Android native code
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/screentimebattle/
│   │       │   ├── MainActivity.kt
│   │       │   ├── MainApplication.kt
│   │       │   └── modules/
│   │       │       ├── UsageStatsModule.kt      # Native module
│   │       │       ├── UsageStatsPackage.kt     # Package registration
│   │       │       └── WorkManagerModule.kt     # Background worker
│   │       └── AndroidManifest.xml
│   └── build.gradle
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   └── Badge.tsx
│   │   ├── gamification/
│   │   │   ├── StreakIndicator.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   ├── AchievementCard.tsx
│   │   │   └── LeaderboardRow.tsx
│   │   └── charts/
│   │       ├── UsageChart.tsx
│   │       └── WeeklyTrend.tsx
│   │
│   ├── screens/                # Screen components
│   │   ├── Onboarding/
│   │   ├── Dashboard/
│   │   ├── Stats/
│   │   ├── League/
│   │   └── Profile/
│   │
│   ├── navigation/             # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/               # Business logic
│   │   ├── usageStats/
│   │   │   ├── UsageStatsService.ts
│   │   │   └── types.ts
│   │   ├── points/
│   │   │   ├── PointsCalculator.ts
│   │   │   └── formulas.ts
│   │   ├── league/
│   │   │   ├── LeagueService.ts
│   │   │   └── assignment.ts
│   │   └── achievements/
│   │       └── AchievementService.ts
│   │
│   ├── store/                  # State management
│   │   ├── slices/
│   │   │   ├── userSlice.ts
│   │   │   ├── usageSlice.ts
│   │   │   ├── pointsSlice.ts
│   │   │   └── leagueSlice.ts
│   │   └── store.ts
│   │
│   ├── database/               # Local database
│   │   ├── schema.ts
│   │   ├── migrations/
│   │   └── queries.ts
│   │
│   ├── api/                    # Firebase/API clients
│   │   ├── firebase/
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   └── functions.ts
│   │   └── types.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useUsageStats.ts
│   │   ├── usePoints.ts
│   │   ├── useLeague.ts
│   │   └── useAchievements.ts
│   │
│   ├── utils/                  # Utilities
│   │   ├── date.ts
│   │   ├── formatting.ts
│   │   └── validation.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── user.ts
│   │   ├── usage.ts
│   │   ├── points.ts
│   │   ├── league.ts
│   │   └── achievements.ts
│   │
│   └── constants/              # App constants
│       ├── colors.ts
│       ├── points.ts
│       └── leagues.ts
│
├── docs/                       # Documentation
│   ├── GAME_DESIGN.md
│   ├── UX_FLOW.md
│   └── TECHNICAL_ARCHITECTURE.md
│
└── __tests__/                  # Tests
    ├── unit/
    └── integration/
```

---

## 3. Data Models

### User Model
```typescript
interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  leagueId: string;
  leagueTier: 'bronze' | 'silver' | 'gold';
  dailyGoal: number; // minutes
  trackedApps: string[]; // package names
  createdAt: Date;
  lastActiveAt: Date;
  settings: UserSettings;
}

interface UserSettings {
  notifications: boolean;
  shareProgress: boolean;
  anonymousMode: boolean;
  theme: 'light' | 'dark' | 'auto';
}
```

### Daily Usage Model
```typescript
interface DailyUsage {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  goalMinutes: number;
  points: number;
  xp: number;
  underGoal: boolean;
  graceDayUsed: boolean;
  appBreakdown: AppUsage[];
  createdAt: Date;
  updatedAt: Date;
}

interface AppUsage {
  packageName: string;
  appName: string;
  minutes: number;
  points: number;
  underGoal: boolean;
}
```

### Weekly Stats Model
```typescript
interface WeeklyStats {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  totalMinutes: number;
  totalPoints: number;
  perfectDays: number; // days 100% under goal
  averageDailyUsage: number;
  leagueId: string;
  rank: number;
  promoted: boolean;
  demoted: boolean;
}
```

### League Model
```typescript
interface League {
  id: string;
  tier: 'bronze' | 'silver' | 'gold';
  weekStart: string;
  weekEnd: string;
  players: LeaguePlayer[];
  createdAt: Date;
}

interface LeaguePlayer {
  userId: string;
  username: string;
  avatar: string;
  totalPoints: number;
  rank: number;
  previousRank?: number;
}
```

### Achievement Model
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'usage' | 'competition' | 'social';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number; // 0-100 for in-progress
  maxProgress?: number;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}
```

### Points Transaction Model
```typescript
interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'daily' | 'bonus' | 'achievement' | 'streak' | 'challenge';
  source: string; // e.g., "daily-usage", "7-day-streak"
  date: string;
  metadata?: Record<string, any>;
}
```

---

## 4. Native Android Module

### UsageStatsModule.kt
```kotlin
package com.screentimebattle.modules

import android.app.usage.UsageStatsManager
import android.content.Context
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class UsageStatsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val usageStatsManager: UsageStatsManager =
        reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

    @ReactMethod
    fun getUsageStats(
        startTime: Long,
        endTime: Long,
        packageNames: ReadableArray,
        promise: Promise
    ) {
        // Query UsageStatsManager
        // Return app usage data
    }

    @ReactMethod
    fun checkPermission(promise: Promise) {
        // Check if USAGE_STATS permission granted
    }

    @ReactMethod
    fun requestPermission() {
        // Open settings to grant permission
    }

    override fun getName(): String = "UsageStatsModule"
}
```

### WorkManager Background Worker
```kotlin
class UsageStatsWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        // Collect usage stats
        // Store locally
        // Sync to Firestore if online
        return Result.success()
    }
}
```

### Scheduling
- Periodic work: Every 15 minutes (minimum interval)
- One-time work: On app launch, before midnight
- Constraints: Battery not low, device not idle

---

## 5. Firebase Structure

### Firestore Collections

```
users/
  {userId}/
    profile: User
    settings: UserSettings

dailyUsage/
  {userId}/
    {date}/: DailyUsage

weeklyStats/
  {userId}/
    {weekStart}/: WeeklyStats

leagues/
  {leagueId}/
    info: League
    players/{userId}: LeaguePlayer

achievements/
  {achievementId}: Achievement

userAchievements/
  {userId}/
    {achievementId}: UserAchievement

friends/
  {userId}/
    {friendId}: FriendRelationship
```

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Daily usage: user can read/write own data
    match /dailyUsage/{userId}/{date} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leagues: read-only for players, write for server
    match /leagues/{leagueId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions
    }
  }
}
```

### Cloud Functions

**Weekly Reset Function:**
- Runs every Monday at 00:00 UTC
- Calculates league promotions/demotions
- Assigns new leagues
- Resets weekly stats

**Points Calculation Function:**
- Triggered on daily usage update
- Calculates points based on formulas
- Updates user totals
- Checks for achievements

**League Assignment Function:**
- Assigns new users to leagues
- Balances league sizes
- Prevents smurfing

---

## 6. Offline-First Architecture

### Local Database (SQLite/WatermelonDB)

**Tables:**
- `users`: Cached user data
- `daily_usage`: Local usage data
- `weekly_stats`: Weekly summaries
- `achievements`: Achievement definitions
- `user_achievements`: Unlocked achievements
- `points_transactions`: Point history
- `sync_queue`: Pending syncs

**Sync Strategy:**
1. Write to local DB first (always available)
2. Queue sync to Firestore
3. Background sync when online
4. Conflict resolution: Last-write-wins (with timestamp)

**Offline Indicators:**
- Show "Offline" badge
- Disable real-time features
- Queue actions for later

---

## 7. State Management

### Zustand Store Structure

```typescript
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Usage state
  todayUsage: DailyUsage | null;
  weeklyUsage: WeeklyStats | null;
  appBreakdown: AppUsage[];
  
  // Points state
  todayPoints: number;
  totalPoints: number;
  pointsHistory: PointsTransaction[];
  
  // League state
  currentLeague: League | null;
  leagueRank: number;
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: string[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
}
```

### Actions
- `fetchTodayUsage()`
- `updateDailyGoal(goal: number)`
- `claimDailyReward()`
- `syncToFirestore()`
- `refreshLeaderboard()`

---

## 8. API Layer

### Service Classes

**UsageStatsService:**
- `getTodayUsage(): Promise<DailyUsage>`
- `getWeeklyUsage(): Promise<WeeklyStats>`
- `getAppBreakdown(date: string): Promise<AppUsage[]>`

**PointsService:**
- `calculateDailyPoints(usage: DailyUsage): number`
- `addPoints(userId: string, amount: number, type: string)`
- `getPointsHistory(userId: string): Promise<PointsTransaction[]>`

**LeagueService:**
- `getCurrentLeague(): Promise<League>`
- `getLeaderboard(leagueId: string): Promise<LeaguePlayer[]>`
- `checkPromotion(): Promise<boolean>`

**AchievementService:**
- `checkAchievements(userId: string, usage: DailyUsage): Promise<Achievement[]>`
- `unlockAchievement(userId: string, achievementId: string)`

---

## 9. Performance Optimizations

### Data Fetching
- React Query for caching & background refetch
- Stale-while-revalidate pattern
- Pagination for leaderboards
- Virtualized lists for long data

### Animations
- Use Reanimated (runs on UI thread)
- Avoid layout animations on scroll
- Optimize image loading (caching)

### Battery Optimization
- Batch WorkManager tasks
- Reduce background sync frequency
- Use JobScheduler constraints
- Request battery optimization exemption (if needed)

### Memory Management
- Image optimization (WebP, compression)
- Lazy load screens
- Clean up listeners on unmount
- Use FlatList for long lists

---

## 10. Security Considerations

### Data Privacy
- No PII in logs
- Encrypt sensitive data at rest
- Secure API keys (use environment variables)
- HTTPS only

### Authentication
- Firebase Auth with email/password
- Optional: Google Sign-In
- JWT tokens for API calls
- Session management

### Permission Handling
- Request USAGE_STATS permission explicitly
- Explain why permission needed
- Handle denial gracefully
- Re-request if revoked

---

## 11. Testing Strategy

### Unit Tests
- Points calculation formulas
- League assignment logic
- Achievement checking
- Date utilities

### Integration Tests
- Native module bridge
- Firestore sync
- Offline/online transitions
- WorkManager scheduling

### E2E Tests (Future)
- Onboarding flow
- Daily usage tracking
- Leaderboard updates
- Achievement unlocks

---

## 12. Monitoring & Analytics

### Error Tracking
- Sentry or Crashlytics
- Log errors with context
- User feedback mechanism

### Analytics Events
- Screen views
- Button clicks
- Feature usage
- Retention metrics

### Performance Monitoring
- App startup time
- Screen render time
- API response times
- Battery usage

---

## 13. Deployment

### Build Configuration
- Debug/Release builds
- Environment variables (dev/staging/prod)
- Code signing
- ProGuard rules

### CI/CD
- GitHub Actions / GitLab CI
- Automated tests
- Build APKs
- Deploy to Firebase App Distribution (beta)

### Versioning
- Semantic versioning
- Changelog
- Migration scripts for DB changes

---

## 14. Future Scalability

### Backend Migration
- Consider migrating from Firebase to custom backend if needed
- GraphQL API for flexible queries
- Microservices for different features

### Multi-Platform
- iOS support (Screen Time API)
- Web dashboard (optional)

### Advanced Features
- Real-time friend challenges
- Team competitions
- Custom goals per app
- AI-powered insights


