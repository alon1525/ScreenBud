# ScreenTimeBattle - MVP Roadmap

## MVP Philosophy
**Fun First, Analytics Second**: Focus on gamification mechanics that make users want to return daily. Analytics and detailed stats can come later.

---

## MVP Feature List

### Must-Have (Phase 1 - Core MVP)

#### 1. Onboarding & Setup
- [x] Welcome screen
- [x] Permission request (USAGE_STATS)
- [x] App selection (which apps to track)
- [x] Daily goal setting (default: 2 hours)
- [x] Account creation (Firebase Auth)
- [x] Basic profile (username, avatar)

**Priority**: Critical
**Effort**: 3-5 days
**Dependencies**: Firebase Auth setup

#### 2. Usage Tracking (Native Module)
- [x] Kotlin native module for UsageStatsManager
- [x] Bridge to React Native
- [x] Permission check & request flow
- [x] Daily usage collection
- [x] Per-app breakdown
- [x] WorkManager background collection (every 15 min)

**Priority**: Critical
**Effort**: 5-7 days
**Dependencies**: Android development setup

#### 3. Points System
- [x] Base point calculation (goal - actual usage)
- [x] Goal bonus multiplier
- [x] Daily points display
- [x] Points history (last 7 days)
- [x] Total points counter

**Priority**: Critical
**Effort**: 2-3 days
**Dependencies**: Usage tracking working

#### 4. Daily Dashboard
- [x] Today's progress card (circular progress ring)
- [x] Current usage vs goal
- [x] Points earned today
- [x] Streak indicator
- [x] Level & XP progress bar
- [x] Quick stats (weekly total, league rank)

**Priority**: Critical
**Effort**: 4-5 days
**Dependencies**: Points system, usage tracking

#### 5. Streak System
- [x] Daily streak counter
- [x] Streak bonus points
- [x] Visual indicator (fire emoji)
- [x] Streak break handling
- [x] Grace day (1 per week)

**Priority**: High
**Effort**: 2-3 days
**Dependencies**: Points system

#### 6. Level System
- [x] XP calculation (points × 0.1)
- [x] Level calculation (XP / 1000)
- [x] Level up animation
- [x] Level badge display
- [x] Next level progress

**Priority**: High
**Effort**: 2-3 days
**Dependencies**: Points system

#### 7. Weekly League
- [x] League assignment (Bronze/Silver/Gold)
- [x] Weekly leaderboard
- [x] League rank display
- [x] Promotion/demotion logic
- [x] Weekly reset (Monday)

**Priority**: High
**Effort**: 5-7 days
**Dependencies**: Points system, Firebase setup

#### 8. Basic Achievements
- [x] Achievement definitions (5-10 core achievements)
- [x] Achievement unlock detection
- [x] Achievement unlock animation
- [x] Achievement list/badge display
- [x] Core achievements:
  - First Clean Day
  - 3-Day Streak
  - 7-Day Streak
  - Week Warrior (win league)

**Priority**: Medium
**Effort**: 3-4 days
**Dependencies**: Points system, streak system

#### 9. App Breakdown
- [x] Daily app usage list
- [x] Per-app time display
- [x] Per-app points (if under goal)
- [x] Sortable table
- [x] App icons

**Priority**: Medium
**Effort**: 2-3 days
**Dependencies**: Usage tracking

#### 10. Basic Stats
- [x] Today's stats
- [x] Weekly total
- [x] Simple chart (daily trend, last 7 days)
- [x] Best day highlight

**Priority**: Medium
**Effort**: 3-4 days
**Dependencies**: Usage tracking

#### 11. Profile Screen
- [x] User profile display
- [x] Total points
- [x] Current streak
- [x] Level badge
- [x] Achievement badges
- [x] Settings (goal, notifications)

**Priority**: Medium
**Effort**: 2-3 days
**Dependencies**: User data

#### 12. Firebase Integration
- [x] Firebase Auth setup
- [x] Firestore database structure
- [x] User data sync
- [x] Daily usage sync
- [x] Weekly stats sync
- [x] League data sync
- [x] Offline support (local cache)

**Priority**: Critical
**Effort**: 5-7 days
**Dependencies**: Firebase project setup

---

### Nice-to-Have (Phase 2 - Post-MVP)

#### 1. Friend System
- [ ] Invite code generation
- [ ] Friend requests
- [ ] Friend list
- [ ] Friend leaderboard
- [ ] Friend activity notifications

**Priority**: High (for engagement)
**Effort**: 5-7 days

#### 2. Enhanced Achievements
- [ ] More achievement types (20+)
- [ ] Achievement progress tracking
- [ ] Achievement categories
- [ ] Rare/epic achievements

**Priority**: Medium
**Effort**: 3-4 days

#### 3. Advanced Stats
- [ ] Monthly trends
- [ ] Usage by day of week
- [ ] Hourly heatmap
- [ ] App-specific insights
- [ ] Comparison charts

**Priority**: Medium
**Effort**: 4-5 days

#### 4. Notifications
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Milestone notifications
- [ ] Streak reminders
- [ ] League updates
- [ ] Achievement unlocks

**Priority**: High (for retention)
**Effort**: 3-4 days

#### 5. Customization
- [ ] Avatar customization
- [ ] Theme selection
- [ ] Color schemes
- [ ] Title selection

**Priority**: Low
**Effort**: 3-4 days

#### 6. Daily Challenges
- [ ] Challenge system
- [ ] Challenge types (time-based, app-specific)
- [ ] Challenge rewards
- [ ] Challenge completion tracking

**Priority**: Medium
**Effort**: 4-5 days

#### 7. Social Features
- [ ] Share progress (screenshot)
- [ ] Share achievements
- [ ] Friend groups
- [ ] Team competitions

**Priority**: Medium
**Effort**: 5-7 days

---

## MVP Timeline

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Get basic tracking working

- Week 1:
  - Setup project structure
  - Firebase configuration
  - Native module development (UsageStatsManager)
  - Basic UI components

- Week 2:
  - Usage tracking integration
  - Points calculation
  - Basic dashboard
  - Local database setup

### Phase 2: Core Features (Weeks 3-4)
**Goal**: Complete game mechanics

- Week 3:
  - Streak system
  - Level system
  - Daily dashboard polish
  - App breakdown screen

- Week 4:
  - League system
  - Weekly leaderboard
  - Basic achievements
  - Profile screen

### Phase 3: Polish & Testing (Week 5)
**Goal**: Ready for beta testing

- Week 5:
  - UI/UX polish
  - Animations
  - Error handling
  - Offline support
  - Testing & bug fixes

### Phase 4: Beta Launch (Week 6+)
**Goal**: Limited beta release

- Week 6:
  - Beta testing with 10-20 users
  - Feedback collection
  - Bug fixes
  - Performance optimization

---

## Success Metrics (MVP)

### Engagement Metrics
- **Daily Active Users (DAU)**: Target 40%+ of installs
- **7-Day Retention**: Target 30%+
- **30-Day Retention**: Target 15%+
- **Average Session Time**: 2-3 minutes

### Game Metrics
- **Average Daily Points**: 300-600 points
- **Streak Length**: Average 5+ days
- **Achievement Unlock Rate**: 2-3 per user per week
- **League Participation**: 80%+ of users

### Technical Metrics
- **App Crash Rate**: < 1%
- **Permission Grant Rate**: 70%+
- **Background Sync Success**: 95%+
- **API Response Time**: < 500ms

---

## MVP Scope Decisions

### What We're NOT Building (Yet)

1. **iOS Support**: Android-only for MVP
2. **Web Dashboard**: Mobile-first
3. **Premium Features**: Free for MVP
4. **Advanced Analytics**: Basic stats only
5. **Social Sharing**: Post-MVP
6. **Custom Goals Per App**: Single daily goal for MVP
7. **Team Competitions**: Individual leagues only
8. **In-App Purchases**: Not in MVP
9. **Dark Mode**: Light mode only (can add later)
10. **Multiple Languages**: English only

### What We're Simplifying

1. **League Assignment**: Simple algorithm (top/bottom %)
2. **Achievements**: 5-10 core achievements only
3. **Stats**: Last 7 days only (not all-time)
4. **Notifications**: Basic push only (no rich notifications)
5. **Friend System**: Invite code only (no contact sync)

---

## Post-MVP Roadmap (Phase 2+)

### Phase 2: Social & Engagement (Weeks 7-10)
- Friend system
- Enhanced notifications
- Daily challenges
- More achievements

### Phase 3: Advanced Features (Weeks 11-14)
- Advanced stats & insights
- Custom goals per app
- Team competitions
- Social sharing

### Phase 4: Scale & Optimize (Weeks 15+)
- Performance optimization
- Analytics improvements
- User feedback integration
- Feature refinements

---

## Risk Mitigation

### Technical Risks
- **UsageStatsManager limitations**: Test on multiple devices
- **Battery drain**: Optimize WorkManager frequency
- **Permission denial**: Clear explanation, re-request flow
- **Offline sync conflicts**: Last-write-wins strategy

### Product Risks
- **Low engagement**: Focus on fun, not analytics
- **Addiction paradox**: Positive reinforcement, not shaming
- **Competition fatigue**: Grace days, catch-up mechanics
- **Privacy concerns**: Clear privacy policy, opt-in features

---

## MVP Launch Checklist

### Pre-Launch
- [ ] All must-have features complete
- [ ] Testing on 5+ Android devices
- [ ] Permission flow tested
- [ ] Offline mode tested
- [ ] Firebase security rules reviewed
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] App icon & splash screen
- [ ] Beta testing with 10-20 users

### Launch
- [ ] Google Play Store listing
- [ ] App description & screenshots
- [ ] Privacy policy link
- [ ] Support email
- [ ] Analytics setup
- [ ] Crash reporting setup
- [ ] Monitoring dashboard

### Post-Launch
- [ ] Monitor crash reports
- [ ] Collect user feedback
- [ ] Track engagement metrics
- [ ] Plan Phase 2 features
- [ ] Iterate based on data

---

## Development Priorities

### Week 1-2: Foundation
1. Native module (UsageStatsManager)
2. Firebase setup
3. Basic UI components
4. Navigation structure

### Week 3-4: Core Game
1. Points system
2. Streak system
3. Level system
4. League system

### Week 5: Polish
1. Animations
2. Error handling
3. Offline support
4. Testing

### Week 6+: Beta
1. Beta testing
2. Feedback collection
3. Bug fixes
4. Performance optimization

---

## Resource Requirements

### Development Team
- 1 React Native developer (full-time)
- 1 Android/Kotlin developer (part-time, for native module)
- 1 Designer (part-time, for UI/UX)
- 1 QA tester (part-time, for testing)

### Tools & Services
- Firebase (Free tier initially)
- Google Play Console ($25 one-time)
- Development devices (3-5 Android phones)
- Design tools (Figma/Sketch)

### Timeline
- **MVP Development**: 5-6 weeks
- **Beta Testing**: 1-2 weeks
- **Launch**: Week 7-8

---

## Success Criteria

### MVP is Successful If:
1. Users can track usage and earn points
2. Daily active usage is 40%+ of installs
3. 7-day retention is 30%+
4. App doesn't crash or drain battery excessively
5. Users find it fun and engaging (qualitative feedback)

### MVP is NOT Successful If:
1. Permission grant rate < 50%
2. Daily active usage < 20%
3. 7-day retention < 15%
4. Major bugs or crashes
5. Users find it boring or shaming

---

## Next Steps After MVP

1. **Analyze Beta Data**: What features drive engagement?
2. **User Interviews**: What do users love/hate?
3. **A/B Testing**: Test different point formulas, UI variations
4. **Feature Prioritization**: Based on data, not assumptions
5. **Phase 2 Planning**: Social features, advanced stats, etc.


