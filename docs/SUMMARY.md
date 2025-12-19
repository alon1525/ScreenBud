# ScreenTimeBattle - Design Summary

## Quick Overview

This document provides a high-level summary of the ScreenTimeBattle app design, covering game mechanics, UX flow, technical architecture, MVP roadmap, and risk analysis.

---

## 1. Game Loop

### Daily Loop
- **Morning**: Daily challenge card, set goal, start tracking
- **Throughout Day**: Real-time progress updates, milestone notifications
- **Evening**: Daily summary, points earned, streak status, achievements
- **Midnight**: Stats rollover, weekly accumulation

### Weekly Loop
- **Monday**: League reset, new week begins, goal setting
- **Tue-Sat**: Daily progress accumulates, leaderboard updates, friend activity
- **Sunday**: Week in review, league promotions/demotions, achievements

---

## 2. Point System

### Formula
```
Daily Points = Base Points + Goal Bonus + Streak Bonus + Achievement Bonus

Base Points = (Goal - Actual Usage) × 10 points/minute
Goal Bonus = Base Points × Multiplier (0.5x to 2.0x based on performance)
Streak Bonus = Streak Days × 5 points (max 100)
```

### Multipliers
- 100% under goal: 2.0x (perfect day)
- 75-99%: 1.5x (great day)
- 50-74%: 1.25x (good day)
- 25-49%: 1.0x (okay day)
- 0-24%: 0.5x (tough day)
- Over goal: 0 points (but grace day available)

### Level System
- XP = Points × 0.1
- Level = floor(Total XP / 1000) + 1
- Focus on consistency, not perfection

---

## 3. UX Flow

### Onboarding
1. Welcome splash → Permission request → App selection
2. Goal setting → Account creation → First day setup

### Main Screens
- **Dashboard**: Today's progress, points, streak, level, quick stats
- **Daily Details**: App breakdown, time chart, achievements
- **Weekly Leaderboard**: League rank, friend comparisons
- **League**: Current league, promotion zone, history
- **Stats**: Trends, charts, insights
- **Profile**: Achievements, settings, friends

### Design Principles
- Playful but clean (Duolingo + Apple Fitness)
- Positive reinforcement (celebrate wins)
- Clear visual hierarchy
- Smooth 60fps animations

---

## 4. Technical Architecture

### Stack
- **Frontend**: React Native CLI, TypeScript, Reanimated
- **Backend**: Firebase (Auth, Firestore, Cloud Messaging)
- **Native**: Kotlin module for UsageStatsManager
- **State**: Zustand + React Query
- **Database**: Local SQLite + Firestore sync

### Key Components
- **UsageStatsModule.kt**: Native bridge for usage tracking
- **WorkManager**: Background data collection (every 15 min)
- **Firestore**: User data, daily usage, leagues, achievements
- **Offline-First**: Local cache with background sync

### Data Models
- User, DailyUsage, WeeklyStats, League, Achievement
- PointsTransaction, LeaguePlayer, AppUsage
- See `src/types/` for full definitions

---

## 5. MVP Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Native module development
- Firebase setup
- Basic UI components
- Usage tracking integration

### Phase 2: Core Features (Weeks 3-4)
- Points system
- Streak & level systems
- League system
- Basic achievements
- Dashboard & stats

### Phase 3: Polish (Week 5)
- UI/UX polish
- Animations
- Error handling
- Offline support
- Testing

### Phase 4: Beta (Week 6+)
- Beta testing (10-20 users)
- Feedback collection
- Bug fixes
- Performance optimization

### MVP Success Metrics
- Daily Active Users: 40%+ of installs
- 7-Day Retention: 30%+
- Permission Grant Rate: 70%+
- App Crash Rate: < 1%

---

## 6. Risks & Mitigation

### High-Priority Risks

1. **Permission Denial**
   - Clear explanation before request
   - Re-request with context
   - Fallback: Manual time logging

2. **Shaming Users**
   - Positive language throughout
   - Celebrate wins, not losses
   - Encouraging messages on tough days

3. **Low Engagement**
   - Focus on fun, not analytics
   - Strong visual feedback
   - Social features (friends, competition)

4. **UsageStatsManager Limitations**
   - Test on multiple devices
   - Handle edge cases gracefully
   - Clear error messages

### Medium-Priority Risks

1. **Battery Drain**
   - Optimize WorkManager frequency
   - Use JobScheduler constraints
   - Monitor battery usage

2. **Competition Fatigue**
   - Grace days prevent streak loss
   - Catch-up mechanics
   - Positive language

3. **Addiction Paradox**
   - Limit app notifications
   - "Take a break" reminders
   - Focus on daily summary

---

## 7. Future Expansion

### Phase 2: Social & Engagement
- Friend system (invite codes)
- Enhanced notifications
- Daily challenges
- More achievements

### Phase 3: Advanced Features
- Custom goals per app
- Advanced analytics
- Habit tracking
- Wellness integration

### Phase 4: Platform Expansion
- iOS support
- Web dashboard
- Wearables

### Phase 5: Enterprise
- Family plans
- School/education
- Workplace wellness

---

## 8. Key Design Decisions

### What We're Building
- Android-first (UsageStatsManager)
- Gamified experience (not boring productivity app)
- Positive reinforcement (not shaming)
- Social competition (friends, leagues)
- Offline-first architecture

### What We're NOT Building (MVP)
- iOS support (Android only)
- Web dashboard
- Premium features
- Advanced analytics
- Social sharing
- Custom goals per app

### Simplifications
- Simple league algorithm (top/bottom %)
- 5-10 core achievements only
- Last 7 days stats (not all-time)
- Basic push notifications
- Invite code only (no contact sync)

---

## 9. Success Criteria

### MVP is Successful If:
- Users can track usage and earn points
- Daily active usage: 40%+ of installs
- 7-day retention: 30%+
- No major bugs or crashes
- Users find it fun and engaging

### MVP is NOT Successful If:
- Permission grant rate < 50%
- Daily active usage < 20%
- 7-day retention < 15%
- Major bugs or crashes
- Users find it boring or shaming

---

## 10. Next Steps

1. **Review Documentation**: Read full docs in `docs/` folder
2. **Setup Project**: Install dependencies, configure Firebase
3. **Start Development**: Begin with native module (Week 1)
4. **Iterate**: Build MVP features, test, gather feedback
5. **Launch Beta**: Test with 10-20 users, iterate
6. **Launch**: Public release, monitor metrics

---

## Quick Reference

- **Point Formula**: See `src/constants/points.ts`
- **League Rules**: See `src/constants/leagues.ts`
- **Color Palette**: See `src/constants/colors.ts`
- **Type Definitions**: See `src/types/`
- **Full Game Design**: See `docs/GAME_DESIGN.md`
- **Full UX Flow**: See `docs/UX_FLOW.md`
- **Full Architecture**: See `docs/TECHNICAL_ARCHITECTURE.md`

---

**Ready to build? Start with the MVP Roadmap and Technical Architecture documents!**


