# Usage Tracking Setup - Real Data from Phone

## What's Been Set Up

✅ **Android Native Code:**
- `UsageStatsTracker.kt` - Tracks app usage using Android UsageStats API
- `UsageTrackingService.kt` - Background service that tracks every 5 minutes
- `UsageStatsModule.kt` - React Native bridge to access native functionality

✅ **React Native Integration:**
- `useSocialMediaTracking` hook - Automatically tracks and uploads data
- Integrated into `App.tsx` - Starts tracking when user is authenticated
- `socialMediaTrackingService` - Handles Firestore uploads

✅ **Firestore Structure:**
- `users/{userId}/dailyStats/{date}` - Daily usage per app
- `users/{userId}/weeklyStats/{weekId}` - Weekly aggregated stats
- `users/{userId}/monthlyStats/{monthId}` - Monthly aggregated stats

## Required Steps

### 1. Grant Usage Stats Permission

**This is the most important step!** Android requires users to manually grant usage stats permission:

1. Open the app
2. The app will detect if permission is not granted
3. User must go to: **Settings → Apps → Special app access → Usage access**
4. Find "ScreenTimeBattle" and enable it
5. Return to the app

**Note:** The app cannot request this permission programmatically - users must do it manually in Settings.

### 2. Rebuild the App

After adding the native code, you need to rebuild:

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 3. Verify It's Working

1. Grant usage stats permission (see step 1)
2. Use TikTok, Instagram, YouTube, Facebook, or Snapchat for a few minutes
3. Wait 5 minutes (or restart the app to trigger immediate upload)
4. Check Firestore Console:
   - Go to `users/{yourUserId}/dailyStats/{today's date}`
   - You should see fields like `tiktokMinutes`, `instagramMinutes`, etc.

### 4. Check Logs

In the React Native console, you should see:
- "Usage tracking service started"
- "Uploaded usage stats to Firestore for {date}"
- Any permission errors if permission is not granted

## How It Works

1. **Background Service** - Runs every 5 minutes, collects usage stats
2. **React Native Hook** - Uploads stats to Firestore every 5 minutes
3. **Midnight Rollover** - Automatically creates new daily document at midnight
4. **Aggregation** - Weekly/monthly stats are aggregated automatically
5. **Cleanup** - Old daily stats (>30 days) are automatically deleted

## Troubleshooting

### "Usage stats permission not granted"
- User must manually grant permission in Android Settings
- Go to Settings → Apps → Special app access → Usage access
- Enable for ScreenTimeBattle

### No data appearing in Firestore
1. Check if permission is granted
2. Check console logs for errors
3. Verify you used one of the tracked apps (TikTok, Instagram, YouTube, Facebook, Snapchat)
4. Wait 5 minutes or restart app to trigger upload

### Service not starting
- Check Android logs: `adb logcat | grep UsageTracking`
- Verify service is registered in `AndroidManifest.xml`
- Check if `UsageStatsPackage` is added to `MainApplication.kt`

## Tracked Apps

- **TikTok**: `com.zhiliaoapp.musically`
- **Instagram**: `com.instagram.android`
- **YouTube**: `com.google.android.youtube`
- **Facebook**: `com.facebook.katana`
- **Snapchat**: `com.snapchat.android`

## Data Structure in Firestore

```
users/
  {userId}/
    dailyStats/
      {YYYY-MM-DD}/
        tiktokMinutes: 45
        instagramMinutes: 30
        youtubeMinutes: 60
        facebookMinutes: 15
        snapchatMinutes: 20
        updatedAt: Timestamp
    weeklyStats/
      {YYYY-W##}/
        tiktokMinutes: 315
        instagramMinutes: 210
        ...
        totalMinutes: 1050
    monthlyStats/
      {YYYY-MM}/
        tiktokMinutes: 1350
        ...
        totalMinutes: 4500
```

## Next Steps

Once tracking is working:
1. Display stats in Dashboard
2. Add charts/graphs for visualization
3. Set daily goals and track progress
4. Add leaderboards (compare with friends)
5. Add achievements based on usage patterns

