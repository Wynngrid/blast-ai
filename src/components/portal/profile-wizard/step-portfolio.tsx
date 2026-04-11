'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useWizardStore } from '@/lib/stores/wizard-store'
import { unfurlPortfolioUrl } from '@/actions/portfolio'
import { Loader2, ExternalLink, Trash2 } from 'lucide-react'
import type { PortfolioItemInput } from '@/lib/validations/profile'

export function StepPortfolio() {
  const { stepData, setStepData, nextStep } = useWizardStore()
  const [urlInput, setUrlInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<PortfolioItemInput[]>(
    stepData.portfolio?.items || []
  )

  const addItem = async () => {
    if (!urlInput.trim()) return

    setIsLoading(true)
    try {
      const result = await unfurlPortfolioUrl(urlInput.trim())
      if (result.data) {
        const newItem: PortfolioItemInput = {
          url: result.data.url,
          title: result.data.title,
          description: result.data.description || undefined,
          thumbnailUrl: result.data.image || undefined,
        }
        setItems([...items, newItem])
        setUrlInput('')
      }
    } catch {
      // Still add the URL even if unfurl fails
      setItems([...items, { url: urlInput.trim() }])
      setUrlInput('')
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    setStepData('portfolio', { items })
    nextStep()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Portfolio Items (per D-02)</Label>
        <p className="text-sm text-muted-foreground">
          Add links to your shipped work (Behance, Dribbble, YouTube, GitHub, etc.)
        </p>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            disabled={isLoading || items.length >= 10}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem()
              }
            }}
          />
          <Button
            type="button"
            onClick={addItem}
            disabled={isLoading || !urlInput.trim() || items.length >= 10}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {items.length}/10 items. URL metadata is auto-fetched.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex gap-4">
              {item.thumbnailUrl && (
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title || item.url}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {(() => {
                    try {
                      return new URL(item.url).hostname
                    } catch {
                      return item.url
                    }
                  })()}
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
