# MCS Consultancy App

This project is a Vite+React application powered by Supabase.

## Features

- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: TanStack Query (React Query)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
   ```
   *See `docs/SUPABASE_SETUP.md` for detailed instructions.*

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Admin Access

Navigate to `/AdminLogin` to access the CMS. Ensure you have created an admin user via the setup scripts.
