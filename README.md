# JobScout - AI-Powered Resume Tailoring

Job Post (input) → AI → (output) Bulletpoint Tailored to Job Spec, skills, achievements, keywords etc, $ Resume builder

## Tech Stack

**Frontend & Backend:**
- TypeScript + Next.js + Tailwind CSS
- Supabase - PostgreSQL + Authentication
- Stripe (planned)

**AI:**
- OpenAI GPT-4 mini (cost-effective)

**Inputs:** 
- PDF, URL, Text

## Features

✅ **Authentication System**
- Google OAuth via Supabase
- Persistent sessions
- Protected routes

✅ **UI Components**
- Clean, modern interface with Geist font
- Responsive design
- Modal system for auth and prompt creation
- Loading states

✅ **Architecture**
- Domain-driven design (user/prompt domains)
- Zod schema validation
- Component isolation
- Pure functions with documentation

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase Authentication
Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 3. Environment Variables
Create `.env.local` with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/
├── components/           # Shared components
├── contexts/            # React contexts (auth)
├── lib/                # Utilities (supabase, openai)
├── user/               # User domain
│   ├── components/
│   └── state/
├── prompt/             # Prompt domain
│   ├── components/
│   └── types.ts
└── auth/               # Auth routes
    └── callback/
```

## Current Status

🟢 **Complete:**
- Authentication system with Google OAuth
- Component architecture with proper typing
- Empty state and command center UI
- Modal system for authentication and prompt creation

🟡 **In Progress:**
- OpenAI integration for job post processing
- Resume content generation

🔴 **Planned:**
- File upload (PDF resumes)
- Payment integration with Stripe
- Resume builder interface
- Export functionality

## Contributing

1. Follow the established architecture patterns
2. Use Zod schemas for all data types
3. Maintain component isolation between domains
4. Document pure functions
5. Test authentication flows before submitting PRs



