'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { approvePractitioner, rejectPractitioner, type PendingPractitioner } from '@/actions/admin'
import { Check, X, Loader2 } from 'lucide-react'

interface PendingPractitionersListProps {
  practitioners: PendingPractitioner[]
}

export function PendingPractitionersList({ practitioners }: PendingPractitionersListProps) {
  const [isPending, startTransition] = useTransition()
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleApprove(id: string) {
    setActioningId(id)
    setError(null)
    startTransition(async () => {
      const result = await approvePractitioner(id)
      if (!result.success) {
        setError(result.error || 'Failed to approve')
      }
      setActioningId(null)
    })
  }

  function handleReject(id: string) {
    setActioningId(id)
    setError(null)
    startTransition(async () => {
      const result = await rejectPractitioner(id)
      if (!result.success) {
        setError(result.error || 'Failed to reject')
      }
      setActioningId(null)
    })
  }

  if (practitioners.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No pending applications</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {practitioners.map((practitioner) => {
        const isActioning = isPending && actioningId === practitioner.id
        const appliedDate = new Date(practitioner.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })

        return (
          <Card key={practitioner.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{practitioner.full_name}</CardTitle>
                  <CardDescription>Applied: {appliedDate}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleApprove(practitioner.id)}
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleReject(practitioner.id)}
                    disabled={isActioning}
                  >
                    {isActioning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {practitioner.bio && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Bio</h4>
                  <p className="text-sm text-gray-600">{practitioner.bio}</p>
                </div>
              )}
              {practitioner.specializations && practitioner.specializations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                    {practitioner.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
