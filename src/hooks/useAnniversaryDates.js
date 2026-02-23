import { useMemo } from 'react'
import { useBrochureStore } from '../stores/brochureStore'
import { useReminderStore } from '../stores/reminderStore'

function parseDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

function getNextAnniversary(originalDate) {
  if (!originalDate) return null
  const now = new Date()
  const thisYear = now.getFullYear()

  // Try this year
  const anniversary = new Date(thisYear, originalDate.getMonth(), originalDate.getDate())
  if (anniversary < now) {
    // Already passed this year, use next year
    anniversary.setFullYear(thisYear + 1)
  }
  return anniversary
}

function daysUntil(date) {
  if (!date) return Infinity
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

function getYearsSince(originalDate) {
  if (!originalDate) return 0
  const now = new Date()
  return now.getFullYear() - originalDate.getFullYear()
}

export function useAnniversaryDates() {
  const dateOfBirth = useBrochureStore(s => s.dateOfBirth)
  const dateOfDeath = useBrochureStore(s => s.dateOfDeath)
  const funeralDate = useBrochureStore(s => s.funeralDate)
  const fullName = useBrochureStore(s => s.fullName)
  const customReminders = useReminderStore(s => s.customReminders)

  return useMemo(() => {
    const dates = []

    const dob = parseDate(dateOfBirth)
    const dod = parseDate(dateOfDeath)
    const fd = parseDate(funeralDate)

    if (dob) {
      const next = getNextAnniversary(dob)
      dates.push({
        id: 'birthday',
        label: `${fullName || 'Deceased'}'s Birthday`,
        originalDate: dob,
        nextDate: next,
        daysUntil: daysUntil(next),
        yearsSince: getYearsSince(dob),
        type: 'birthday',
        isAutomatic: true,
      })
    }

    if (dod) {
      const next = getNextAnniversary(dod)
      dates.push({
        id: 'death-anniversary',
        label: `Death Anniversary`,
        originalDate: dod,
        nextDate: next,
        daysUntil: daysUntil(next),
        yearsSince: getYearsSince(dod),
        type: 'death',
        isAutomatic: true,
      })
    }

    if (fd) {
      const next = getNextAnniversary(fd)
      dates.push({
        id: 'funeral-anniversary',
        label: `Funeral Anniversary`,
        originalDate: fd,
        nextDate: next,
        daysUntil: daysUntil(next),
        yearsSince: getYearsSince(fd),
        type: 'funeral',
        isAutomatic: true,
      })
    }

    // Add custom reminders
    for (const rem of customReminders) {
      const d = parseDate(rem.date)
      if (d) {
        const next = getNextAnniversary(d)
        dates.push({
          id: rem.id,
          label: rem.label,
          originalDate: d,
          nextDate: next,
          daysUntil: daysUntil(next),
          yearsSince: getYearsSince(d),
          type: 'custom',
          isAutomatic: false,
          notifyBefore: rem.notifyBefore,
        })
      }
    }

    // Sort by days until
    dates.sort((a, b) => a.daysUntil - b.daysUntil)

    return dates
  }, [dateOfBirth, dateOfDeath, funeralDate, fullName, customReminders])
}
