'use client'

import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useBookingWizard } from '@/lib/stores/booking-wizard'
import { calculateBookableSlots, COMMON_TIMEZONES } from '@/lib/utils/timezone'
import type { Database } from '@/types/database'

type AvailabilityRule = Database['public']['Tables']['availability_rules']['Row']
type AvailabilityException = Database['public']['Tables']['availability_exceptions']['Row']

interface StepSlotPickerProps {
  rules: AvailabilityRule[]
  exceptions: AvailabilityException[]
  bookedSlots: { start: string; end: string }[]
}

export function StepSlotPicker({ rules, exceptions, bookedSlots }: StepSlotPickerProps) {
  const {
    sessionDuration,
    selectedSlot,
    setSelectedSlot,
    timezone,
    setTimezone,
    nextStep,
    prevStep,
  } = useBookingWizard()

  // Generate available events from rules for FullCalendar
  const availableEvents = useMemo(() => {
    if (!sessionDuration) return []

    return rules.flatMap((rule) => {
      // Calculate bookable start times for this rule
      const slots = calculateBookableSlots(
        rule.start_time.slice(0, 5), // HH:mm
        rule.end_time.slice(0, 5),
        sessionDuration
      )

      return slots.map((startTime) => {
        // Calculate end time based on session duration
        const [startHour, startMin] = startTime.split(':').map(Number)
        const totalMinutes = startHour * 60 + startMin + sessionDuration
        const endHour = Math.floor(totalMinutes / 60)
        const endMin = totalMinutes % 60
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

        return {
          daysOfWeek: [rule.day_of_week],
          startTime,
          endTime,
          display: 'background' as const,
          color: '#22c55e', // green available
          extendedProps: { ruleId: rule.id },
        }
      })
    })
  }, [rules, sessionDuration])

  // Blocked dates from exceptions
  const blockedEvents = useMemo(() => {
    return exceptions
      .filter((e) => e.is_blocked)
      .map((e) => ({
        start: e.exception_date,
        end: e.exception_date,
        allDay: true,
        display: 'background' as const,
        color: '#ef4444', // red blocked
      }))
  }, [exceptions])

  // Already booked slots
  const bookedEvents = useMemo(() => {
    return bookedSlots.map((slot) => ({
      start: slot.start,
      end: slot.end,
      display: 'background' as const,
      color: '#94a3b8', // gray booked
    }))
  }, [bookedSlots])

  const handleDateClick = (info: { dateStr: string; date: Date }) => {
    // Check if this slot is available
    const date = info.dateStr.split('T')[0]
    const time = info.dateStr.split('T')[1]?.slice(0, 5) || '00:00'

    // Validate it's on an available slot (simplified check)
    const dayOfWeek = info.date.getDay()
    const matchingRule = rules.find((r) => r.day_of_week === dayOfWeek)

    if (matchingRule) {
      setSelectedSlot({ date, startTime: time })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Time Slot</h2>
        <p className="text-muted-foreground mt-1">
          Choose an available time that works for you
        </p>
      </div>

      {/* Timezone selector */}
      <div className="space-y-2">
        <Label>Your timezone</Label>
        <Select value={timezone} onValueChange={(value) => value && setTimezone(value)}>
          <SelectTrigger className="w-[280px]">
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
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>Blocked</span>
        </div>
      </div>

      {/* Calendar per D-07 */}
      <div className="border rounded-lg p-4 bg-white">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay',
          }}
          selectable={true}
          dateClick={handleDateClick}
          events={[...availableEvents, ...blockedEvents, ...bookedEvents]}
          slotDuration="00:30:00"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          height="auto"
          validRange={{
            start: new Date().toISOString().split('T')[0], // No past dates
          }}
        />
      </div>

      {/* Selected slot display */}
      {selectedSlot && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="font-medium">Selected: {selectedSlot.date} at {selectedSlot.startTime}</p>
          <p className="text-sm text-muted-foreground">
            {sessionDuration} minute session
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep} disabled={!selectedSlot}>
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
