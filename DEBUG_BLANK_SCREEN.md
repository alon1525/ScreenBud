# Debug Blank Screen Issue

## What I Changed
1. Simplified App.tsx - removed SafeAreaView, using basic View
2. Added RED background so you can see if ANYTHING renders
3. Made text white and large for visibility

## Steps to Fix

### Step 1: Stop Everything
1. Stop Metro bundler (Ctrl+C)
2. Close the app on your device

### Step 2: Clear Everything
```powershell
# Clear Metro cache
npm start -- --reset-cache
```

### Step 3: In Another Terminal, Rebuild
```powershell
npm run android
```

### Step 4: Check Metro Bundler
Look at the Metro bundler terminal. You should see:
- "Bundling..." messages
- No red errors
- "Metro waiting on..."

### Step 5: Check Device
- Do you see a RED screen? (That means React Native is working)
- Do you see white text? (That means the component is rendering)
- Still blank? (Check Metro bundler for errors)

## If Still Blank

### Check Metro Bundler Logs
Look for errors like:
- "Unable to resolve module"
- "Cannot find module"
- Any red error messages

### Check Device Logs
```powershell
adb logcat *:E ReactNative:V ReactNativeJS:V
```

### Try Manual Reload
On device:
- Press **R, R** (double tap R)
- Or shake device → "Reload"

## What You Should See
After rebuild, you should see:
- **RED background** (this confirms React Native is rendering)
- **White text** saying "ScreenTimeBattle" and "App is Working!"

If you see RED but no text, there's a Text rendering issue.
If you see nothing, React Native isn't loading.


