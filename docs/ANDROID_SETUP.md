# Android Setup for Usage Stats Tracking

## 1. Add Usage Stats Permission

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
```

## 2. Register Native Module

In `MainApplication.kt` or `MainApplication.java`:

```kotlin
import com.screentimebattle.UsageStatsPackage

override fun getPackages(): List<ReactPackage> {
    return listOf(
        MainReactPackage(),
        UsageStatsPackage() // Add this
    )
}
```

## 3. Register Background Service

In `AndroidManifest.xml`:

```xml
<service
    android:name=".UsageTrackingService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="dataSync" />
```

## 4. Request Usage Stats Permission

Create a permission request screen or add to your app:

```kotlin
val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
startActivity(intent)
```

## 5. Start Background Service

In your React Native app initialization:

```typescript
import { NativeModules } from 'react-native';

// Start service when app opens
NativeModules.UsageStatsModule?.startService?.();
```

## 6. Firestore Security Rules

Update `firestore.rules`:

```javascript
match /users/{userId}/dailyStats/{date} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

match /users/{userId}/weeklyStats/{weekId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

match /users/{userId}/monthlyStats/{monthId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## 7. Create Firestore Indexes

In Firebase Console → Firestore → Indexes:

1. Collection: `users/{userId}/dailyStats`
   - Fields: `updatedAt` (Ascending)
   - Query scope: Collection

## Testing

1. Grant usage stats permission in Android settings
2. Open app and verify permission check
3. Use social media apps for a few minutes
4. Check Firestore for uploaded data
5. Verify midnight rollover creates new daily document

