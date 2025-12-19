# ScreenTimeBattle - Game Design Document

## Core Concept
Transform social media screen time tracking into a competitive, gamified experience where **less usage = more points**. Users compete with friends in weekly leagues, earning rewards for discipline rather than engagement.

---

## 1. Game Loop Explanation

### Daily Game Loop

**Morning (6:00 AM - 12:00 PM)**
1. User opens app → **Daily Challenge Card** appears
2. Shows yesterday's results with celebration animations
3. Displays today's goal (adaptive based on history)
4. "Start Your Day" button → begins tracking

**Throughout the Day**
- Real-time progress bar updates (every 15 min via WorkManager)
- Push notifications at milestones:
  - "50% of goal remaining!" (at 50% usage)
  - "You're crushing it! 🎉" (at 25% usage)
  - "Almost there! Final push!" (at 80% usage)
- App usage triggers subtle in-app updates (not intrusive)

**Evening (8:00 PM - 11:59 PM)**
- "Daily Summary" unlocks at 8 PM
- Shows:
  - Total points earned today
  - Streak status (maintained/broken)
  - Achievement unlocks (if any)
  - League position update
- "Claim Rewards" button with satisfying animation

**Midnight Reset**
- Daily stats roll over
- Weekly stats accumulate
- League standings update (if it's Sunday)

### Weekly Game Loop

**Monday (League Reset)**
- "New Week, New Battle!" splash screen
- League assignment (Bronze/Silver/Gold)
- Weekly goal set (adaptive)
- Leaderboard resets

**Tuesday - Saturday**
- Daily progress accumulates toward weekly total
- Leaderboard updates in real-time
- Friend activity notifications:
  - "Sarah just leveled up!"
  - "Mike is 2 hours ahead of you"
  - "You're #3 in your league!"

**Sunday (Results Day)**
- "Week in Review" celebration screen
- League promotions/demotions
- Weekly achievements unlocked
- "Invite Friends" prompt for next week
- New week preparation

---

## 2. Point System & Formulas

### Base Point Formula

```
Daily Points = Base Points + Goal Bonus + Streak Bonus + Achievement Bonus

Base Points = max(0, (Daily Goal - Actual Usage) × Points Per Minute)

Where:
- Daily Goal = User's set limit (default: 2 hours for social apps)
- Actual Usage = Sum of tracked social app time
- Points Per Minute = 10 points (configurable)
```

**Example:**
- Goal: 120 minutes
- Actual: 90 minutes
- Base Points = (120 - 90) × 10 = 300 points

### Goal Bonus (Multiplier)

```
Goal Bonus = Base Points × Multiplier

Multiplier tiers:
- 100% under goal: 2.0x (perfect day!)
- 75-99% under goal: 1.5x (great day!)
- 50-74% under goal: 1.25x (good day!)
- 25-49% under goal: 1.0x (okay day)
- 0-24% under goal: 0.5x (tough day, but points still earned)
- Over goal: 0 points (but streak can be maintained with "grace day")
```

### Streak System

**Daily Streak:**
- Maintained by staying under goal OR using 1 "grace day" per week
- Streak bonus: `Current Streak × 5 points` (max 100 points)
- Visual: Fire emoji 🔥 with streak count

**Weekly Streak:**
- Maintained by participating all 7 days
- Weekly streak bonus: `Weekly Streak × 50 points`
- Resets if user misses 2+ days

### Level System

**XP Calculation:**
```
Daily XP = Daily Points × 0.1
Total XP = Sum of all daily XP
Level = floor(Total XP / 1000) + 1
```

**Level Benefits:**
- Unlock new avatar customization
- Higher league placement priority
- Exclusive achievements
- Badge display on profile

**Leveling Philosophy:**
- Focus on consistency, not perfection
- Bad days don't reset progress
- Catch-up mechanics for missed days

### Achievement Points

One-time bonuses for milestones:
- "First Clean Day": 500 points
- "7-Day Discipline": 1000 points
- "TikTok Slayer" (under 30 min): 750 points
- "Week Warrior" (7 perfect days): 2000 points
- "Month Master" (30-day streak): 5000 points

---

## 3. League System

### League Tiers

**Bronze League:**
- Default for new users
- 0-50 players per league
- Promotion: Top 20% move up
- Demotion: Bottom 10% stay (no demotion from Bronze)

**Silver League:**
- 0-50 players per league
- Promotion: Top 15% move up
- Demotion: Bottom 20% move down

**Gold League:**
- 0-50 players per league
- Top 10% get "Gold Elite" badge
- Demotion: Bottom 25% move down

### League Assignment Algorithm

**Week 1:** All new users → Bronze
**Week 2+:** Based on previous week's performance
- Top performers → Higher league
- Consistent performers → Same league
- Struggling performers → Lower league

**Balancing:**
- Prevent "smurfing" (intentional demotion)
- Grace period: First 2 weeks, no demotion
- League size: 20-50 players (optimal competition)

### Weekly Competition Scoring

```
Weekly Score = Sum of Daily Points for the Week

Tiebreaker:
1. Most perfect days (100% under goal)
2. Longest streak
3. Lowest total usage time
```

---

## 4. Achievement System

### Achievement Categories

**Milestone Achievements:**
- First Clean Day
- 3-Day Streak
- 7-Day Streak
- 30-Day Streak
- 100-Day Streak

**Usage-Based Achievements:**
- "TikTok Slayer" - Under 30 min/day for TikTok
- "Instagram Minimalist" - Under 15 min/day for Instagram
- "Social Media Master" - Under 1 hour total/day

**Competition Achievements:**
- "Week Warrior" - Win weekly league
- "Top 3" - Finish in top 3
- "Comeback Kid" - Climb from bottom 10 to top 10

**Social Achievements:**
- "Friend Leader" - Invite 5 friends
- "Team Player" - Compete with 10+ friends
- "Community Builder" - Create a friend group

### Achievement Rewards

- Badge displayed on profile
- One-time point bonus
- Unlock avatar customization
- Special title/emoji

---

## 5. Balancing Philosophy

### Anti-Punishment Design

**Grace Days:**
- 1 free "grace day" per week
- User can manually activate
- Prevents streak loss from one bad day
- Encourages long-term engagement

**Catch-Up Mechanics:**
- Missed days don't reset progress
- Bonus points for returning after absence
- "Welcome Back" rewards

**Progressive Difficulty:**
- Goals adapt to user's history
- Not too easy (boring) or too hard (demotivating)
- 70% success rate target

### Point Economy

**Daily Point Range:**
- Minimum (just under goal): ~100 points
- Average (50% under goal): ~600 points
- Perfect day: ~2400 points (with bonuses)

**Weekly Point Range:**
- Casual user: 2,000-4,000 points
- Active user: 4,000-8,000 points
- Power user: 8,000-15,000 points

**Leveling Speed:**
- Level 1-5: 1-2 weeks
- Level 5-10: 2-4 weeks
- Level 10+: 4+ weeks per level

---

## 6. Social Features

### Friend System

**Invite Code:**
- 6-character alphanumeric code
- Shareable via any platform
- No contact access required

**Friend Features:**
- See friend's daily progress (anonymized until end of day)
- Weekly leaderboard with friends
- Friend challenges (optional 1v1)
- Celebration notifications

**Privacy:**
- Users control visibility
- Opt-in to friend comparisons
- Anonymous mode available

---

## 7. Progression Rewards

### Unlockables

**Avatars:**
- Base avatar (free)
- Level 5: Custom colors
- Level 10: Custom accessories
- Level 20: Premium avatars

**Titles:**
- "Disciplined" (Level 5)
- "Focused" (Level 10)
- "Master" (Level 20)
- "Legend" (Level 50)

**Themes:**
- Light/Dark mode
- Color schemes unlockable
- Seasonal themes (holidays)

---

## 8. Daily Challenges (Future)

**Optional Daily Challenges:**
- "Stay under 1 hour today" (bonus 500 points)
- "No TikTok before noon" (bonus 300 points)
- "Weekend warrior" (weekend-specific challenges)

**Challenge Types:**
- Time-based (stay under X minutes)
- App-specific (avoid specific app)
- Time-window (no usage during certain hours)

---

## 9. Feedback Loops

### Positive Reinforcement

**Micro-Feedback:**
- Confetti on goal achievement
- Haptic feedback on milestones
- Celebration sounds (optional, can disable)

**Macro-Feedback:**
- Weekly summary with growth charts
- "You've improved X% this month"
- Achievement celebration screens

**Social Feedback:**
- Friend activity notifications
- League position updates
- "You're catching up!" messages

### Avoid Shaming

**Language:**
- "You're doing great!" not "You failed"
- "Almost there!" not "You went over"
- "Tomorrow's a new day" not "You broke your streak"

**Visual Design:**
- Green/yellow/red color coding (not just red for bad)
- Progress bars that celebrate small wins
- Encouraging illustrations

---

## 10. Retention Mechanics

**Daily Login Rewards:**
- Day 1: 50 bonus points
- Day 2: 100 bonus points
- Day 3: 150 bonus points
- Day 7: 500 bonus points
- Resets weekly

**Streak Protection:**
- Grace days prevent loss
- "Streak Freeze" item (earnable, not purchasable)

**FOMO Prevention:**
- No time-limited exclusive content
- All achievements always available
- Catch-up mechanics for missed time


