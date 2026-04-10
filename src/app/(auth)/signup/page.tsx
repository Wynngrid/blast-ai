import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, User } from 'lucide-react'

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Choose how you want to use BLAST AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link href="/signup/enterprise" className="block">
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex flex-col items-start gap-1"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">Enterprise</span>
            </div>
            <span className="text-sm text-gray-500 font-normal">
              Book AI practitioners for your team
            </span>
          </Button>
        </Link>

        <Link href="/signup/practitioner" className="block">
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex flex-col items-start gap-1"
          >
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-semibold">Practitioner</span>
            </div>
            <span className="text-sm text-gray-500 font-normal">
              Mentor enterprises on AI projects
            </span>
          </Button>
        </Link>

        <p className="text-center text-sm text-gray-500 pt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[hsl(var(--brand))] hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
