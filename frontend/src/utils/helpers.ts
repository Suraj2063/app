import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM dd, yyyy')
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} at ${formatTime(time)}`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function getPriceRange(range: number): string {
  return '$'.repeat(range)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-success',
    cancelled: 'badge-error',
    completed: 'badge-info',
    no_show: 'badge-gray',
    available: 'badge-success',
    occupied: 'badge-error',
    reserved: 'badge-warning',
    maintenance: 'badge-gray',
  }
  return colors[status] || 'badge-gray'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateTimeSlots(openTime: string, closeTime: string, interval = 30): string[] {
  const slots: string[] = []
  const [openHour, openMin] = openTime.split(':').map(Number)
  const [closeHour, closeMin] = closeTime.split(':').map(Number)

  let currentMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin

  while (currentMinutes < closeMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    currentMinutes += interval
  }

  return slots
}

export const CUISINE_TYPES = [
  'Italian',
  'Chinese',
  'Japanese',
  'Mexican',
  'Indian',
  'American',
  'French',
  'Thai',
  'Mediterranean',
  'Greek',
  'Spanish',
  'Korean',
  'Vietnamese',
  'Middle Eastern',
  'Caribbean',
  'Other',
]

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
