# Social Media Tracking Integration Guide

## Quick Start

### 1. Add the Hook to Your App

In your main `App.tsx` or root component:

```typescript
import { useSocialMediaTracking } from './src/hooks/useSocialMediaTracking';

function AppContent() {
  useSocialMediaTracking(); // This handles all tracking automatically
  
  // ... rest of your app
}
```

### 2. Add Tracking Screen (Optional)

Add the tracking screen to your navigation:

```typescript
import { SocialMediaTracking } from './src/screens/SocialMediaTracking';

// In your navigator
<Stack.Screen name="Tracking" component={SocialMediaTracking} />
```

### 3. Setup Android Native Code

Follow `docs/ANDROID_SETUP.md` to:
- Add permissions
- Register native modules
- Register background service

### 4. Update Firestore Rules

The rules are already updated in `firestore.rules`. Make sure to publish them in Firebase Console.

## How It Works

### Automatic Tracking
- **Every 5 minutes**: Uploads usage stats to Firestore
- **On app background**: Final upload before closing
- **On app foreground**: Checks for new day and uploads
- **Midnight rollover**: Creates new daily document automatically

### Data Flow
1. Android UsageStats API tracks app usage
2. Native service collects data every 5 minutes
3. Data sent to React Native via event emitter
4. React Native hook uploads to Firestore
5. Weekly/monthly aggregation runs automatically
6. Old daily stats deleted after 30 days

### Manual Operations

```typescript
// Get today's stats
const stats = await socialMediaTrackingService.getTodayStats(userId);

// Get stats for a date
const stats = await socialMediaTrackingService.getDailyStats(userId, '2025-01-19');

// Aggregate weekly stats
await socialMediaTrackingService.aggregateWeeklyStats(userId, '2025-W03');

// Aggregate monthly stats
await socialMediaTrackingService.aggregateMonthlyStats(userId, '2025-01');

// Get weekly stats
const weekly = await socialMediaTrackingService.getWeeklyStats(userId, '2025-W03');

// Get monthly stats
const monthly = await socialMediaTrackingService.getMonthlyStats(userId, '2025-01');

// Clean up old data
await socialMediaTrackingService.deleteOldDailyStats(userId, 30);
```

## Testing

1. Grant usage stats permission
2. Use TikTok/Instagram/etc for a few minutes
3. Wait 5 minutes or manually refresh
4. Check Firestore Console → users/{userId}/dailyStats/{today}
5. Verify data appears correctly

## Troubleshooting

### Permission Not Granted
- User must manually grant in Android Settings
- App cannot request programmatically
- Show instructions to user

### No Data Uploading
- Check if background service is running
- Verify Firestore rules are published
- Check console for errors
- Ensure user is authenticated

### Midnight Rollover Not Working
- Check if `handleNewDay` is called
- Verify date string format (YYYY-MM-DD)
- Check Firestore for previous day's final upload

## Performance Considerations

- Background service uses minimal battery
- Uploads are batched (every 5 minutes)
- Old data is automatically cleaned up
- Aggregation runs only when needed (new week/month)


