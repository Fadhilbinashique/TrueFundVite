# TrueFund Design Guidelines

## Design Approach
**Reference-Based Strategy:** Drawing inspiration from trusted crowdfunding platforms (GoFundMe, Kickstarter) combined with modern fintech aesthetics (Stripe's clarity, Wise's approachability). Trust, transparency, and emotional connection are paramount.

## Typography System
- **Primary Font:** Inter (Google Fonts) - clean, professional, excellent readability
- **Headline Hierarchy:** 
  - Hero/Page Titles: text-5xl md:text-6xl font-bold
  - Section Headers: text-3xl md:text-4xl font-semibold
  - Card Titles: text-xl font-semibold
  - Body Text: text-base font-normal
  - Small Labels: text-sm font-medium

## Layout & Spacing
**Tailwind Spacing Units:** Consistently use 4, 6, 8, 12, 16, 20, 24 (p-4, mb-8, gap-6, etc.)
- Section Padding: py-16 md:py-24
- Container: max-w-7xl mx-auto px-4 md:px-6
- Card Spacing: p-6 md:p-8
- Grid Gaps: gap-6 md:gap-8

## Component Library

### Home Page
**Hero Section (100vh):**
- Full-width background gradient overlay on hero image
- Centered content: Large headline "Fund What Matters" + subheadline + dual CTAs ("Start Campaign" primary, "Explore Causes" secondary)
- Blurred background buttons (backdrop-blur-sm bg-white/20)
- Search bar with unique code input below CTAs

**Trust Indicators Section:**
- 3-column grid: Total raised, Campaigns funded, Lives impacted (large numbers with icons)

**Featured Campaigns:**
- 3-column grid (1 column mobile) of campaign cards
- Each card: Campaign image (16:9), category badge, title, location, progress bar with percentage, raised/goal amounts, "Donate" button

**Trending Section:**
- Horizontal scrollable carousel on mobile, 4-column grid desktop
- Smaller card format with quick stats

### Explore Page
**Filter Sidebar (desktop) / Drawer (mobile):**
- Filter chips: Location dropdown, Category pills (Medical, Education, Disaster Relief, Community), Verified toggle, Urgency badges
- Sort: Newest, Most Funded, Ending Soon, Verified First

**Campaign Grid:**
- Masonry layout for visual interest
- Infinite scroll with loading skeleton cards

### Campaign Detail Page
**Hero Section:**
- Large campaign image (full-width, aspect-video)
- Category badge + Verified checkmark overlay (top-right)

**Two-Column Layout (desktop stacks on mobile):**

*Left Column (2/3 width):*
- Title (text-4xl font-bold)
- Creator info card: Profile photo, name, "Created by" label
- Full description with rich text formatting
- Milestones timeline (vertical line with checkpoints)
- Reviews section: Star ratings, review cards with user photos
- Location map embed

*Right Column (1/3 width, sticky):*
- Raised amount (large, bold) / Goal amount
- Progress bar (thick, animated gradient)
- Supporter count
- Days remaining badge
- "Donate Now" primary button (large, full-width)
- "Share" + "Download QR" secondary buttons
- "Generate Poster" tertiary button

### Start Campaign Page
**Multi-Step Form:**
- Progress indicator (Step 1/5 dots)
- Large form fields with clear labels
- Image upload zone: Drag-and-drop with preview
- Cause dropdown with icon indicators
- Conditional hospital email field (Medical only)
- Temporary launch toggle with explainer tooltip
- Review step before final submit

### Profile Page
**Header Card:**
- Profile photo (large circular), name, edit profile button
- Stats row: Campaigns created, Total raised, Donations made

**Tabs:**
- My Campaigns: Card grid with edit/manage buttons
- My Donations: List view with campaign thumbnails, amounts, dates
- Settings: Update profile, notification preferences

### NGO Dashboard
**Verification Status Card:**
- Upload documents section with drag-drop
- Status badge (Pending/Verified)
- Document previews

**NGO Campaign Creation:**
- Enhanced form with Disaster Relief option enabled
- Verification badge display

### Admin Panel
**Dashboard Grid:**
- Pending verifications count card
- Funds to release card
- Open tickets card
- Recent activity feed

**Tables:**
- Verification requests: User, documents link, approve/reject actions
- Fund release queue: Campaign, amount, verify button
- Ticket management: Sortable, filterable, status updates

### Mobile Navigation
**Bottom Bar (fixed):**
- 4 icons: Home, Explore, Start (+ icon, highlighted), Profile
- Active state: Icon color change + label appears

## Interactions & Animations
**Minimal, Purposeful Motion:**
- Progress bar fill animation on page load
- Card hover: Subtle lift (shadow-lg) + scale (scale-105)
- Button press: scale-95 active state
- Skeleton loading for async content
- Toast notifications for actions (success/error)

## Images
**Hero Image:** Emotional, diverse people helping/receiving aid (Unsplash: community support, charity, volunteering)
**Campaign Images:** 16:9 ratio, high quality, relevant to cause
**Profile Photos:** Circular, 48px-128px depending on context
**Poster Generator:** Canvas compositing campaign image + QR + TrueFund logo watermark (bottom-right)
**QR Codes:** Generated with small TrueFund logo centered overlay

## Forms & Inputs
- Input fields: Rounded borders (rounded-lg), focus ring (ring-2 ring-primary)
- Buttons: Rounded-lg, shadow-sm, font-semibold
- Primary: Solid background, white text
- Secondary: Outlined, transparent background
- Disabled state: Reduced opacity (opacity-50)

## Trust & Credibility Elements
- Verified badges throughout (checkmark icon)
- Progress bars always visible with exact percentages
- Transparent fund allocation displays
- Prominent review/rating displays
- Hospital verification status clearly indicated
- Secure payment badges (even if demo)

This design prioritizes trust, emotional engagement, and clarity—essential for crowdfunding success.