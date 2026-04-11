'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  saveAvailabilityRules,
  addException,
  deleteException,
} from '@/actions/availability'
import { getUserTimezone, COMMON_TIMEZONES, generateTimeSlots, getAvailableSessionTypes } from '@/lib/utils/timezone'
import { DAY_ABBREVIATIONS } from '@/lib/validations/availability'
import { SESSION_DURATIONS, SLOT_CONFIG } from '@/lib/constants/specializations'
import { toast } from 'sonner'
import { Trash2, Plus, Calendar, Clock, Info } from 'lucide-react'

interface AvailabilityRule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  timezone: string
}

interface AvailabilityException {
  id: string
  exception_date: string
  is_blocked: boolean
  reason: string | null
}

interface AvailabilityCalendarProps {
  initialRules: AvailabilityRule[]
  initialExceptions: AvailabilityException[]
  practitionerId: string
}

export function AvailabilityCalendar({
  initialRules,
  initialExceptions,
}: AvailabilityCalendarProps) {
  const [rules, setRules] = useState(initialRules)
  const [exceptions, setExceptions] = useState(initialExceptions)
  const [timezone, setTimezone] = useState(
    initialRules[0]?.timezone || getUserTimezone()
  )
  const [isSaving, setIsSaving] = useState(false)

  // New rule form state
  const [newRule, setNewRule] = useState({
    dayOfWeek: 1, // Monday default
    startTime: '09:00',
    endTime: '17:00',
  })

  // New exception form state
  const [newExceptionDate, setNewExceptionDate] = useState('')

  const timeSlots = generateTimeSlots()

  // Convert rules to FullCalendar events
  const calendarEvents = [
    // Recurring availability (green background)
    ...rules.map((rule) => ({
      groupId: `rule-${rule.id}`,
      daysOfWeek: [rule.day_of_week],
      startTime: rule.start_time.slice(0, 5), // "09:00:00" -> "09:00"
      endTime: rule.end_time.slice(0, 5),
      display: 'background' as const,
      color: '#22c55e', // green-500
    })),
    // Blocked dates (red)
    ...exceptions
      .filter((e) => e.is_blocked)
      .map((exception) => ({
        id: `exception-${exception.id}`,
        start: exception.exception_date,
        allDay: true,
        display: 'background' as const,
        color: '#ef4444', // red-500
        title: exception.reason || 'Blocked',
      })),
  ]

  const handleAddRule = () => {
    // Client-side add (will be saved with bulk save)
    const tempRule: AvailabilityRule = {
      id: `temp-${Date.now()}`,
      day_of_week: newRule.dayOfWeek,
      start_time: newRule.startTime + ':00',
      end_time: newRule.endTime + ':00',
      timezone,
    }
    setRules([...rules, tempRule])
  }

  const handleRemoveRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId))
  }

  const handleSaveRules = async () => {
    setIsSaving(true)
    try {
      const result = await saveAvailabilityRules({
        rules: rules.map((r) => ({
          dayOfWeek: r.day_of_week,
          startTime: r.start_time.slice(0, 5),
          endTime: r.end_time.slice(0, 5),
        })),
        timezone,
      })

      if (result.success) {
        toast.success('Availability saved')
      } else {
        toast.error(result.error || 'Failed to save')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddException = async () => {
    if (!newExceptionDate) return

    const result = await addException(newExceptionDate)
    if (result.success) {
      setExceptions([
        ...exceptions,
        {
          id: `temp-${Date.now()}`,
          exception_date: newExceptionDate,
          is_blocked: true,
          reason: null,
        },
      ])
      setNewExceptionDate('')
      toast.success('Date blocked')
    } else {
      toast.error(result.error || 'Failed to block date')
    }
  }

  const handleRemoveException = async (exceptionId: string) => {
    const result = await deleteException(exceptionId)
    if (result.success) {
      setExceptions(exceptions.filter((e) => e.id !== exceptionId))
      toast.success('Date unblocked')
    } else {
      toast.error(result.error || 'Failed to unblock')
    }
  }

  // Calculate available session types for current new rule
  const availableSessionTypes = getAvailableSessionTypes(newRule.startTime, newRule.endTime)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar View */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Preview</CardTitle>
            <CardDescription>
              Green = available, Red = blocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek',
              }}
              events={calendarEvents}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={true}
              weekends={true}
              nowIndicator={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      <div className="space-y-6">
        {/* Session Types Info (per D-05) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Session Types (D-05)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Available session durations:
            </p>
            <div className="flex flex-wrap gap-2">
              {SESSION_DURATIONS.map((duration) => (
                <span
                  key={duration}
                  className="px-2 py-1 bg-muted rounded text-sm font-medium"
                >
                  {duration} min
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {SLOT_CONFIG.BUFFER_MINUTES}-min buffer between sessions (D-06)
            </p>
          </CardContent>
        </Card>

        {/* Timezone Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timezone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={timezone} onValueChange={(value) => value && setTimezone(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>
              Add recurring availability per D-04
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Rule Form */}
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={newRule.dayOfWeek.toString()}
                onValueChange={(v) =>
                  v && setNewRule({ ...newRule, dayOfWeek: parseInt(v) })
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_ABBREVIATIONS.map((day, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newRule.startTime}
                onValueChange={(v) => v && setNewRule({ ...newRule, startTime: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newRule.endTime}
                onValueChange={(v) => v && setNewRule({ ...newRule, endTime: v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show which session types fit this window */}
            {availableSessionTypes.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Fits: {availableSessionTypes.map(d => `${d}min`).join(', ')} sessions
              </p>
            ) : (
              <p className="text-xs text-amber-600">
                Window too short for any session type
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddRule}
              disabled={availableSessionTypes.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Time Block
            </Button>

            {/* Current Rules */}
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <span>
                    {DAY_ABBREVIATIONS[rule.day_of_week]}{' '}
                    {rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveRule(rule.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {rules.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No availability set
                </p>
              )}
            </div>

            <Button
              onClick={handleSaveRules}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Schedule'}
            </Button>
          </CardContent>
        </Card>

        {/* Block Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Block Dates</CardTitle>
            <CardDescription>
              Block specific dates when you are unavailable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="date"
                value={newExceptionDate}
                onChange={(e) => setNewExceptionDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddException}
                disabled={!newExceptionDate}
              >
                Block
              </Button>
            </div>

            <div className="space-y-2">
              {exceptions.map((exception) => (
                <div
                  key={exception.id}
                  className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm"
                >
                  <span>{exception.exception_date}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveException(exception.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {exceptions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No blocked dates
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
