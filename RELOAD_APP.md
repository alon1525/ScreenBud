# Fix Blank Screen Issue

## The Problem
App is running but screen is blank. This is usually a Metro bundler cache issue.

## Quick Fix

### Option 1: Reload the App
On your phone/emulator, press:
- **R, R** (double tap R) to reload
- Or shake device → "Reload"

### Option 2: Restart Metro with Cache Clear
1. Stop Metro bundler (Ctrl+C in the terminal where it's running)
2. Clear cache and restart:
```powershell
npm start -- --reset-cache
```
3. In another terminal, rebuild:
```powershell
npm run android
```

### Option 3: Full Clean Rebuild
```powershell
# Stop Metro
# Then:
cd android
.\gradlew clean
cd ..
npm start -- --reset-cache
# In another terminal:
npm run android
```

## What Should Appear
After reloading, you should see:
- "ScreenTimeBattle 🎮" (purple title)
- "App is working! 🎉" (subtitle)
- Info text

If it's still blank after reloading, try the cache clear steps above.


