import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './supabase-client'

// Server-side Supabase client for server components
export const createServerClient = () => createServerComponentClient<Database>({ cookies })

// Route handler Supabase client for API routes
export const createRouteClient = () => createRouteHandlerClient<Database>({ cookies }) 