# 🔴 URGENT: Fix Permission Errors

## The Problem
You're getting `permission-denied` errors because:
- Your Firestore is in **production mode** (secure)
- But the **security rules haven't been published** yet

## Quick Fix (2 minutes):

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: **screenbud-7ec08**
3. Click **Firestore Database** in left menu
4. Click **Rules** tab

### Step 2: Copy Rules from `firestore.rules` File
The rules are already in your project at `firestore.rules` - just copy them!

Or copy this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read any user (for username availability check)
      // Users can only write their own data
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Daily usage - users can only access their own data
    match /dailyUsage/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Weekly stats - users can only access their own data
    match /weeklyStats/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leagues - authenticated users can read, only Cloud Functions can write
    match /leagues/{leagueId}/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Achievements - read-only for authenticated users
    match /achievements/{achievementId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }
    
    // User achievements - users can read their own
    match /userAchievements/{userId}/{document=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Friends - users can read/write their own friend relationships
    match /friends/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 3: Publish
1. Click **"Publish"** button (top right)
2. Wait 10-20 seconds
3. You should see "Rules published successfully"

### Step 4: Create Username Index
1. Still in Firestore Database
2. Click **"Indexes"** tab
3. Click **"Create Index"**
4. Fill in:
   - **Collection ID**: `users`
   - **Fields to index**:
     - Field: `username`
     - Order: Ascending
   - **Query scope**: Collection
5. Click **"Create"**
6. Wait 1-2 minutes (you'll see "Building..." then "Enabled")

### Step 5: Restart App
1. Close the app completely
2. Restart it
3. Errors should be gone! ✅

---

## If You're Still in Test Mode:
If you see "Test mode" in the Firestore console, you shouldn't get permission errors. In that case:
- The database might not be fully enabled yet
- Wait 2-3 minutes and try again
- Or switch to production mode and follow steps above


