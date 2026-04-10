'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { enterpriseSignupSchema, type EnterpriseSignupInput } from '@/lib/validations/auth'
import { signupEnterprise } from '@/actions/auth'
import { OAuthButtons } from './oauth-buttons'

export function EnterpriseSignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EnterpriseSignupInput>({
    resolver: zodResolver(enterpriseSignupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      displayName: '',
      companySize: '',
      industry: '',
    },
  })

  async function onSubmit(data: EnterpriseSignupInput) {
    setIsLoading(true)
    setError(null)

    const result = await signupEnterprise(data)

    if (!result.success && result.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create enterprise account</CardTitle>
        <CardDescription>
          Get access to vetted AI practitioners for your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Your name</Label>
            <Input
              id="displayName"
              placeholder="Jane Smith"
              {...form.register('displayName')}
            />
            {form.formState.errors.displayName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              placeholder="Acme Inc."
              {...form.register('companyName')}
            />
            {form.formState.errors.companyName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center text-sm">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-[hsl(var(--brand))] hover:underline">
            Sign in
          </Link>
        </p>
        <p>
          Want to become a practitioner?{' '}
          <Link href="/signup/practitioner" className="text-[hsl(var(--brand))] hover:underline">
            Apply here
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
