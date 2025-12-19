# ScreenTimeBattle - UX Flow & Wireframe Descriptions

## Design Philosophy
- **Playful but Clean**: Duolingo's fun with Apple Fitness's polish
- **Positive Reinforcement**: Celebrate wins, don't shame losses
- **Clear Hierarchy**: Game mechanics visible, analytics secondary
- **Smooth Animations**: Reanimated for 60fps feel

---

## 1. Onboarding Flow

### Screen 1: Welcome Splash
**Layout:**
- Full-screen gradient background (purple to blue)
- Large app icon/logo (animated entrance)
- Tagline: "Turn screen time into a game"
- "Get Started" button (rounded, prominent)

**Animation:**
- Logo scales in with bounce
- Gradient animates subtly
- Button pulses gently

### Screen 2: Permission Request
**Layout:**
- Illustration: Phone with shield icon
- Headline: "We need usage access"
- Body: "To track your social media time and award points, we need permission to see app usage. We only track the apps you choose."
- "Grant Permission" button
- "Why?" link (expands explanation)

**UX Notes:**
- Explain benefit before asking
- Show privacy commitment
- Link to privacy policy

### Screen 3: App Selection
**Layout:**
- Headline: "Which apps should we track?"
- Toggle list:
  - [ ] TikTok
  - [ ] Instagram
  - [ ] Facebook
  - [ ] Twitter/X
  - [ ] Snapchat
  - [ ] YouTube (optional, can exclude)
  - [ ] Reddit
  - [ ] Other (search/add)
- "Select All Social" quick action
- "Continue" button

**UX Notes:**
- Pre-select common social apps
- Allow customization
- Show app icons for recognition

### Screen 4: Goal Setting
**Layout:**
- Headline: "Set your daily goal"
- Large time picker: [2] hours [0] minutes
- Slider alternative (visual)
- Context: "Most users start with 2 hours"
- "I'll decide later" option
- "Start Playing" button

**UX Notes:**
- Don't force perfection
- Allow adjustment later
- Suggest reasonable starting point

### Screen 5: Account Creation
**Layout:**
- "Create Your Profile" headline
- Avatar selection (6 base options)
- Username input
- "Create Account" button
- "Skip for now" option

**UX Notes:**
- Quick, optional
- Can complete later
- Focus on getting started

### Screen 6: First Day Setup
**Layout:**
- Celebration illustration
- "You're all set!"
- "Your first day starts now"
- "Go to Dashboard" button

---

## 2. Main Dashboard (Home Screen)

### Layout Structure

**Top Section:**
- Avatar + Username (tap for profile)
- Current level badge (e.g., "Level 5")
- XP progress bar (animated, shows next level)
- Streak indicator (🔥 7 days)

**Today's Progress Card (Large, Prominent):**
- Circular progress ring (0-100%)
- Current usage: "1h 23m / 2h 0m"
- Points earned today: "450 pts"
- Status message: "You're crushing it! 🎉"
- Color coding:
  - Green: Under 50% of goal
  - Yellow: 50-80% of goal
  - Orange: 80-100% of goal
  - Red: Over goal (but still encouraging)

**Quick Stats Row:**
- 3 cards side-by-side:
  - Weekly total: "8h 45m"
  - League rank: "#12 / 45"
  - Streak: "7 days"

**Action Buttons:**
- "View Details" (today's breakdown)
- "Weekly Leaderboard"
- "Set Goal" (quick adjust)

**Bottom Navigation:**
- Home (active)
- Stats
- League
- Profile

### Animations
- Progress ring fills smoothly
- Points counter animates on update
- Haptic feedback on milestones (50%, 75%, 100%)

---

## 3. Daily Details Screen

### Layout

**Header:**
- Date selector (swipe for previous days)
- "Today" badge if current day

**Summary Card:**
- Total time: Large number
- Points earned: Highlighted
- Goal status: Icon + message
- Share button (optional)

**App Breakdown Table:**
- Scrollable list
- Each row:
  - App icon
  - App name
  - Time used: "45m"
  - Percentage of total: Progress bar
  - Points: "+120 pts" (if under goal)
- Sortable: Time, Points, Alphabetical

**Achievements Unlocked:**
- Badge grid (if any today)
- Tap to see details

**Time Chart:**
- Hourly breakdown (bar chart)
- Shows peak usage times
- Interactive (tap for details)

---

## 4. Weekly Leaderboard Screen

### Layout

**Header:**
- Week selector (current week default)
- "Ends in 2 days" countdown
- League badge (Bronze/Silver/Gold)

**Your Position Card:**
- Large, highlighted
- Rank: "#12"
- Points: "4,250 pts"
- Time: "14h 30m"
- Progress bar showing distance to next rank

**Leaderboard List:**
- Top 10 shown prominently
- Each entry:
  - Rank number (with medal icons for top 3)
  - Avatar
  - Username
  - Points
  - Time (optional, can hide)
  - "Friend" badge if applicable
- Your position always visible (pinned if not in top 10)

**Filters:**
- "All Players"
- "Friends Only"
- Toggle switches

**Actions:**
- "Invite Friends" button (prominent)
- "View Full Leaderboard" (if >50 players)

### Animations
- Rank changes animate (slide up/down)
- Medal icons sparkle for top 3
- Countdown timer pulses near end

---

## 5. League Screen

### Layout

**Current League Card:**
- Large league badge (Bronze/Silver/Gold)
- League name: "Bronze League #42"
- Your rank: "#12 of 45"
- "Promotion Zone" indicator if in top 20%

**League Info:**
- "Top 20% promote to Silver"
- "Bottom 10% stay in Bronze"
- Progress indicator showing your position

**Recent Activity:**
- "Sarah just promoted to Silver!"
- "Mike joined your league"
- Activity feed

**League History:**
- Previous weeks' performance
- Promotion/demotion history
- Graph showing league progression

---

## 6. Stats Screen

### Layout

**Time Period Selector:**
- Tabs: Today | Week | Month | All Time

**Overview Cards:**
- Total time saved (vs. baseline)
- Average daily usage
- Best day (lowest usage)
- Current streak

**Charts:**
- Daily usage trend (line chart)
- App breakdown (pie chart)
- Usage by day of week (bar chart)
- Hourly heatmap (when did you use apps most?)

**Achievements Section:**
- Grid of unlocked achievements
- Locked achievements shown (grayed out)
- Progress indicators for in-progress achievements

**Insights:**
- "You've improved 23% this month"
- "Your best day was Tuesday"
- "You use TikTok most at 8 PM"

---

## 7. Profile Screen

### Layout

**Profile Header:**
- Large avatar (editable)
- Username (editable)
- Level badge
- Title: "Disciplined" (based on level/achievements)

**Stats Summary:**
- Total points: "45,230"
- Current streak: "12 days"
- Total days active: "45 days"
- League: "Silver"

**Achievements:**
- Grid of badges
- Tap to see details
- "X of Y unlocked" counter

**Settings:**
- Daily goal
- Notifications
- Privacy
- Friends
- Invite code (shareable)
- Logout

**Social:**
- Friends list
- Friend requests
- Invite friends

---

## 8. Achievement Unlock Screen

### Layout (Modal/Overlay)

**Animation:**
- Confetti explosion
- Badge scales in with bounce
- Sound effect (optional)

**Content:**
- Large achievement badge/icon
- Achievement name: "7-Day Discipline"
- Description: "You've maintained your streak for 7 days!"
- Points earned: "+1,000 pts"
- "Awesome!" button (dismisses)

**UX Notes:**
- Non-intrusive (can swipe away)
- Celebratory but not annoying
- Share option (optional)

---

## 9. Notification Design

### Push Notification Types

**Milestone Notifications:**
- "🎉 You're at 50% of your goal!"
- "🔥 7-day streak! Keep it up!"
- "You earned 500 points today!"

**Social Notifications:**
- "Sarah just leveled up!"
- "You're #3 in your league!"
- "Mike sent you a friend request"

**Reminder Notifications:**
- "Don't forget to check your progress!"
- "Weekly results are in!"

**Design:**
- Positive, encouraging language
- Emoji for visual interest
- Action buttons (optional): "View" | "Dismiss"

---

## 10. Empty States

### No Data Yet
- Illustration: Phone with clock
- "Tracking starts tomorrow"
- "Set your goal to begin"

### No Friends
- Illustration: People icon
- "Invite friends to compete"
- "Share your invite code"

### No Achievements
- Illustration: Trophy
- "Complete challenges to unlock achievements"
- "Start your first streak!"

---

## 11. Error States

### Permission Denied
- Illustration: Shield with X
- "We need usage access to track your progress"
- "Grant Permission" button
- Link to settings

### No Internet
- "You're offline"
- "Your progress is saved locally"
- "We'll sync when you're back online"

### Tracking Not Working
- "Having trouble tracking?"
- Troubleshooting steps
- "Contact Support" link

---

## 12. Micro-Interactions

### Button Presses
- Scale down slightly (0.95x)
- Haptic feedback
- Smooth release

### Swipe Gestures
- Swipe left/right on daily details for previous/next day
- Pull to refresh on leaderboard
- Swipe down to dismiss modals

### Progress Animations
- Progress bars fill smoothly (ease-out)
- Numbers count up (not instant)
- Circular progress rings rotate

### Loading States
- Skeleton screens (not spinners)
- Shimmer effect on cards
- Progressive data loading

---

## 13. Color Palette

### Primary Colors
- **Purple**: #6C5CE7 (primary actions, progress)
- **Blue**: #00D2FF (secondary, accents)
- **Green**: #00D084 (success, under goal)
- **Yellow**: #FFC312 (warning, approaching goal)
- **Orange**: #FF6B6B (caution, near goal)
- **Red**: #EE5A6F (over goal, but used sparingly)

### Neutral Colors
- **Dark**: #2D3436 (text, dark mode)
- **Gray**: #636E72 (secondary text)
- **Light Gray**: #DFE6E9 (borders, dividers)
- **White**: #FFFFFF (background, light mode)

### Usage
- Green: Under 50% of goal
- Yellow: 50-80% of goal
- Orange: 80-100% of goal
- Red: Over goal (but with encouraging message)

---

## 14. Typography

### Headlines
- **Font**: Bold, 24-32px
- **Weight**: 700
- **Line Height**: 1.2

### Body Text
- **Font**: Regular, 16px
- **Weight**: 400
- **Line Height**: 1.5

### Numbers/Stats
- **Font**: Monospace or rounded, 20-48px
- **Weight**: 600-700
- **Color**: Primary color

### Labels
- **Font**: Regular, 14px
- **Weight**: 500
- **Color**: Gray

---

## 15. Spacing & Layout

### Grid System
- 8px base unit
- Padding: 16px, 24px, 32px
- Margins: 8px, 16px, 24px

### Card Design
- Rounded corners: 16px
- Shadow: Subtle elevation
- Padding: 16-24px
- Spacing between cards: 16px

### Screen Margins
- Horizontal: 16-20px
- Vertical: Safe area aware

---

## 16. Accessibility

### Text Sizes
- Support system font scaling
- Minimum 14px for body text
- High contrast mode support

### Touch Targets
- Minimum 44x44px
- Adequate spacing between buttons

### Screen Readers
- Proper labels for all interactive elements
- Announcements for important updates
- Skip navigation options

### Color Blindness
- Don't rely solely on color
- Use icons + color
- Patterns/textures where helpful


