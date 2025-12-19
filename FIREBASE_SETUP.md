# Firebase Setup Guide

## Required Firestore Index

The username availability check requires a Firestore index. When you first run the query, Firebase will show an error with a link to create the index automatically.

### Option 1: Automatic (Recommended)

1. Run the app and try to check username availability
2. Check the console/logs for an error message
3. The error will contain a link like: `https://console.firebase.google.com/...`
4. Click the link to create the index automatically
5. Wait 1-2 minutes for the index to build
6. Try again

### Option 2: Manual Creation

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Set:
   - **Collection ID**: `users`
   - **Fields to index**:
     - Field: `username`
     - Order: Ascending
6. Click **Create**

### Option 3: Use Firestore Rules (Alternative)

If you can't create an index, you can temporarily allow the query in Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow querying by username (temporary)
      allow read: if request.auth != null;
    }
  }
}
```

**Note**: This is less secure. Use only for development.

## Common Errors

### Error: "The query requires an index"
**Solution**: Create the index as described above.

### Error: "Permission denied"
**Solution**: Check Firestore security rules. Make sure authenticated users can read the users collection.

### Error: "Service unavailable"
**Solution**: 
- Check your internet connection
- Wait a few seconds and try again
- Check Firebase status page

## Testing

After creating the index:
1. Wait 1-2 minutes for it to build
2. Try checking username availability again
3. It should work without errors


