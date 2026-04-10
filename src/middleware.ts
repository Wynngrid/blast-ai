import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse } = await updateSession(request)
  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes that don't need auth refresh
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
