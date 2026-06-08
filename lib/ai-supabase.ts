import { createClient } from '@supabase/supabase-js'

// Service-role Supabase client for the ai.zanafitness.com tool.
//
// The tool authenticates by password (not Supabase auth), so there's no user
// session to scope queries with. It reads/writes with the service role, which
// bypasses RLS — safe because the whole tool sits behind the password wall.
// NEVER import this into anything that runs on the main member/coach app.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
