# TrueFund - Transparent Crowdfunding Platform

## Overview

TrueFund is a production-ready crowdfunding web application designed to facilitate transparent fundraising for medical needs, education, disaster relief, and community causes. The platform features campaign management, verification systems for medical and NGO campaigns, QR code generation for offline fundraising, secure donation processing with optional platform tips, and comprehensive admin tools for managing verifications and support tickets.

The application is built with a modern tech stack focusing on type safety, real-time updates, and responsive design with mobile-first principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety across the entire frontend
- Vite as the build tool and development server for fast builds and hot module replacement
- Wouter for lightweight client-side routing (alternative to React Router)

**State Management & Data Fetching**
- TanStack Query v5 (formerly React Query) handles all server state management, caching, and real-time updates
- Custom query client configured in `client/src/lib/queryClient.ts` with automatic token injection for authenticated requests
- No global state management library needed - server state handled by TanStack Query, local UI state handled by React hooks

**UI Component System**
- Shadcn UI component library (New York style variant) providing pre-built, accessible components
- Radix UI primitives for unstyled, accessible component foundations
- Tailwind CSS for utility-first styling with custom design tokens
- Design system defined in `design_guidelines.md` referencing trusted crowdfunding platforms

**Form Handling & Validation**
- React Hook Form for performant form state management
- Zod schemas for runtime type validation via @hookform/resolvers
- Forms use controlled components with validation feedback

**Authentication Flow**
- Supabase Auth handles all authentication via magic link (OTP) email system
- Client-side session management through Supabase client
- Auth token automatically injected into API requests via query client
- Session state exposed through TanStack Query for reactive UI updates

### Backend Architecture

**Server Framework**
- Express.js running on Node.js
- TypeScript for type safety matching frontend conventions
- Dual entry points: `server/index.ts` for development, `api/index.ts` for Vercel serverless deployment

**API Design**
- RESTful API endpoints under `/api/*` namespace
- Request/response logging middleware for debugging
- Session-based authentication using Supabase tokens from Authorization header
- Service role key used server-side for admin operations bypassing RLS

**Key API Endpoints**
- `/api/auth/*` - Authentication and user session management
- `/api/campaigns` - Campaign CRUD operations
- `/api/donations` - Donation processing and history
- `/api/ngo-verifications` - NGO verification workflow
- `/api/admin/*` - Admin panel operations (verifications, tickets, fund release)
- `/api/tickets` - Support ticket system

### Database Architecture

**Database Platform**
- Supabase (managed PostgreSQL) providing database, authentication, and storage
- Drizzle ORM configured for type-safe database queries (schema in `shared/schema.ts`)
- Environment configured for potential Postgres adapter despite Drizzle setup (DATABASE_URL expected)

**Schema Design**
- `users` - User profiles with KYC and NGO status flags
- `campaigns` - Campaign data with verification status, unique codes, goal/collected amounts
- `donations` - Donation records with optional platform tips and release status
- `reviews` - User reviews and testimonials
- `tickets` - Support ticket system
- `ngo_verifications` - NGO verification requests and document storage

**Security Model**
- Row Level Security (RLS) policies enforced at database level
- Public read access for campaigns (browsing)
- Authenticated users can insert donations and update own profile
- Admin operations use service role key to bypass RLS
- Sensitive operations (fund release, verification approval) restricted to admin endpoints

**Data Relationships**
- Campaigns reference users (created_by) for ownership
- Donations reference campaigns and optionally users (donor_id)
- NGO verifications reference users for verification tracking
- Foreign keys enforce referential integrity

### External Dependencies

**Supabase Services**
- **Authentication**: Magic link (OTP) email authentication system
- **Database**: PostgreSQL with Row Level Security
- **Storage**: 
  - `campaign-images` bucket for campaign photos and documents
  - `ngo-docs` bucket for NGO verification documents
- **Configuration**: Requires `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client), and `SUPABASE_SERVICE_ROLE_KEY` (server)

**Third-Party Libraries**
- **QR Code Generation**: `qrcode` package generates QR codes for campaigns, enabling offline fundraising
- **UI Components**: Radix UI primitives (@radix-ui/*) for accessible component foundations
- **Styling**: Tailwind CSS with autoprefixer via PostCSS
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation

**Development Tools**
- TypeScript compiler for type checking
- Vite plugins for Replit integration (cartographer, dev banner, runtime error overlay)
- Drizzle Kit for database schema management and migrations

**Deployment Platform**
- Vercel configured as primary deployment target (vercel.json)
- Static build output served from `dist` directory
- Serverless functions via `api/index.ts` handler
- Environment variables managed through Vercel dashboard

**External APIs**
- Google Charts API used for QR code generation fallback (`https://chart.googleapis.com/chart`)
- Email delivery handled by Supabase Auth service