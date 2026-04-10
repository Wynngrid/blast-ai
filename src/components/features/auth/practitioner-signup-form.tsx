'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { practitionerSignupSchema, type PractitionerSignupInput } from '@/lib/validations/auth'
import { signupPractitioner } from '@/actions/auth'

const SPECIALIZATIONS = [
  'Machine Learning',
  'Natural Language Processing',
  'Computer Vision',
  'MLOps',
  'Data Engineering',
  'AI Strategy',
  'Generative AI',
  'Reinforcement Learning',
]

export function PractitionerSignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PractitionerSignupInput>({
    resolver: zodResolver(practitionerSignupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      bio: '',
      specializations: [],
    },
  })

  const selectedSpecs = form.watch('specializations')

  function toggleSpecialization(spec: string) {
    const current = form.getValues('specializations')
    if (current.includes(spec)) {
      form.setValue('specializations', current.filter(s => s !== spec))
    } else {
      form.setValue('specializations', [...current, spec])
    }
  }

  async function onSubmit(data: PractitionerSignupInput) {
    setIsLoading(true)
    setError(null)

    const result = await signupPractitioner(data)

    if (!result.success && result.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply as a practitioner</CardTitle>
        <CardDescription>
          Join our vetted network of AI experts. Applications are reviewed within 48 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              placeholder="Dr. Jane Smith"
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your AI experience, projects you've shipped, and what you can help teams with..."
              rows={4}
              {...form.register('bio')}
            />
            {form.formState.errors.bio && (
              <p className="text-sm text-red-500">
                {form.formState.errors.bio.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {form.watch('bio')?.length || 0}/500 characters (min 50)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALIZATIONS.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox
                    id={spec}
                    checked={selectedSpecs.includes(spec)}
                    onCheckedChange={() => toggleSpecialization(spec)}
                  />
                  <label
                    htmlFor={spec}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {spec}
                  </label>
                </div>
              ))}
            </div>
            {form.formState.errors.specializations && (
              <p className="text-sm text-red-500">
                {form.formState.errors.specializations.message}
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
            {isLoading ? 'Submitting application...' : 'Submit application'}
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
          Looking to hire practitioners?{' '}
          <Link href="/signup/enterprise" className="text-[hsl(var(--brand))] hover:underline">
            Create enterprise account
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
