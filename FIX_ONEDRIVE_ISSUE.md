# Fix OneDrive File Locking Issue

## Problem
OneDrive is syncing your project folder and locking build files, causing `AccessDeniedException` errors.

## Solutions (Choose One)

### Option 1: Pause OneDrive Sync (Quick Fix)
1. Right-click OneDrive icon in system tray
2. Click "Pause syncing" → "2 hours" or "24 hours"
3. Try building again: `npm run android`

### Option 2: Exclude Build Folders from OneDrive (Recommended)
1. Right-click OneDrive icon → Settings
2. Go to "Sync and backup" → "Advanced settings"
3. Click "Choose folders" to sync
4. Or add these folders to OneDrive's exclusion list:
   - `android/app/build/`
   - `android/build/`
   - `node_modules/`

### Option 3: Move Project Outside OneDrive (Best for Development)
Move the project to a location NOT synced by OneDrive:
- `C:\Projects\ScreenTimeBattle\`
- `C:\Dev\ScreenTimeBattle\`
- `D:\Projects\ScreenTimeBattle\`

Then:
```bash
cd C:\Projects\ScreenTimeBattle
npm install
npm run android
```

### Option 4: Manual Clean (If files are still locked)
1. Close Android Studio if open
2. Close Metro bundler
3. Open Task Manager, end any Java/Gradle processes
4. Try deleting the build folder manually:
   - `android\app\build\`
   - `android\build\`
5. Then run: `npm run android`

## Why This Happens
OneDrive syncs files in real-time and can lock files that Gradle is trying to write/delete during builds. This is a common issue with React Native projects in OneDrive.

## Recommendation
**Move your project outside OneDrive** for development. You can still backup your code to OneDrive/Git, but don't develop directly in a synced folder.


