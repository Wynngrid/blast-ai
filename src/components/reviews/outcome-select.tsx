'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type OutcomeTag } from '@/lib/schemas/review'

interface OutcomeSelectProps {
  selectedTags: OutcomeTag[]
  onTagsChange: (tags: OutcomeTag[]) => void
  notes: string
  onNotesChange: (notes: string) => void
}

const outcomeOptions: { value: OutcomeTag; label: string; description: string }[] = [
  { value: 'skill_learned', label: 'Skill Learned', description: 'Acquired a new skill or technique' },
  { value: 'blocker_resolved', label: 'Blocker Resolved', description: 'Solved a specific problem I was stuck on' },
  { value: 'need_followup', label: 'Need Follow-up', description: 'Would benefit from another session' },
  { value: 'not_helpful', label: 'Not Helpful', description: 'Session did not meet expectations' },
]

export function OutcomeSelect({ selectedTags, onTagsChange, notes, onNotesChange }: OutcomeSelectProps) {
  const toggleTag = (tag: OutcomeTag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">
          What was the outcome of this session? (Select all that apply)
        </label>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {outcomeOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
              onClick={() => toggleTag(option.value)}
            >
              <Checkbox
                id={option.value}
                checked={selectedTags.includes(option.value)}
                onCheckedChange={() => toggleTag(option.value)}
              />
              <div className="space-y-1">
                <Label htmlFor={option.value} className="font-medium cursor-pointer">
                  {option.label}
                </Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="outcome-notes">Additional notes (optional)</Label>
        <Textarea
          id="outcome-notes"
          placeholder="Any additional context about the session outcome..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="mt-1.5"
          rows={3}
        />
      </div>
    </div>
  )
}
