import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'
import { SLOT_CONFIG, SESSION_DURATIONS, type SessionDuration } from '@/lib/constants/specializations'

/**
 * Get user's timezone from browser
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format a UTC date in the user's timezone
 */
export function formatInUserTimezone(
  utcDate: Date | string,
  formatStr: string,
  timezone?: string
): string {
  const tz = timezone || getUserTimezone()
  return formatInTimeZone(utcDate, tz, formatStr)
}

/**
 * Convert a local time string to UTC for storage
 * @param localTime - Time in "HH:mm" format
 * @param date - Reference date for DST calculation
 * @param timezone - IANA timezone identifier
 */
export function localTimeToUTC(
  localTime: string,
  date: Date,
  timezone: string
): string {
  const [hours, minutes] = localTime.split(':').map(Number)
  const localDate = new Date(date)
  localDate.setHours(hours, minutes, 0, 0)
  const utcDate = fromZonedTime(localDate, timezone)
  return format(utcDate, 'HH:mm:ss')
}

/**
 * Convert a UTC time to local for display
 * @param utcTime - Time in "HH:mm:ss" format
 * @param date - Reference date for DST calculation
 * @param timezone - IANA timezone identifier
 */
export function utcTimeToLocal(
  utcTime: string,
  date: Date,
  timezone: string
): string {
  const [hours, minutes] = utcTime.split(':').map(Number)
  const utcDate = new Date(date)
  utcDate.setUTCHours(hours, minutes, 0, 0)
  const localDate = toZonedTime(utcDate, timezone)
  return format(localDate, 'HH:mm')
}

/**
 * Get list of common timezones for dropdown
 */
export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
] as const

/**
 * Generate time slots for a day (30-min intervals per D-05)
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_CONFIG.BASE_SLOT_MINUTES) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }
  return slots
}

/**
 * Calculate bookable session slots from availability window
 * Per D-05: Session types are 20, 40, 60, 90 minutes
 * Per D-06: 15-minute buffer between sessions
 *
 * @param startTime - Start of availability window (HH:mm)
 * @param endTime - End of availability window (HH:mm)
 * @param sessionDuration - Desired session duration in minutes
 * @returns Array of bookable start times
 */
export function calculateBookableSlots(
  startTime: string,
  endTime: string,
  sessionDuration: SessionDuration
): string[] {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  // Total time needed: session + buffer
  const totalSlotTime = sessionDuration + SLOT_CONFIG.BUFFER_MINUTES

  let currentMinutes = startMinutes

  while (currentMinutes + sessionDuration <= endMinutes) {
    const hour = Math.floor(currentMinutes / 60)
    const minute = currentMinutes % 60
    slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)

    // Next slot starts after session + buffer
    currentMinutes += totalSlotTime
  }

  return slots
}

/**
 * Check if a time window can fit a session type
 * Per D-05 and D-06
 */
export function canFitSession(
  windowStartTime: string,
  windowEndTime: string,
  sessionDuration: SessionDuration
): boolean {
  const [startHour, startMin] = windowStartTime.split(':').map(Number)
  const [endHour, endMin] = windowEndTime.split(':').map(Number)

  const windowMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)

  // Session duration + buffer must fit in window
  return windowMinutes >= sessionDuration + SLOT_CONFIG.BUFFER_MINUTES
}

/**
 * Get session duration options that fit in a time window
 */
export function getAvailableSessionTypes(
  windowStartTime: string,
  windowEndTime: string
): SessionDuration[] {
  return SESSION_DURATIONS.filter(duration =>
    canFitSession(windowStartTime, windowEndTime, duration)
  )
}
