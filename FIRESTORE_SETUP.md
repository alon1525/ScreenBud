# Firestore Setup Guide

## The Issue

You're getting `[firestore/unavailable]` errors because **Firestore Database is not enabled** in your Firebase project.

## Solution: Enable Firestore Database

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **screenbud-7ec08** (from your google-services.json)

### Step 2: Create Firestore Database
1. In the left sidebar, click **"Firestore Database"**
2. If you see "Get started" or "Create database", click it
3. Choose **"Start in test mode"** (for development)
4. Select a **location** (choose closest to you, e.g., `us-central1`, `europe-west1`)
5. Click **"Enable"**

### Step 3: Set Up Security Rules (Important!)

After creating the database, go to **"Rules"** tab and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to query usernames (for availability check)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **"Publish"** to save the rules.

### Step 4: Create Index for Username Queries

1. Go to **"Indexes"** tab in Firestore
2. Click **"Create Index"**
3. Set:
   - **Collection ID**: `users`
   - **Fields to index**:
     - Field: `username`
     - Query scope: Collection
     - Order: Ascending
4. Click **"Create"**
5. Wait 1-2 minutes for it to build

## Verify It's Working

After enabling Firestore:
1. Restart your app
2. The "unavailable" errors should stop
3. Username checks should work

## Note: Firestore vs Realtime Database

- **Firestore** = What you're using (NoSQL document database) ✅
- **Realtime Database** = Older JSON database (not needed) ❌

You only need Firestore, not Realtime Database.



