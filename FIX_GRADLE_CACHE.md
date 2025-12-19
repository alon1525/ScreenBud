# Fix Gradle Cache Error (OneDrive Issue)

## The Problem
OneDrive is syncing/locking Gradle cache files, causing:
```
Cannot snapshot ... libjsi.so: not a regular file
```

## Solution

### Step 1: Pause OneDrive Sync (CRITICAL!)
1. Click OneDrive icon in system tray (bottom right)
2. Click gear icon → **"Pause syncing"**
3. Choose **"2 hours"** or **"24 hours"**

**DO NOT SKIP THIS STEP!** OneDrive must be paused.

### Step 2: Clear Gradle Cache
Run this in PowerShell:
```powershell
Remove-Item -Path "$env:USERPROFILE\.gradle\caches\9.0.0\transforms" -Recurse -Force -ErrorAction SilentlyContinue
```

Or manually delete:
- `C:\Users\User\.gradle\caches\9.0.0\transforms\`

### Step 3: Rebuild
```powershell
npm run android
```

## Permanent Fix: Move Project Outside OneDrive

**This is the best solution** - move your project to a location NOT synced by OneDrive:

1. **Create new folder:**
   - `C:\Projects\` (or `D:\Projects\`)

2. **Move project:**
   - From: `C:\Users\User\OneDrive\Desktop\TimeApp\ScreenTimeBattle`
   - To: `C:\Projects\ScreenTimeBattle`

3. **Reinstall:**
   ```powershell
   cd C:\Projects\ScreenTimeBattle
   npm install
   npm run android
   ```

## Why This Happens
OneDrive syncs files in real-time and locks them. Gradle needs to write/read cache files, but OneDrive prevents this. This is a common issue with React Native development in OneDrive folders.

**Recommendation:** Always develop outside OneDrive. Use Git for version control and backup separately.


