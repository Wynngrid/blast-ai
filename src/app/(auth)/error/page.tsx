import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams

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
          {params.message || 'An error occurred during authentication. Please try again.'}
        </p>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="w-full">
          <Button className="w-full">Back to login</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
