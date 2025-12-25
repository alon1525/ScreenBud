# Social Media Usage Tracking - Implementation Plan

## Overview
Track daily screen time for TikTok, Instagram, YouTube, Facebook, and Snapchat using Android UsageStats API and Firebase Firestore.

## Firestore Structure

```
users/{userId}
  ├── nickname: string
  ├── createdAt: timestamp
  └── dailyStats/{date}  // e.g., "2025-01-19"
      ├── tiktokMinutes: number
      ├── instagramMinutes: number
      ├── youtubeMinutes: number
      ├── facebookMinutes: number
      ├── snapchatMinutes: number
      └── updatedAt: timestamp
  └── weeklyStats/{weekId}  // e.g., "2025-W03"
      ├── weekStart: timestamp
      ├── weekEnd: timestamp
      ├── tiktokMinutes: number
      ├── instagramMinutes: number
      ├── youtubeMinutes: number
      ├── facebookMinutes: number
      ├── snapchatMinutes: number
      └── totalMinutes: number
  └── monthlyStats/{monthId}  // e.g., "2025-01"
      ├── monthStart: timestamp
      ├── monthEnd: timestamp
      ├── tiktokMinutes: number
      ├── instagramMinutes: number
      ├── youtubeMinutes: number
      ├── facebookMinutes: number
      ├── snapchatMinutes: number
      └── totalMinutes: number
```

## Implementation Steps

### 1. Firestore Service Layer (TypeScript/React Native)
- Create service functions for daily stats CRUD
- Implement aggregation functions
- Add cleanup functions for old data

### 2. Android Native Module
- UsageStats API integration
- Background service for periodic tracking
- Midnight detection and rollover
- Package name mapping to apps

### 3. Data Upload Logic
- Periodic upload (every 5-10 minutes)
- Background upload on app close
- End-of-day upload

### 4. Aggregation Logic
- Weekly aggregation (runs on app open or scheduled)
- Monthly aggregation
- Delete old daily stats after aggregation

### 5. Date Management
- Format: YYYY-MM-DD for daily stats
- Week ID: YYYY-W## (ISO week)
- Month ID: YYYY-MM

## App Package Names

```javascript
const APP_PACKAGES = {
  tiktok: 'com.zhiliaoapp.musically',
  instagram: 'com.instagram.android',
  youtube: 'com.google.android.youtube',
  facebook: 'com.facebook.katana',
  snapchat: 'com.snapchat.android',
};
```

## Data Retention Policy
- Keep last 30 days of daily stats
- Keep all weekly stats
- Keep all monthly stats
- Delete daily stats older than 30 days after aggregation


