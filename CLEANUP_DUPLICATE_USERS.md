# Clean Up Duplicate Anonymous Users

## The Problem
The app created 3 anonymous authentication accounts because the retry logic was creating new users on each retry attempt.

## ✅ Fixed!
The code has been updated to:
1. **Check for existing user first** before creating a new one
2. **Reuse existing anonymous users** instead of creating duplicates
3. **Not retry on permission errors** (only transient network errors)

## Clean Up Existing Duplicates

You can delete the extra anonymous users from Firebase Console:

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **screenbud-7ec08**
3. Go to **Authentication** → **Users** tab
4. You'll see multiple anonymous users (they'll have no email/phone)
5. Select the extra ones (keep the most recent one)
6. Click **Delete** button
7. Confirm deletion

### Which One to Keep?
- Keep the **most recent** one (check the "Created" timestamp)
- Or keep the one that has a username set (if you've already set one)

### After Cleanup:
1. Restart your app
2. It will use the remaining user (or create a new one if you deleted all)
3. No more duplicates will be created! ✅

---

## What Changed in the Code:

1. **`signInAnonymouslyWithRetry`** now:
   - Checks for existing user BEFORE signing in
   - Doesn't retry on permission errors
   - Reuses existing anonymous users

2. **`AuthContext`** now:
   - Checks for existing user before calling `signInAnonymously()`
   - Handles race conditions better
   - Prevents multiple sign-in attempts

