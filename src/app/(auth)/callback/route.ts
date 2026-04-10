import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('OAuth exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/error?message=${encodeURIComponent(exchangeError.message)}`)
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return NextResponse.redirect(`${origin}/error?message=Failed to get user data`)
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (new user)
      console.error('Profile query error:', profileError)
    }

    // If OAuth user is new (no profile yet), the trigger should have created one
    // Default to enterprise role for OAuth users
    // If no profile exists after trigger (edge case), create one
    if (!profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: 'enterprise',
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
        })

      if (insertError) {
        console.error('Failed to create profile:', insertError)
      }

      // Also create enterprise record for OAuth users
      const { error: enterpriseError } = await supabase
        .from('enterprises')
        .insert({
          user_id: user.id,
          company_name: user.user_metadata?.full_name || 'My Company',
        })

      if (enterpriseError) {
        console.error('Failed to create enterprise record:', enterpriseError)
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }

    // Redirect based on role
    if (profile.role === 'admin') {
      return NextResponse.redirect(`${origin}/admin`)
    } else if (profile.role === 'practitioner') {
      return NextResponse.redirect(`${origin}/portal`)
    } else {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // No code present
  return NextResponse.redirect(`${origin}/error?message=No authorization code provided`)
}
