# How to Enable Firestore (Not Realtime Database)

## Important: You Need Firestore, NOT Realtime Database

Your code uses **Firestore** (the newer database), not Realtime Database.

## Steps to Enable Firestore:

### 1. Go to Firebase Console
- Open: https://console.firebase.google.com/
- Select your project: **screenbud-7ec08**

### 2. Enable Firestore Database
1. In the left sidebar, look for **"Firestore Database"** (NOT "Realtime Database")
2. If you don't see it, click the **"Build"** menu → **"Firestore Database"**
3. Click **"Create database"** or **"Get started"**
4. Choose **"Start in test mode"** (for development)
5. Select a **location** (e.g., `us-central1`)
6. Click **"Enable"**

### 3. Set Security Rules
After creating, go to **"Rules"** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **"Publish"**

### 4. Create Index for Username Queries
1. Go to **"Indexes"** tab
2. Click **"Create Index"**
3. Collection: `users`
4. Field: `username` (Ascending)
5. Click **"Create"**

## Difference:

- ✅ **Firestore Database** = What you need (what the code uses)
- ❌ **Realtime Database** = Older product, not needed

After enabling Firestore, restart your app and the "unavailable" errors should stop!



