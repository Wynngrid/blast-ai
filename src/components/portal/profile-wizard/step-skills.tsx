'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useWizardStore } from '@/lib/stores/wizard-store'
import { skillsSchema, type SkillsInput } from '@/lib/validations/profile'
import { SPECIALIZATION_CATEGORIES } from '@/lib/constants/specializations'
import { useState } from 'react'

export function StepSkills() {
  const { stepData, setStepData, nextStep } = useWizardStore()
  const [toolInput, setToolInput] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SkillsInput>({
    resolver: zodResolver(skillsSchema),
    defaultValues: stepData.skills || {
      specializations: [],
      tools: [],
      industries: [],
    },
  })

  const selectedSpecs = watch('specializations')
  const tools = watch('tools')

  const onSubmit = (data: SkillsInput) => {
    setStepData('skills', data)
    nextStep()
  }

  const addTool = () => {
    if (toolInput.trim() && !tools.includes(toolInput.trim())) {
      setValue('tools', [...tools, toolInput.trim()])
      setToolInput('')
    }
  }

  const removeTool = (tool: string) => {
    setValue('tools', tools.filter(t => t !== tool))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        <Label>Specializations (per D-12, D-13)</Label>
        <p className="text-sm text-muted-foreground">
          Select the areas where you can help enterprises
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SPECIALIZATION_CATEGORIES.map((cat) => (
            <Controller
              key={cat.id}
              name="specializations"
              control={control}
              render={({ field }) => (
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <Checkbox
                    checked={field.value.includes(cat.id)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...field.value, cat.id]
                        : field.value.filter(v => v !== cat.id)
                      field.onChange(updated)
                    }}
                  />
                  <div>
                    <p className="font-medium text-sm">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </label>
              )}
            />
          ))}
        </div>
        {errors.specializations && (
          <p className="text-sm text-destructive">{errors.specializations.message}</p>
        )}

        {selectedSpecs.includes('other') && (
          <div className="mt-2">
            <Input
              {...register('otherSpecialization')}
              placeholder="Describe your niche specialization"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Tools & Stack</Label>
        <p className="text-sm text-muted-foreground">
          Add the tools, frameworks, and platforms you work with
        </p>
        <div className="flex gap-2">
          <Input
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            placeholder="e.g., PyTorch, LangChain, OpenAI API"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTool()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTool}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
            >
              {tool}
              <button
                type="button"
                onClick={() => removeTool(tool)}
                className="text-muted-foreground hover:text-foreground"
              >
                x
              </button>
            </span>
          ))}
        </div>
        {errors.tools && (
          <p className="text-sm text-destructive">{errors.tools.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  )
}
