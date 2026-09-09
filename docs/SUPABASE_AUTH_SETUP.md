# Supabase Authentication Setup

This document explains how authentication and admin access are configured in this project.

## Environment Variables

Set these in `.env.local`:

- `VITE_SUPABASE_URL` – your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` – the browser-safe publishable key

## Tables and Functions

- `auth.users` – Supabase built-in users
- `public.user_profiles` – per-user profile (id = auth.uid())
- `public.admin_users` – list of admin user ids
- `public.is_admin()` – checks `admin_users`

## RLS Overview

- `user_profiles`: users can read/insert/update own; admins can read/update/delete all
- `faqs`, `portfolio`, `testimonials`: public `SELECT`, admin `INSERT/UPDATE/DELETE`

## Promotion Flow

If your `user_profiles.role = 'admin'` but RPCs return "not authorized", call `public.promote_self_admin()` once to add your id to `admin_users`.

## Notes

- Avatars bucket: `storage.buckets(id='avatars')` stores user profile images at `avatars/{auth.uid()}/...`
- For local development, some admin routes allow access when a session exists and network is flaky.
