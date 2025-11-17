# TrueFund - Transparent Crowdfunding Platform

A production-ready crowdfunding web application built with Vite, React, TypeScript, Express, and Supabase. TrueFund enables users to create and support campaigns for medical needs, education, disaster relief, and community causes with complete transparency and verification.

## Features

### Core Functionality
- **Campaign Management**: Create, browse, and manage fundraising campaigns
- **Medical Verification**: Hospital email verification system for medical campaigns
- **Temporary Launch**: Accept donations immediately while awaiting verification
- **NGO Verification**: Official verification process for NGO organizations
- **QR Code Generation**: Generate QR codes and posters for offline fundraising
- **Donation System**: Secure donation processing with optional platform tips
- **Admin Dashboard**: Comprehensive admin panel for managing verifications and support tickets
- **Support System**: Integrated ticketing system for user support

### Technical Highlights
- **Responsive Design**: Mobile-first design with dedicated mobile navigation
- **Real-time Updates**: TanStack Query for efficient data fetching and caching
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Image Storage**: Supabase Storage for campaign images and documents
- **Authentication**: Supabase Auth with email magic links
- **Modern UI**: Shadcn UI components with Tailwind CSS
- **SEO Optimized**: Meta tags and Open Graph support

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Wouter (routing)
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: TanStack Query v5
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd truefund
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Go to SQL Editor and run the migrations:
   - Copy and run all SQL from `supabase/init.sql` to create tables and RLS policies
   - (Optional) Run `supabase/seed.sql` to add demo reviews

4. Create Storage Buckets:
   - Go to Storage in your Supabase dashboard
   - Create bucket `campaign-images` with **public** access
   - Create bucket `ngo-docs` with **private** access

### 3. Environment Variables

Create a `.env` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the `.env` file with your Supabase credentials:

\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SESSION_SECRET=your-random-session-secret-here
\`\`\`

### 4. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:5000`

## Project Structure

\`\`\`
truefund/
├── api/                    # Vercel serverless API endpoint
│   └── index.ts
├── client/                 # Frontend React application
│   └── src/
│       ├── components/     # React components
│       │   ├── ui/        # Shadcn UI components
│       │   ├── CampaignCard.tsx
│       │   ├── Header.tsx
│       │   └── MobileNav.tsx
│       ├── pages/         # Page components
│       │   ├── Home.tsx
│       │   ├── Explore.tsx
│       │   ├── CampaignDetail.tsx
│       │   ├── StartCampaign.tsx
│       │   ├── Auth.tsx
│       │   ├── Profile.tsx
│       │   ├── NgoDashboard.tsx
│       │   ├── AdminPanel.tsx
│       │   └── Support.tsx
│       ├── lib/           # Utilities
│       │   ├── supabase.ts
│       │   ├── queryClient.ts
│       │   ├── qrcode.ts
│       │   └── utils.ts
│       └── App.tsx        # Main app component
├── server/                # Backend Express server
│   ├── routes.ts         # API route handlers
│   ├── supabase.ts       # Server Supabase client
│   └── index.ts          # Server entry point
├── supabase/             # Database migrations
│   ├── init.sql          # Schema and RLS policies
│   └── seed.sql          # Demo data
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Data models and types
└── design_guidelines.md  # UI/UX design system
\`\`\`

## Deployment to Vercel

### 1. Install Vercel CLI (Optional)

\`\`\`bash
npm i -g vercel
\`\`\`

### 2. Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Configure environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`

4. Deploy!

### 3. Deploy via CLI

\`\`\`bash
vercel
\`\`\`

Follow the prompts and add your environment variables when asked.

## Usage Guide

### Creating a Campaign

1. Click "Start a Campaign" in the header
2. Fill in campaign details (title, description, category, goal)
3. Add location and optional campaign image
4. For medical campaigns:
   - Enter hospital email for verification
   - Choose "Launch Now (Temporary)" to accept donations immediately
5. Review and submit

### Making a Donation

1. Browse campaigns on the home page or explore page
2. Click on a campaign to view details
3. Click "Donate Now"
4. Enter optional name and donation amount
5. Choose to add 10% tip to support platform costs
6. Complete donation

### Admin Functions

1. Sign up and create an account
2. Manually set admin status in Supabase:
   \`\`\`sql
   UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
   \`\`\`
3. Access admin panel at `/admin`
4. Manage NGO verifications, campaigns, and support tickets

### NGO Verification

1. Navigate to `/ngo-dashboard`
2. Upload NGO registration documents
3. Wait for admin approval (24-48 hours)
4. Once verified, access special features:
   - Create Disaster Relief campaigns
   - Display verified NGO badge
   - Priority listing

## API Endpoints

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `GET /api/campaigns/my` - Get user's campaigns (authenticated)
- `POST /api/campaigns` - Create campaign (authenticated)

### Donations
- `GET /api/campaigns/:id/donations` - List campaign donations
- `GET /api/donations/my` - Get user's donations (authenticated)
- `POST /api/donations` - Make donation

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review (authenticated)

### Tickets
- `GET /api/admin/tickets` - List all tickets (admin)
- `POST /api/tickets` - Create support ticket
- `PATCH /api/admin/tickets/:id` - Update ticket (admin)

### NGO Verifications
- `GET /api/ngo-verifications/my` - Get user verification status (authenticated)
- `POST /api/ngo-verifications` - Request verification (authenticated)
- `GET /api/admin/ngo-verifications` - List all verifications (admin)
- `PATCH /api/admin/ngo-verifications/:id` - Update verification (admin)

### Stats
- `GET /api/stats` - Get platform statistics

## Database Schema

See `supabase/init.sql` for complete schema with:
- `users` - User profiles
- `campaigns` - Fundraising campaigns
- `donations` - Donation transactions
- `reviews` - Platform reviews
- `tickets` - Support tickets
- `ngo_verifications` - NGO verification requests

All tables have Row Level Security (RLS) policies enabled.

## Design System

The application follows a comprehensive design system documented in `design_guidelines.md`:
- Color palette: Primary blues, accent colors, semantic colors
- Typography: Inter font family
- Spacing: Consistent 4px grid system
- Components: Shadcn UI with custom theming
- Responsive: Mobile-first breakpoints

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Create an issue on GitHub
2. Use the in-app support system at `/support`
3. Email: support@truefund.com (demo)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Database and Auth by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
