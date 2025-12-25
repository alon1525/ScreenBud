# Firestore Security Rules Setup

## You Chose Production Mode - Now Set Up Rules!

Since you chose production mode, you **must** set up security rules immediately.

## Steps:

### 1. Go to Firestore Rules
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **screenbud-7ec08**
3. Go to **Firestore Database** → **Rules** tab

### 2. Copy and Paste These Rules

Replace the existing rules with:

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

### 3. Publish the Rules
1. Click **"Publish"** button
2. Wait a few seconds for rules to deploy

### 4. Create Username Index
1. Go to **"Indexes"** tab
2. Click **"Create Index"**
3. Set:
   - **Collection ID**: `users`
   - **Fields to index**:
     - Field: `username`
     - Order: Ascending
     - Query scope: Collection
4. Click **"Create"**
5. Wait 1-2 minutes for it to build

## What These Rules Do:

✅ **Users can read any user** - Needed for username availability check  
✅ **Users can only write their own data** - Security  
✅ **All other collections protected** - Only own data accessible  

## After Setup:

1. Restart your app
2. The "unavailable" errors should stop
3. Username checks should work
4. Everything should function properly

Let me know once you've set up the rules!



