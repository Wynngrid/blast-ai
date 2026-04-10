---
phase: 01-foundation-authentication
reviewed: 2026-04-10T00:00:00Z
depth: standard
files_reviewed: 28
files_reviewed_list:
  - src/actions/admin.ts
  - src/actions/auth.ts
  - src/app/(auth)/callback/route.ts
  - src/app/(auth)/error/page.tsx
  - src/app/(auth)/layout.tsx
  - src/app/(auth)/login/page.tsx
  - src/app/(auth)/signup/enterprise/page.tsx
  - src/app/(auth)/signup/page.tsx
  - src/app/(auth)/signup/practitioner/page.tsx
  - src/app/admin/layout.tsx
  - src/app/admin/page.tsx
  - src/app/dashboard/layout.tsx
  - src/app/dashboard/page.tsx
  - src/app/portal/layout.tsx
  - src/app/portal/page.tsx
  - src/app/portal/pending/page.tsx
  - src/components/features/admin/pending-practitioners-list.tsx
  - src/components/features/auth/enterprise-signup-form.tsx
  - src/components/features/auth/login-form.tsx
  - src/components/features/auth/oauth-buttons.tsx
  - src/components/features/auth/practitioner-signup-form.tsx
  - src/lib/supabase/client.ts
  - src/lib/supabase/middleware.ts
  - src/lib/supabase/server.ts
  - src/lib/validations/auth.ts
  - src/middleware.ts
  - src/types/database.ts
  - supabase/migrations/00001_initial_schema.sql
findings:
  critical: 7
  warning: 5
  info: 3
  total: 15
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-10T00:00:00Z
**Depth:** standard
**Files Reviewed:** 28
**Status:** issues_found

## Summary

Reviewed the authentication foundation phase covering user authentication, role-based access control, OAuth integration, and admin approval workflows. The implementation uses Next.js 16 Server Actions with Supabase Auth and follows modern patterns. However, several critical security vulnerabilities and logic errors were identified that could lead to authentication bypasses, privilege escalation, and data inconsistency.

Key concerns:
- Multiple null pointer dereference risks that could crash pages
- Authorization bypass vulnerabilities in role-based redirects
- Missing error handling in database operations leading to silent failures
- Race conditions in OAuth callback flow
- Weak RLS policy validation patterns

## Critical Issues

### CR-01: Null Pointer Dereference in Dashboard Layout

**File:** `src/app/dashboard/layout.tsx:23`
**Issue:** Code redirects to `/login` when user is not `enterprise` role, but doesn't check if `profile` is null. If the database query fails or profile doesn't exist, `profile?.role` will be undefined (not just a wrong role), causing an incorrect redirect behavior. User would be sent to login page instead of seeing proper error.
**Fix:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (!profile) {
  // Profile should exist for authenticated user - this indicates data inconsistency
  redirect('/error?message=' + encodeURIComponent('Profile not found. Please contact support.'))
}

if (profile.role !== 'enterprise') {
  redirect('/login')
}
```

### CR-02: Null Pointer Dereference in Portal Layout

**File:** `src/app/portal/layout.tsx:23`
**Issue:** Same issue as CR-01 - missing null check for profile before accessing `profile?.role`.
**Fix:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (!profile) {
  redirect('/error?message=' + encodeURIComponent('Profile not found. Please contact support.'))
}

if (profile.role !== 'practitioner') {
  redirect('/login')
}
```

### CR-03: Null Pointer Dereference in Admin Layout

**File:** `src/app/admin/layout.tsx:23`
**Issue:** Same issue as CR-01 and CR-02 - missing null check for profile.
**Fix:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (!profile) {
  redirect('/error?message=' + encodeURIComponent('Profile not found. Please contact support.'))
}

if (profile.role !== 'admin') {
  redirect('/login')
}
```

### CR-04: Non-Atomic User Assertion in Dashboard Page

**File:** `src/app/dashboard/page.tsx:11`
**Issue:** Code uses `user!.id` with non-null assertion operator, but there's no guarantee that `user` exists. The layout checks authentication, but this page component could theoretically be rendered separately or the user session could expire between layout execution and page render.
**Fix:**
```typescript
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()
  // ... rest of code
}
```

### CR-05: Non-Atomic User Assertion in Portal Pages

**File:** `src/app/portal/page.tsx:12`, `src/app/portal/pending/page.tsx:13`
**Issue:** Same as CR-04 - using `user!.id` without checking if user exists first.
**Fix:**
```typescript
// In both portal/page.tsx and portal/pending/page.tsx
export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Then use user.id safely
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('...')
    .eq('user_id', user.id)
    .single()
}
```

### CR-06: Silent Failure on Enterprise/Practitioner Record Creation

**File:** `src/actions/auth.ts:99`, `src/actions/auth.ts:146`
**Issue:** When enterprise or practitioner record creation fails after user signup, the error is only logged to console and user is redirected anyway. This creates an inconsistent state where auth.users has a record but the corresponding enterprise/practitioner table doesn't. User will see broken dashboard.
**Fix:**
```typescript
// For signupEnterprise (line 88-103)
const { error: enterpriseError } = await supabase
  .from('enterprises')
  .insert({
    user_id: authData.user.id,
    company_name: validated.data.companyName,
    company_size: validated.data.companySize || null,
    industry: validated.data.industry || null,
  })

if (enterpriseError) {
  console.error('Failed to create enterprise record:', enterpriseError)
  // Clean up: delete the auth user since we can't complete signup
  await supabase.auth.admin.deleteUser(authData.user.id)
  return { success: false, error: 'Failed to create account. Please try again.' }
}

redirect('/dashboard')

// Similar fix needed for signupPractitioner (line 135-149)
```

### CR-07: Race Condition in OAuth Callback Profile Creation

**File:** `src/app/(auth)/callback/route.ts:43-69`
**Issue:** The callback handler checks if profile exists, and if not, creates profile AND enterprise record. However, there's a trigger `handle_new_user()` in the migration that also creates profiles on signup. This could cause race condition or duplicate insert attempts. If the trigger runs slow, this code path executes; if trigger is fast, this is dead code. Additionally, if profile insert fails, it still creates enterprise record leading to orphaned data.
**Fix:**
```typescript
// After checking profile (line 43)
if (!profile) {
  // Trigger should have created profile - if missing, it's a system error
  // Try one upsert to be defensive, but log if this path executes frequently
  console.warn('Profile missing for OAuth user - trigger may have failed', { userId: user.id })

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      role: 'enterprise',
      display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('Failed to create profile:', profileError)
    return NextResponse.redirect(`${origin}/error?message=Account setup failed. Please contact support.`)
  }

  // Only create enterprise if profile creation succeeded
  const { error: enterpriseError } = await supabase
    .from('enterprises')
    .insert({
      user_id: user.id,
      company_name: user.user_metadata?.full_name || 'My Company',
    })

  if (enterpriseError) {
    console.error('Failed to create enterprise record:', enterpriseError)
    return NextResponse.redirect(`${origin}/error?message=Account setup incomplete. Please contact support.`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
```

## Warnings

### WR-01: Duplicate Authorization Logic in Server Actions

**File:** `src/actions/admin.ts:31-45`, `src/actions/admin.ts:69-83`, `src/actions/admin.ts:115-128`
**Issue:** All three admin server actions (`getPendingPractitioners`, `approvePractitioner`, `rejectPractitioner`) manually fetch the user and check if role is admin. This duplicates logic and means if RLS policies change, these checks might diverge. RLS policies should be the single source of truth for authorization.
**Fix:** Remove manual role checks and rely on RLS policies. If RLS policies are correctly configured (which they are in the migration), the query will simply return empty results or fail for non-admin users:
```typescript
export async function getPendingPractitioners(): Promise<{
  practitioners: PendingPractitioner[]
  error?: string
}> {
  const supabase = await createClient()

  // RLS policy "Admins can view all practitioners" handles authorization
  const { data: practitioners, error } = await supabase
    .from('practitioners')
    .select('id, user_id, full_name, bio, specializations, created_at')
    .eq('application_status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending practitioners:', error)
    return { practitioners: [], error: error.message }
  }

  return { practitioners: practitioners || [] }
}
```

Note: Keep manual checks if you want to provide better error messages to distinguish "not authorized" from "no data found", but current implementation has both defense-in-depth AND duplicated logic.

### WR-02: Missing Error Handling for Profile Queries

**File:** `src/actions/auth.ts:42-46`, `src/app/(auth)/callback/route.ts:29-38`
**Issue:** Profile queries check for data but don't check for `error` field from Supabase. If the database query fails (network issue, RLS policy denial), `data` will be null but no error will be logged or handled.
**Fix:**
```typescript
// In src/actions/auth.ts login function
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profileError) {
  console.error('Failed to fetch profile:', profileError)
  return { success: false, error: 'Failed to load account data' }
}

const role = profile?.role || 'enterprise'
```

### WR-03: Unvalidated Role Value from Database

**File:** `src/actions/auth.ts:48`
**Issue:** The code defaults role to 'enterprise' if profile is missing, but doesn't validate that the role from database is actually a valid `UserRole` enum value. If database has corrupted data or a role like 'superadmin', the redirect logic might fail silently.
**Fix:**
```typescript
const role = profile?.role || 'enterprise'

// Validate role is one of the expected values
const validRoles: UserRole[] = ['enterprise', 'practitioner', 'admin']
if (!validRoles.includes(role as UserRole)) {
  console.error('Invalid role in profile:', role)
  return { success: false, error: 'Account configuration error. Please contact support.' }
}

// Redirect based on role
if (role === 'admin') {
  redirect('/admin')
} else if (role === 'practitioner') {
  redirect('/portal')
} else {
  redirect('/dashboard')
}
```

### WR-04: Missing CSRF Protection on OAuth Button

**File:** `src/components/features/auth/oauth-buttons.tsx:13`
**Issue:** The OAuth button directly calls `signInWithGoogle()` server action on click without any rate limiting or CSRF token. While Supabase handles OAuth flow security, a malicious actor could potentially trigger many OAuth flows by scripting clicks, causing quota exhaustion or log spam.
**Fix:** Add rate limiting to OAuth initiation or use a form with Next.js Server Action CSRF protection:
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { signInWithGoogle } from '@/actions/auth'
import { useTransition } from 'react'

export function OAuthButtons() {
  const [isPending, startTransition] = useTransition()

  const handleGoogleSignIn = () => {
    startTransition(() => {
      signInWithGoogle()
    })
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isPending}
      >
        {/* ... SVG ... */}
        Continue with Google
      </Button>
    </div>
  )
}
```

Note: This is a minor improvement - the real protection comes from Supabase OAuth rate limits.

### WR-05: Potential XSS in Error Message Display

**File:** `src/app/(auth)/error/page.tsx:23`
**Issue:** Error message from query parameter is displayed directly without sanitization. While React escapes text by default, the URL parameter could contain encoded HTML entities that might render unexpectedly.
**Fix:** Explicitly sanitize or limit error messages:
```typescript
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams

  // Sanitize: take first 200 chars and strip any HTML-like patterns
  const rawMessage = params.message || 'An error occurred during authentication. Please try again.'
  const sanitizedMessage = rawMessage.slice(0, 200).replace(/<[^>]*>/g, '')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <CardTitle>Authentication Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          {sanitizedMessage}
        </p>
      </CardContent>
      {/* ... */}
    </Card>
  )
}
```

## Info

### IN-01: Console.error Logs in Production

**File:** Multiple files including `src/actions/admin.ts:55`, `src/actions/auth.ts:99`, `src/app/(auth)/callback/route.ts:16`
**Issue:** Console.error statements are used throughout for error logging. In production, these go to server logs but don't provide structured error tracking or alerting.
**Fix:** Consider integrating a proper error tracking service (Sentry, LogRocket, etc.) or structured logging:
```typescript
// Example with structured logging
import { logger } from '@/lib/logger'

// Instead of:
console.error('Error fetching pending practitioners:', error)

// Use:
logger.error('Failed to fetch pending practitioners', {
  error: error.message,
  code: error.code,
  userId: user?.id,
})
```

### IN-02: Magic String for Hardcoded Company Name

**File:** `src/app/(auth)/callback/route.ts:62`
**Issue:** OAuth users without a full_name get a company_name of 'My Company' which is a magic string and could cause confusion.
**Fix:** Use a constant or prompt user to complete profile:
```typescript
const DEFAULT_COMPANY_NAME = 'My Organization' // Or prompt for this in onboarding

const { error: enterpriseError } = await supabase
  .from('enterprises')
  .insert({
    user_id: user.id,
    company_name: user.user_metadata?.full_name || DEFAULT_COMPANY_NAME,
  })
```

### IN-03: Unused Email Field in PendingPractitioner Type

**File:** `src/actions/admin.ts:18`
**Issue:** `PendingPractitioner` type includes `email?: string` but this field is never selected in the query (line 50). Either the type is wrong or the query should fetch email from profiles table.
**Fix:** Either remove from type if not needed or join with profiles:
```typescript
// Option 1: Remove from type if not needed
export type PendingPractitioner = {
  id: string
  user_id: string
  full_name: string
  bio: string | null
  specializations: string[] | null
  created_at: string
  // email removed
}

// Option 2: Join with profiles to get email
const { data: practitioners, error } = await supabase
  .from('practitioners')
  .select(`
    id,
    user_id,
    full_name,
    bio,
    specializations,
    created_at,
    profiles!inner(id)
  `)
  .eq('application_status', 'pending')
  .order('created_at', { ascending: true })

// Then access via join
```

---

_Reviewed: 2026-04-10T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
