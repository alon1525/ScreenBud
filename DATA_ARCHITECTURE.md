# Data Architecture - ScreenTimeBattle

## Overview

This document explains how data is stored and managed in ScreenTimeBattle.

## Current Setup: Firestore (NoSQL Document Database)

### Why Firestore?

✅ **Mature & Stable** - Production-ready, widely used  
✅ **Real-time Updates** - Automatic sync across devices  
✅ **Offline Support** - Works without internet, syncs when online  
✅ **Scalable** - Handles millions of users  
✅ **Simple** - Easy to use, no complex setup  
✅ **Cost-effective** - Pay for what you use  

### Why NOT Firebase Data Connect?

❌ Still in preview/beta  
❌ More complex setup (requires Cloud SQL)  
❌ Overkill for this app's data model  
❌ Less documentation and community support  
❌ Higher cost for simple use cases  

## Data Structure

### Firestore Collections

```
users/
  {userId}/
    - username: string
    - firstName: string
    - nickname: string
    - level: number
    - totalXP: number
    - currentStreak: number
    - totalPoints: number
    - leagueId: string
    - leagueTier: 'bronze' | 'silver' | 'gold'
    - dailyGoal: number (minutes)
    - trackedApps: string[]
    - createdAt: Date
    - lastActiveAt: Date
    - settings: UserSettings

dailyUsage/
  {userId}/
    {date}/ (subcollection)
      {date}/
        - totalMinutes: number
        - apps: AppUsage[]
        - timestamp: Date

weeklyStats/
  {userId}/
    {weekStart}/ (subcollection)
      {weekStart}/
        - totalMinutes: number
        - totalPoints: number
        - streakDays: number

leagues/
  {leagueId}/
    - name: string
    - tier: 'bronze' | 'silver' | 'gold'
    players/ (subcollection)
      {userId}/
        - totalPoints: number
        - rank: number
```

## Service Architecture

### `src/services/firestore.ts`

Centralized service for all Firestore operations:

- **userService**: User CRUD operations
- **dailyUsageService**: Daily usage tracking
- **leagueService**: League and leaderboard operations
- **batchService**: Batch operations
- **Error handling**: Wrapped with FirestoreError

### `src/services/auth.ts`

Authentication operations:
- Anonymous sign-in
- Username management
- User document creation

### `src/hooks/useUser.ts`

React hook for easy user data access:
- Real-time user data subscription
- Update user data
- Loading and error states

## Usage Examples

### Reading User Data

```typescript
import { useUser } from '../hooks/useUser';

function MyComponent() {
  const { user, loading, error } = useUser();
  
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  return <Text>{user?.username}</Text>;
}
```

### Updating User Data

```typescript
import { useUser } from '../hooks/useUser';

function MyComponent() {
  const { updateUser } = useUser();
  
  const handleLevelUp = async () => {
    await updateUser({ level: user.level + 1 });
  };
}
```

### Direct Service Usage

```typescript
import { userService } from '../services/firestore';

// Get user
const user = await userService.getUser(uid);

// Update user
await userService.updateUser(uid, { level: 5 });

// Subscribe to real-time updates
const unsubscribe = userService.subscribeToUser(uid, (user) => {
  console.log('User updated:', user);
});
```

## Security Rules

Set up in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Daily usage: user can read/write own data
    match /dailyUsage/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leagues: read for all authenticated users, write only by Cloud Functions
    match /leagues/{leagueId}/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions
    }
  }
}
```

## Offline Support

Firestore automatically handles offline:
- Writes are queued when offline
- Automatically syncs when connection restored
- No additional code needed

## Future Enhancements

1. **Local Caching** (Optional):
   - Use MMKV or SQLite for faster local access
   - Sync with Firestore in background

2. **Batch Operations**:
   - Use Firestore batch writes for atomic operations
   - Useful for complex updates

3. **Cloud Functions**:
   - Server-side logic (league calculations, weekly resets)
   - Triggered by Firestore events

## Best Practices

1. ✅ Use service layer (`firestore.ts`) for all operations
2. ✅ Use hooks (`useUser`) in components when possible
3. ✅ Handle errors gracefully
4. ✅ Use real-time subscriptions for frequently changing data
5. ✅ Set up proper security rules
6. ✅ Use TypeScript types for type safety

## Migration Notes

All existing code has been updated to use the new service structure:
- ✅ `auth.ts` now uses `userService`
- ✅ Created `useUser` hook for components
- ✅ Added error handling utilities
- ✅ Updated User type with firstName/nickname



