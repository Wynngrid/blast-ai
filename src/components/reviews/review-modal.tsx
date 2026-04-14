'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StarRating } from './star-rating'
import { NPSInput } from './nps-input'
import { OutcomeSelect } from './outcome-select'
import { reviewSchema, sessionOutcomeSchema, type ReviewFormData, type OutcomeTag } from '@/lib/schemas/review'
import { submitReview } from '@/actions/reviews'
import { Loader2 } from 'lucide-react'

interface ReviewModalProps {
  bookingId: string
  practitionerName: string
  isOpen: boolean
  onComplete: () => void
}

export function ReviewModal({ bookingId, practitionerName, isOpen, onComplete }: ReviewModalProps) {
  const [step, setStep] = useState<'outcome' | 'review'>('outcome')
  const [outcomeTags, setOutcomeTags] = useState<OutcomeTag[]>([])
  const [outcomeNotes, setOutcomeNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      bookingId,
      communicationRating: 0,
      expertiseRating: 0,
      helpfulnessRating: 0,
      npsScore: -1, // -1 indicates not selected
      comment: '',
    },
  })

  const npsScore = form.watch('npsScore')
  const showCommentRequired = npsScore >= 0 && npsScore <= 6

  // Block navigation per D-06
  useEffect(() => {
    if (!isOpen) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'You have an incomplete review. Are you sure you want to leave?'
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isOpen])

  if (!isOpen) return null

  const handleOutcomeNext = () => {
    const result = sessionOutcomeSchema.safeParse({
      bookingId,
      outcomeTags,
      notes: outcomeNotes || undefined,
    })

    if (!result.success) {
      setError('Please select at least one outcome')
      return
    }

    setError(null)
    setStep('review')
  }

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitReview({
        review: {
          ...data,
          npsScore: data.npsScore,
        },
        outcome: {
          bookingId,
          outcomeTags,
          notes: outcomeNotes || undefined,
        },
      })

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      onComplete()
    } catch {
      setError('Failed to submit review. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex min-h-screen flex-col">
        {/* Header - no close button per D-06 */}
        <header className="border-b bg-background px-6 py-4">
          <h1 className="text-xl font-semibold">Review Your Session</h1>
          <p className="text-sm text-muted-foreground">with {practitionerName}</p>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {step === 'outcome' ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium">Session Outcome</h2>
                  <p className="text-sm text-muted-foreground">
                    Help us understand what you accomplished in this session.
                  </p>
                </div>

                <OutcomeSelect
                  selectedTags={outcomeTags}
                  onTagsChange={setOutcomeTags}
                  notes={outcomeNotes}
                  onNotesChange={setOutcomeNotes}
                />

                <div className="flex justify-end pt-4">
                  <Button onClick={handleOutcomeNext} disabled={outcomeTags.length === 0}>
                    Continue to Review
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium">Rate Your Experience</h2>
                  <p className="text-sm text-muted-foreground">
                    Your feedback helps other enterprises and the practitioner.
                  </p>
                </div>

                {/* Multi-criteria ratings per D-07 */}
                <div className="space-y-6">
                  <StarRating
                    label="Communication"
                    value={form.watch('communicationRating')}
                    onChange={(v) => form.setValue('communicationRating', v)}
                  />
                  <StarRating
                    label="Expertise"
                    value={form.watch('expertiseRating')}
                    onChange={(v) => form.setValue('expertiseRating', v)}
                  />
                  <StarRating
                    label="Helpfulness"
                    value={form.watch('helpfulnessRating')}
                    onChange={(v) => form.setValue('helpfulnessRating', v)}
                  />
                </div>

                {/* NPS per REV-01 */}
                <NPSInput
                  value={form.watch('npsScore') >= 0 ? form.watch('npsScore') : null}
                  onChange={(v) => form.setValue('npsScore', v)}
                />

                {/* Comment per D-08 */}
                <div>
                  <Label htmlFor="comment">
                    {showCommentRequired ? 'Please tell us why (required)' : 'Additional comments (optional)'}
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder={
                      showCommentRequired
                        ? 'Help us understand your rating so we can improve...'
                        : 'Share your experience with this practitioner...'
                    }
                    {...form.register('comment')}
                    className="mt-1.5"
                    rows={4}
                  />
                  {form.formState.errors.comment && (
                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.comment.message}</p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep('outcome')}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Review
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
